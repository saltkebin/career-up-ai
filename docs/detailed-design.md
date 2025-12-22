# 詳細設計書

## 目次

1. [賃金3%増額計算ロジック](#1-賃金3増額計算ロジック)
2. [申請様式と書類仕様](#2-申請様式と書類仕様)
3. [競合分析と差別化戦略](#3-競合分析と差別化戦略)
4. [データモデル詳細設計](#4-データモデル詳細設計)
5. [通知・リマインダー設計](#5-通知リマインダー設計)
6. [よくある誤解とUI対策](#6-よくある誤解とui対策)

---

## 1. 賃金3%増額計算ロジック

### 1.1 計算の基本原則

転換前6ヶ月間の賃金総額と転換後6ヶ月間の賃金総額を比較し、**3%以上の増額**を確認する。

```
増額率 = (転換後6ヶ月賃金総額 - 転換前6ヶ月賃金総額) / 転換前6ヶ月賃金総額 × 100

判定: 増額率 >= 3.0% → 要件クリア
```

### 1.2 賃金総額に含める項目

| 区分 | 項目 | 含める |
|------|------|:------:|
| 基本給 | 月額基本給 | ✅ |
| 固定手当 | 役職手当、資格手当、職務手当 | ✅ |
| 固定手当 | 家族手当、扶養手当 | ✅ |
| 固定手当 | 地域手当 | ✅ |

### 1.3 賃金総額から除外する項目

| 区分 | 項目 | 除外理由 |
|------|------|----------|
| 実費補填 | 通勤手当 | 就業場所までの交通費補填 |
| 実費補填 | 住宅手当 | 家賃等の補填 |
| 実費補填 | 燃料手当 | 寒冷地の暖房費補填 |
| 実費補填 | 工具手当 | 業務に必要な工具購入費 |
| 実費補填 | 食事手当 | 食費の補填 |
| 変動要素 | 残業代（時間外労働手当） | 月ごとに変動 |
| 変動要素 | 休日手当 | 月ごとに変動 |
| 変動要素 | 固定残業代（みなし残業代） | 残業代の性質を持つ |
| 変動要素 | 歩合給 | 成績に応じて変動 |
| 変動要素 | 精皆勤手当 | 勤務状況で変動 |
| 変動要素 | 調整手当 | 一時的で将来減額見込み |
| 賞与 | ボーナス全般 | 令和3年4月以降対象外 |

### 1.4 固定残業代がある場合の特別ルール

固定残業代が基本給に含まれている場合：

1. **就業規則または雇用契約書に以下を明記**する必要がある：
   - 固定残業代の時間数
   - 固定残業代の金額
   - 固定残業代を除外した基本給の額

2. **固定残業代を減額・廃止した場合**：
   - 固定残業代を**含めた場合**でも3%以上増額
   - 固定残業代を**除外した場合**でも3%以上増額
   - → **両方のパターンで3%以上が必要**

### 1.5 計算ロジック実装仕様

```typescript
interface SalaryInput {
  // 基本給（月額）
  baseSalary: number;

  // 固定手当（名称と金額のペア）
  fixedAllowances: {
    name: string;
    amount: number;
    type: 'includable' | 'excludable';  // 含める/除外
  }[];

  // 固定残業代（ある場合）
  fixedOvertime?: {
    hours: number;
    amount: number;
  };
}

interface SalaryPeriod {
  // 6ヶ月分のデータ
  months: SalaryInput[];
}

interface CalculationResult {
  preTotalSalary: number;      // 転換前6ヶ月合計
  postTotalSalary: number;     // 転換後6ヶ月合計
  increaseAmount: number;      // 増額金額
  increaseRate: number;        // 増額率（%）
  isEligible: boolean;         // 要件クリア判定
  requiredMinimum: number;     // 必要最低金額（転換後）
  shortfall: number;           // 不足額（0なら要件クリア）
  warnings: string[];          // 警告メッセージ
}

function calculateSalaryIncrease(
  prePeriod: SalaryPeriod,
  postPeriod: SalaryPeriod
): CalculationResult {
  // 1. 各月の「含めるべき賃金」を合計
  const preTotal = sumIncludableSalary(prePeriod);
  const postTotal = sumIncludableSalary(postPeriod);

  // 2. 増額率を計算
  const increaseRate = ((postTotal - preTotal) / preTotal) * 100;

  // 3. 必要最低金額を計算
  const requiredMinimum = preTotal * 1.03;

  // 4. 不足額を計算
  const shortfall = Math.max(0, requiredMinimum - postTotal);

  return {
    preTotalSalary: preTotal,
    postTotalSalary: postTotal,
    increaseAmount: postTotal - preTotal,
    increaseRate: Math.round(increaseRate * 100) / 100,
    isEligible: increaseRate >= 3.0,
    requiredMinimum: Math.ceil(requiredMinimum),
    shortfall: Math.ceil(shortfall),
    warnings: generateWarnings(prePeriod, postPeriod)
  };
}
```

### 1.6 UI上の入力フロー

```
Step 1: 転換前6ヶ月の賃金データ入力
┌─────────────────────────────────────────────┐
│ 月     │ 基本給  │ 役職手当 │ 資格手当 │ ... │
├─────────────────────────────────────────────┤
│ 1ヶ月目│ 200,000 │  10,000  │   5,000  │     │
│ 2ヶ月目│ 200,000 │  10,000  │   5,000  │     │
│ ...    │   ...   │   ...    │   ...    │     │
└─────────────────────────────────────────────┘

Step 2: 転換後の予定賃金入力
┌─────────────────────────────────────────────┐
│ 基本給（月額）: [        215,000 円]        │
│ 役職手当:       [         10,000 円]        │
│ 資格手当:       [          5,000 円]        │
└─────────────────────────────────────────────┘

Step 3: 即時判定結果表示
┌─────────────────────────────────────────────┐
│ ✅ 要件クリア！                             │
│                                             │
│ 転換前6ヶ月合計:  1,290,000円               │
│ 転換後6ヶ月合計:  1,380,000円               │
│ 増額率: 6.98%（必要: 3.0%以上）             │
│                                             │
│ 💡 3%ちょうどに設定した場合の月額: 221,450円│
└─────────────────────────────────────────────┘
```

---

## 2. 申請様式と書類仕様

### 2.1 必要様式一覧（正社員化コース）

| No | 様式番号 | 書類名 | 形式 | 自動生成対象 |
|----|---------|--------|------|:------------:|
| 1 | 様式第1号 | キャリアアップ計画書 | Excel/PDF | Phase 2 |
| 2 | 様式第3号 | キャリアアップ助成金支給申請書 | Excel/PDF | Phase 3 |
| 3 | 様式第4号 | 事業所確認票 | Excel/PDF | Phase 3 |
| 4 | 別添様式1-1 | 正社員化コース内訳 | Excel | Phase 3 |
| 5 | 別添様式1-2 | 正社員化コース対象労働者詳細 | Excel | Phase 3 |
| 6 | - | 賃金3%増額計算書 | 独自 | MVP ✅ |

### 2.2 厚労省提供ツール

| ツール名 | 用途 | 備考 |
|---------|------|------|
| 賃金上昇要件確認ツール | 3%増額の計算・確認 | Excel（522KB） |

→ **このツールの計算ロジックを再現することがMVPの最優先事項**

### 2.3 添付書類チェックリスト

#### 基本添付書類（全申請共通）

| No | 書類 | 転換前 | 転換後 | 備考 |
|----|------|:------:|:------:|------|
| 1 | 雇用契約書または労働条件通知書 | ✅ | ✅ | 両方必要 |
| 2 | 賃金台帳 | 6ヶ月分 | 6ヶ月分 | 計12ヶ月分 |
| 3 | 出勤簿またはタイムカード | 6ヶ月分 | 6ヶ月分 | 計12ヶ月分 |
| 4 | 就業規則（写） | ✅ | ✅ | 転換制度の規定 |
| 5 | 登記事項証明書 | - | ✅ | 中小企業確認用 |
| 6 | キャリアアップ計画書（写） | - | ✅ | 届出済みのもの |

#### 重点支援対象者の追加書類

| 区分 | 追加書類 |
|------|----------|
| 区分A | 雇入れ日を確認できる書類（雇用契約書等） |
| 区分B | 職歴を確認できる書類（履歴書、職務経歴書） |
| 区分C-派遣 | 派遣元との労働者派遣契約書 |
| 区分C-母子/父子 | 戸籍謄本等 |
| 区分C-訓練修了者 | 人材開発支援助成金の支給決定通知書 |

### 2.4 書類チェック機能の実装レベル

| Level | チェック内容 | 実装フェーズ |
|-------|-------------|:------------:|
| L1 | 必須項目の記入漏れ | Phase 2 |
| L2 | 添付書類の過不足 | Phase 2 |
| L3 | 書類間の整合性（賃金台帳と申請書の金額一致等） | Phase 3 |
| L4 | 要件充足（3%増額、6ヶ月雇用等） | Phase 3 |

---

## 3. 競合分析と差別化戦略

### 3.1 競合サービス一覧

| サービス名 | 提供元 | 特徴 | 料金 | キャリアアップ助成金対応 |
|-----------|--------|------|------|:------------------------:|
| **JSaaS** | Jマッチ | 補助金・助成金全般、AI申請書清書 | 月額3,000円 + 成功報酬3-10% | 不明 |
| **ラクリア助成金** | - | 助成金申請SaaS、書類作成支援 | 不明 | ✅ |
| **補助金クラウド** | - | 専門家マッチング、相談し放題 | 月額制 | 不明 |
| **社労士クラウド** | - | スポット申請代行 | スポット課金 | ✅ |

### 3.2 競合の強み・弱み分析

| サービス | 強み | 弱み |
|---------|------|------|
| JSaaS | 豊富な実績（1万社超）、AI清書機能 | 汎用的で助成金特化ではない |
| ラクリア助成金 | 初心者向けUI、要件チェック機能 | 詳細不明 |
| 補助金クラウド | 専門家への相談が容易 | 自動化より人的サポート重視 |
| 社労士クラウド | 全国対応、当日申請 | ツールではなく代行サービス |

### 3.3 差別化戦略

#### 本アプリの差別化ポイント

| ポイント | 内容 | 競合との違い |
|---------|------|-------------|
| **キャリアアップ助成金特化** | 正社員化コースに完全特化 | 汎用助成金ツールとの差別化 |
| **リアルタイム計算** | 3%増額要件の即時判定 | 厚労省ツールのWeb版 |
| **期限管理の自動化** | 転換日から申請期限を自動算出 | 2ヶ月期限厳守をシステムで担保 |
| **重点支援対象者判定** | A/B/C区分の自動分類 | 2025年新制度への完全対応 |
| **社労士向けUI** | 複数クライアント管理 | 社労士の業務フローに最適化 |

#### ポジショニングマップ

```
                    高度な自動化
                         ↑
                         │
      [本アプリ]         │         [JSaaS]
      特化型・自動化     │         汎用型・AI活用
                         │
  ←─────────────────────┼─────────────────────→
  キャリアアップ         │               汎用
  助成金特化             │             助成金
                         │
      [ラクリア]         │      [社労士クラウド]
      特化型・初心者向け │         代行サービス
                         │
                         ↓
                    人的サポート重視
```

### 3.4 法的留意事項

> **重要**: 労働社会保険諸法令に基づく助成金の申請書作成・提出は**社労士の独占業務**（社労士法）
>
> 違反した場合: 1年以下の懲役または100万円以下の罰金

#### 本アプリの対応方針

| 機能 | 法的位置づけ | 対応 |
|------|-------------|------|
| 計算ツール | 計算支援であり申請代行ではない | ✅ 問題なし |
| 期限管理 | スケジュール管理であり申請代行ではない | ✅ 問題なし |
| 対象者判定 | 判定支援であり申請代行ではない | ✅ 問題なし |
| 書類チェック | チェック支援であり申請代行ではない | ✅ 問題なし |
| 書類自動生成 | **データ入力を社労士が行う前提** | ⚠️ 利用規約で明記 |

→ **利用規約で「本サービスは社労士の業務支援ツールであり、申請代行サービスではない」と明記**

---

## 4. データモデル詳細設計

### 4.1 改善版Firestoreスキーマ

#### `/workers/{workerId}` の拡張

```typescript
interface Worker {
  // 基本情報
  id: string;
  clientId: string;           // 所属企業
  name: string;               // 氏名
  nameKana: string;           // 氏名（カナ）
  birthDate: Timestamp;       // 生年月日
  gender: 'male' | 'female';

  // 雇用情報
  hireDate: Timestamp;        // 雇入れ日
  employmentType: 'fixed' | 'indefinite' | 'dispatch';
  contractStartDate: Timestamp;
  contractEndDate?: Timestamp; // 有期の場合

  // 対象外条件チェック
  eligibilityCheck: {
    wasHiredAsRegular: boolean;        // 正規雇用を条件に雇用された
    wasRegularIn3Years: boolean;       // 過去3年以内に正社員だった
    isRelativeWithin3Degrees: boolean; // 3親等以内の親族
    isNewGraduateUnder1Year: boolean;  // 新卒1年未満
    isNearRetirement: boolean;         // 定年まで1年未満
    isTechnicalIntern: boolean;        // 技能実習生
    wasPromisedRegular: boolean;       // 正社員化を約束されていた
  };

  // 職歴（重点支援対象者B判定用）★新規追加
  employmentHistory: {
    companyName: string;
    position: string;
    startDate: Timestamp;
    endDate: Timestamp;
    wasRegularEmployee: boolean;  // 正社員だったか
  }[];

  // 重点支援対象者判定
  priorityTarget: {
    isEligible: boolean;
    category: 'A' | 'B' | 'C' | null;
    categoryReason: string;       // 判定理由
    checkedAt: Timestamp;
  };

  // 賃金情報
  preSalary: SalaryPeriod;       // 転換前6ヶ月
  postSalary: SalaryPeriod;      // 転換後6ヶ月
  salaryCalculation: CalculationResult; // 計算結果キャッシュ

  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;  // userId
}

interface SalaryPeriod {
  months: MonthlySalary[];
}

interface MonthlySalary {
  yearMonth: string;  // "2025-01"
  baseSalary: number;
  allowances: {
    name: string;
    amount: number;
    isIncludable: boolean;
  }[];
  fixedOvertime?: {
    hours: number;
    amount: number;
  };
  totalIncludable: number;  // 算入対象合計
}
```

#### `/applications/{applicationId}` の拡張

```typescript
interface Application {
  id: string;
  clientId: string;
  workerId: string;

  // 転換情報
  conversionDate: Timestamp;
  conversionType: 'fixed_to_regular' | 'indefinite_to_regular';

  // 重点支援対象者情報
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;

  // 申請期限（自動計算）
  phase1: {
    salaryPaymentDate: Timestamp;  // 6ヶ月目の給与支払日
    deadline: Timestamp;            // 申請期限（支払日+2ヶ月）
    status: ApplicationStatus;
    submittedAt?: Timestamp;
    approvedAt?: Timestamp;
    amount?: number;
  };

  phase2?: {  // 重点支援対象者のみ
    salaryPaymentDate: Timestamp;
    deadline: Timestamp;
    status: ApplicationStatus;
    submittedAt?: Timestamp;
    approvedAt?: Timestamp;
    amount?: number;
  };

  // 支給見込額
  estimatedAmount: {
    phase1: number;
    phase2: number;
    total: number;
  };

  // 書類チェック状態
  documentCheck: {
    level: 1 | 2 | 3 | 4;
    lastCheckedAt: Timestamp;
    issues: DocumentIssue[];
  };

  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

type ApplicationStatus =
  | 'preparing'      // 準備中
  | 'documents_ready' // 書類準備完了
  | 'submitted'      // 申請済
  | 'under_review'   // 審査中
  | 'approved'       // 支給決定
  | 'rejected'       // 不支給
  | 'expired';       // 期限切れ

interface DocumentIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}
```

### 4.2 重点支援対象者判定ロジック

```typescript
function determinePriorityCategory(worker: Worker): PriorityTargetResult {
  const hireDate = worker.hireDate.toDate();
  const today = new Date();
  const yearsEmployed = differenceInYears(today, hireDate);

  // 区分A: 雇い入れから3年以上
  if (yearsEmployed >= 3) {
    return {
      isEligible: true,
      category: 'A',
      reason: `雇入れから${yearsEmployed}年${differenceInMonths(today, hireDate) % 12}ヶ月経過`
    };
  }

  // 区分C: 特定カテゴリ（派遣、母子家庭等）
  if (worker.employmentType === 'dispatch') {
    return {
      isEligible: true,
      category: 'C',
      reason: '派遣労働者'
    };
  }
  // 母子家庭、父子家庭、訓練修了者は別途フラグで判定

  // 区分B: 3年未満かつ職歴条件を満たす
  const fiveYearsAgo = subYears(today, 5);
  const oneYearAgo = subYears(today, 1);

  const regularEmploymentInPast5Years = worker.employmentHistory
    .filter(h => h.wasRegularEmployee)
    .filter(h => h.endDate.toDate() >= fiveYearsAgo)
    .reduce((total, h) => {
      const start = max([h.startDate.toDate(), fiveYearsAgo]);
      const end = min([h.endDate.toDate(), today]);
      return total + differenceInMonths(end, start);
    }, 0);

  const wasRegularInPastYear = worker.employmentHistory
    .some(h => h.wasRegularEmployee && h.endDate.toDate() >= oneYearAgo);

  if (regularEmploymentInPast5Years <= 12 && !wasRegularInPastYear) {
    return {
      isEligible: true,
      category: 'B',
      reason: `過去5年間の正社員期間: ${regularEmploymentInPast5Years}ヶ月、過去1年間の正社員経験: なし`
    };
  }

  // 該当なし
  return {
    isEligible: false,
    category: null,
    reason: '重点支援対象者の要件を満たしません'
  };
}
```

---

## 5. 通知・リマインダー設計

### 5.1 通知タイミング

| イベント | タイミング | 通知先 | 緊急度 |
|---------|-----------|--------|:------:|
| 申請期限14日前 | 期限-14日 | 社労士 | 🟡 |
| 申請期限7日前 | 期限-7日 | 社労士 | 🟠 |
| 申請期限3日前 | 期限-3日 | 社労士 | 🔴 |
| 申請期限前日 | 期限-1日 | 社労士 | 🔴🔴 |
| 申請期限当日 | 期限当日 9:00 | 社労士 | 🔴🔴🔴 |
| 第1期申請完了 | 申請直後 | 社労士 | 🟢 |
| 第2期期限設定 | 第1期完了時 | 社労士 | 🟡 |

### 5.2 通知チャネル

| Phase | チャネル | 実装方法 |
|-------|---------|---------|
| MVP | アプリ内通知 | Firestore + React State |
| MVP | メール | Firebase Functions + SendGrid |
| Phase 2 | Push通知 | Firebase Cloud Messaging |
| Phase 3 | Slack連携 | Webhook |

### 5.3 通知データモデル

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    applicationId?: string;
    workerId?: string;
    clientId?: string;
    daysUntilDeadline?: number;
  };
  channels: ('in_app' | 'email' | 'push')[];
  status: 'pending' | 'sent' | 'read' | 'failed';
  scheduledAt: Timestamp;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

type NotificationType =
  | 'deadline_reminder_14d'
  | 'deadline_reminder_7d'
  | 'deadline_reminder_3d'
  | 'deadline_reminder_1d'
  | 'deadline_today'
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'phase2_scheduled';
```

### 5.4 Cloud Functions スケジューラー

```typescript
// 毎日9:00に実行
export const checkDeadlines = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const today = new Date();
    const applications = await getUpcomingDeadlines(today);

    for (const app of applications) {
      const daysUntil = differenceInDays(app.phase1.deadline.toDate(), today);

      if ([14, 7, 3, 1, 0].includes(daysUntil)) {
        await createDeadlineReminder(app, daysUntil);
      }
    }
  });
```

---

## 6. よくある誤解とUI対策

企業担当者がやりがちなミスを防ぐためのUI設計指針。

### 6.1 誤解一覧と対策

| # | よくある誤解 | 実際のルール | UI対策 |
|---|-------------|-------------|--------|
| 1 | 残業代込みで3%上げればOK | 残業代・賞与は計算対象外 | 入力欄を分離、対象外項目はグレー表示 |
| 2 | 小さい会社は就業規則不要 | 10人未満でも届出必須 | 転換前チェックリストで必須確認 |
| 3 | 転換後に届出すればいい | 計画書は転換日の前日までに届出 | 日付入力時にバリデーション |
| 4 | 転換から6ヶ月後に申請 | 6ヶ月目の給与支払日から2ヶ月以内 | 期限を自動計算し強調表示 |
| 5 | 社長の息子も対象になる | 3親等以内の親族は対象外 | 親族関係の確認フィールド |

### 6.2 UIコンポーネント設計

#### ツールチップ（ヘルプアイコン）

```
(ℹ️) アイコンをホバー/タップで説明を表示

配置場所:
- 各入力フィールドのラベル横
- 計算結果の項目名横
- チェックリストの各項目横
```

#### 説明的エラーメッセージ

```typescript
// ❌ 悪い例
"入力値が不正です"

// ✅ 良い例
"残業代は3%増額の計算に含められません。
基本給と固定手当のみで3%以上の増額が必要です。"
```

#### 警告バナー

重要な注意点は入力フォームの上部に常時表示。

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ 注意                                             │
│ 残業代・賞与・通勤手当は3%増額の計算に含まれません。│
│ 基本給と固定手当のみで3%以上増額する必要があります。│
└─────────────────────────────────────────────────────┘
```

### 6.3 画面別ガイダンス配置

#### 賃金計算画面

| 場所 | ガイダンス内容 |
|------|---------------|
| 画面上部 | 「残業代・賞与は計算対象外」の警告バナー |
| 基本給入力欄 | ツールチップ: 「月額の基本給を入力」 |
| 固定手当入力欄 | ツールチップ: 「通勤手当・住宅手当を除く」 |
| 残業代入力欄 | グレー表示 + 「参考値（計算対象外）」ラベル |
| 計算結果 | 不足時は「あと◯円必要」を赤字で強調 |

#### 対象者登録画面

| 場所 | ガイダンス内容 |
|------|---------------|
| 雇入れ日 | ツールチップ: 「最初に雇用された日（契約更新日ではない）」 |
| 親族関係 | ツールチップ: 「3親等以内（いとこはOK、甥姪はNG）」 |
| 過去の正社員経験 | ツールチップ: 「他社での経験も含む（重点支援対象者判定に使用）」 |

#### 申請期限画面

| 場所 | ガイダンス内容 |
|------|---------------|
| 給与支払日入力 | ツールチップ: 「転換後6ヶ月目の給与が支払われる日」 |
| 期限表示 | 「給与支払日から2ヶ月以内」の計算根拠を表示 |
| 残り日数 | 14日以下で黄色、7日以下で赤色表示 |

### 6.4 ヘルプテキスト例

#### 3%増額計算について

```markdown
## なぜ残業代は計算に含めないの？

残業代は毎月の労働時間によって変動するため、
「安定した賃金増額」とは見なされません。

### 計算に含めるもの
✅ 基本給
✅ 役職手当、資格手当、家族手当など固定手当

### 計算に含めないもの
❌ 残業代（固定残業代も含む）
❌ 賞与・ボーナス
❌ 通勤手当、住宅手当（実費補填の性質）
```

#### 申請期限について

```markdown
## 申請期限の計算方法

「転換から6ヶ月後」ではありません！

### 計算の起点
転換後6ヶ月目の「給与支払日」が起点です。

### 例
- 4/1に転換
- 月末締め・翌月15日払いの会社
- 9月分給与（6ヶ月目）の支払日 = 10/15
- 申請期限 = 10/15 + 2ヶ月 = 12/15

⚠️ 1日でも遅れると一切受理されません
```

### 6.5 実装優先度

| 優先度 | コンポーネント | 理由 |
|:------:|---------------|------|
| 🔴 高 | 賃金計算の入力欄分離 | 最も多い誤解を防ぐ |
| 🔴 高 | 申請期限の自動計算・強調表示 | 期限切れは取り返しがつかない |
| 🟡 中 | ツールチップ | 入力時の疑問を解消 |
| 🟡 中 | 説明的エラーメッセージ | バリデーション時の学習効果 |
| 🟢 低 | ヘルプページ | 詳細を知りたい人向け |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-22 | 初版作成（リサーチ結果を反映） |
| 2025-12-22 | よくある誤解とUI対策セクションを追加 |
