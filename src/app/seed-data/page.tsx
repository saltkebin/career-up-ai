"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ============================================
// ヘルパー関数
// ============================================

function createTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(new Date(dateStr));
}

function daysFromNow(days: number): Timestamp {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Timestamp.fromDate(date);
}

function monthsAgo(months: number): Timestamp {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return Timestamp.fromDate(date);
}

function formatDateString(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString().split('T')[0];
}

// ============================================
// テストデータ定義
// ============================================

interface ClientData {
  companyName: string;
  registrationNumber: string;
  isSmallBusiness: boolean;
  careerUpManager: string;
  hasEmploymentRules: boolean;
  employmentRulesSubmittedMonthsAgo?: number;
  careerUpPlanSubmittedMonthsAgo?: number;
}

interface WorkerData {
  name: string;
  nameKana: string;
  birthDate: string;
  gender: 'male' | 'female';
  hireDate: string;
  employmentType: 'fixed' | 'indefinite' | 'dispatch';
  contractStartDate: string;
  contractEndDate?: string;
  conversionDate: string;
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;
  status: string;
  daysRemaining: number;
  scenario: string;
}

// 顧問先企業データ
const clients: ClientData[] = [
  {
    companyName: '株式会社テックフォワード',
    registrationNumber: '1301-123456-7',
    isSmallBusiness: true,
    careerUpManager: '山田 太郎',
    hasEmploymentRules: true,
    employmentRulesSubmittedMonthsAgo: 6,
    careerUpPlanSubmittedMonthsAgo: 3,
  },
  {
    companyName: '有限会社さくら製作所',
    registrationNumber: '1302-234567-8',
    isSmallBusiness: true,
    careerUpManager: '佐藤 花子',
    hasEmploymentRules: true,
    employmentRulesSubmittedMonthsAgo: 12,
    careerUpPlanSubmittedMonthsAgo: 2,
  },
  {
    companyName: '合同会社グリーンテック',
    registrationNumber: '1303-345678-9',
    isSmallBusiness: true,
    careerUpManager: '田中 一郎',
    hasEmploymentRules: false,
  },
  {
    companyName: '株式会社ブルースカイ物流',
    registrationNumber: '1304-456789-0',
    isSmallBusiness: false,
    careerUpManager: '高橋 誠',
    hasEmploymentRules: true,
    employmentRulesSubmittedMonthsAgo: 24,
    careerUpPlanSubmittedMonthsAgo: 1,
  },
  {
    companyName: 'NPO法人みらい支援センター',
    registrationNumber: '1305-567890-1',
    isSmallBusiness: true,
    careerUpManager: '伊藤 美咲',
    hasEmploymentRules: true,
    employmentRulesSubmittedMonthsAgo: 8,
    careerUpPlanSubmittedMonthsAgo: 4,
  },
];

// 対象労働者データ（様々なパターン）
const workers: WorkerData[] = [
  {
    name: '田中 一郎',
    nameKana: 'タナカ イチロウ',
    birthDate: '1990-05-15',
    gender: 'male',
    hireDate: '2024-04-01',
    employmentType: 'fixed',
    contractStartDate: '2024-04-01',
    contractEndDate: '2025-03-31',
    conversionDate: '2025-04-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '準備中',
    daysRemaining: 2,
    scenario: '期限間近・緊急対応必要',
  },
  {
    name: '鈴木 花子',
    nameKana: 'スズキ ハナコ',
    birthDate: '1985-08-20',
    gender: 'female',
    hireDate: '2024-06-01',
    employmentType: 'fixed',
    contractStartDate: '2024-06-01',
    contractEndDate: '2025-05-31',
    conversionDate: '2025-06-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '書類作成中',
    daysRemaining: 64,
    scenario: '順調に進行中',
  },
  {
    name: '佐藤 次郎',
    nameKana: 'サトウ ジロウ',
    birthDate: '1988-03-10',
    gender: 'male',
    hireDate: '2024-07-15',
    employmentType: 'indefinite',
    contractStartDate: '2024-07-15',
    conversionDate: '2025-07-15',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '要件確認中',
    daysRemaining: 92,
    scenario: '無期→正規転換',
  },
  {
    name: '山田 美咲',
    nameKana: 'ヤマダ ミサキ',
    birthDate: '1992-11-25',
    gender: 'female',
    hireDate: '2024-01-15',
    employmentType: 'fixed',
    contractStartDate: '2024-01-15',
    contractEndDate: '2024-12-31',
    conversionDate: '2025-01-01',
    isPriorityTarget: true,
    priorityCategory: 'A',
    status: '書類作成中',
    daysRemaining: 45,
    scenario: '重点支援対象者A（母子家庭）',
  },
  {
    name: '高橋 健太',
    nameKana: 'タカハシ ケンタ',
    birthDate: '1995-02-28',
    gender: 'male',
    hireDate: '2024-03-01',
    employmentType: 'fixed',
    contractStartDate: '2024-03-01',
    contractEndDate: '2025-02-28',
    conversionDate: '2025-03-01',
    isPriorityTarget: true,
    priorityCategory: 'B',
    status: '準備中',
    daysRemaining: 30,
    scenario: '重点支援対象者B（5年間に5回離職）',
  },
  {
    name: '伊藤 由美',
    nameKana: 'イトウ ユミ',
    birthDate: '1980-07-07',
    gender: 'female',
    hireDate: '2023-10-01',
    employmentType: 'fixed',
    contractStartDate: '2023-10-01',
    contractEndDate: '2024-09-30',
    conversionDate: '2024-10-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '申請済み',
    daysRemaining: -30,
    scenario: '申請完了・審査待ち',
  },
  {
    name: '渡辺 誠',
    nameKana: 'ワタナベ マコト',
    birthDate: '1975-12-01',
    gender: 'male',
    hireDate: '2023-06-01',
    employmentType: 'fixed',
    contractStartDate: '2023-06-01',
    contractEndDate: '2024-05-31',
    conversionDate: '2024-06-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '期限超過',
    daysRemaining: -60,
    scenario: '期限超過・申請不可',
  },
  {
    name: '中村 浩二',
    nameKana: 'ナカムラ コウジ',
    birthDate: '1987-09-15',
    gender: 'male',
    hireDate: '2024-05-01',
    employmentType: 'fixed',
    contractStartDate: '2024-05-01',
    contractEndDate: '2025-04-30',
    conversionDate: '2025-05-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '要件確認中',
    daysRemaining: 55,
    scenario: '3%賃金上昇要件未達（2.5%）',
  },
  {
    name: '小林 麻衣',
    nameKana: 'コバヤシ マイ',
    birthDate: '1993-04-20',
    gender: 'female',
    hireDate: '2024-08-01',
    employmentType: 'dispatch',
    contractStartDate: '2024-08-01',
    conversionDate: '2025-08-01',
    isPriorityTarget: false,
    priorityCategory: null,
    status: '準備中',
    daysRemaining: 120,
    scenario: '派遣→正規転換（派遣元との調整必要）',
  },
  {
    name: '加藤 正明',
    nameKana: 'カトウ マサアキ',
    birthDate: '1978-06-30',
    gender: 'male',
    hireDate: '2024-02-01',
    employmentType: 'fixed',
    contractStartDate: '2024-02-01',
    contractEndDate: '2025-01-31',
    conversionDate: '2025-02-01',
    isPriorityTarget: true,
    priorityCategory: 'C',
    status: '書類作成中',
    daysRemaining: 38,
    scenario: '重点支援対象者C（就職氷河期世代）',
  },
];

export default function SeedDataPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeedData = async () => {
    if (!user) {
      setResult({ success: false, message: 'ログインしてください' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      const userUid = user.uid;

      // 1. 顧問先企業を作成
      const clientIds: string[] = [];

      for (const client of clients) {
        const clientRef = doc(collection(db, 'clients'));
        clientIds.push(clientRef.id);

        const clientData: Record<string, unknown> = {
          companyName: client.companyName,
          registrationNumber: client.registrationNumber,
          isSmallBusiness: client.isSmallBusiness,
          careerUpManager: client.careerUpManager,
          hasEmploymentRules: client.hasEmploymentRules,
          officeId: userUid,
          createdAt: now,
          updatedAt: now,
        };

        // オプショナルフィールドの処理
        if (client.employmentRulesSubmittedMonthsAgo !== undefined) {
          clientData.employmentRulesSubmittedAt = monthsAgo(client.employmentRulesSubmittedMonthsAgo);
        }
        if (client.careerUpPlanSubmittedMonthsAgo !== undefined) {
          clientData.careerUpPlanSubmittedAt = monthsAgo(client.careerUpPlanSubmittedMonthsAgo);
        }

        batch.set(clientRef, clientData);
      }

      // 2. 対象労働者と申請を作成
      for (let i = 0; i < workers.length; i++) {
        const worker = workers[i];
        const clientIndex = i % clientIds.length;
        const clientId = clientIds[clientIndex];

        const workerRef = doc(collection(db, 'workers'));
        const applicationRef = doc(collection(db, 'applications'));

        // 労働者データ
        batch.set(workerRef, {
          clientId,
          name: worker.name,
          nameKana: worker.nameKana,
          birthDate: createTimestamp(worker.birthDate),
          gender: worker.gender,
          hireDate: createTimestamp(worker.hireDate),
          employmentType: worker.employmentType,
          contractStartDate: createTimestamp(worker.contractStartDate),
          contractEndDate: worker.contractEndDate
            ? createTimestamp(worker.contractEndDate)
            : null,
          eligibilityCheck: {
            wasHiredAsRegular: false,
            wasRegularIn3Years: false,
            isRelativeWithin3Degrees: false,
            isNewGraduateUnder1Year: false,
            isNearRetirement: false,
            isTechnicalIntern: false,
            wasPromisedRegular: false,
          },
          employmentHistory: [],
          priorityTarget: {
            isEligible: worker.isPriorityTarget,
            category: worker.priorityCategory,
            categoryReason: worker.scenario,
            checkedAt: now,
          },
          createdAt: now,
          updatedAt: now,
          createdBy: userUid,
        });

        // 申請データ
        const conversionDate = createTimestamp(worker.conversionDate);
        const deadline = daysFromNow(worker.daysRemaining);
        const conversionType = worker.employmentType === 'indefinite'
          ? 'indefinite_to_regular'
          : 'fixed_to_regular';

        // 支給額計算
        const isSmallBusiness = clients[clientIndex].isSmallBusiness;
        const baseAmount = isSmallBusiness ? 800000 : 600000;
        const priorityBonus = worker.isPriorityTarget ? 400000 : 0;

        batch.set(applicationRef, {
          clientId,
          workerId: workerRef.id,
          conversionDate,
          conversionType,
          isPriorityTarget: worker.isPriorityTarget,
          priorityCategory: worker.priorityCategory,
          phase1: {
            salaryPaymentDate: conversionDate,
            deadline,
            status: worker.status === '申請済み' ? 'submitted'
                  : worker.status === '期限超過' ? 'expired'
                  : 'preparing',
            submittedAt: worker.status === '申請済み' ? monthsAgo(1) : null,
          },
          phase2: worker.isPriorityTarget ? {
            salaryPaymentDate: null,
            deadline: null,
            status: 'preparing',
          } : null,
          estimatedAmount: {
            phase1: baseAmount + priorityBonus,
            phase2: worker.isPriorityTarget ? baseAmount + priorityBonus : 0,
            total: worker.isPriorityTarget
              ? (baseAmount + priorityBonus) * 2
              : baseAmount + priorityBonus,
          },
          // ダッシュボード表示用
          workerName: worker.name,
          applicationDeadline: formatDateString(deadline),
          status: worker.status,
          daysRemaining: worker.daysRemaining,
          scenario: worker.scenario,
          createdAt: now,
          updatedAt: now,
          createdBy: userUid,
        });
      }

      // 3. バッチ実行
      await batch.commit();

      setResult({
        success: true,
        message: `テストデータを投入しました！\n- 顧問先企業: ${clients.length}社\n- 対象労働者: ${workers.length}名\n- 申請: ${workers.length}件`,
      });
    } catch (error) {
      console.error('データ投入エラー:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              テストデータを投入するにはログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              ログインページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>開発用：テストデータ投入</CardTitle>
            <CardDescription>
              ログイン中のアカウント（{user.email}）に対してテストデータを投入します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? '成功' : 'エラー'}</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">投入されるデータ</h3>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">顧問先企業（{clients.length}社）</h4>
                <ul className="text-sm space-y-1 ml-4">
                  {clients.map((client, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className={client.isSmallBusiness ? 'text-green-600' : 'text-blue-600'}>
                        {client.isSmallBusiness ? '中小' : '大企業'}
                      </span>
                      <span>{client.companyName}</span>
                      {!client.hasEmploymentRules && (
                        <span className="text-orange-600 text-xs">就業規則未整備</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">対象労働者・申請（{workers.length}件）</h4>
                <ul className="text-sm space-y-1 ml-4">
                  {workers.map((worker, i) => (
                    <li key={i} className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{worker.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        worker.daysRemaining < 0 ? 'bg-red-100 text-red-700' :
                        worker.daysRemaining <= 7 ? 'bg-red-100 text-red-700' :
                        worker.daysRemaining <= 30 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {worker.daysRemaining < 0 ? `${Math.abs(worker.daysRemaining)}日超過` : `残${worker.daysRemaining}日`}
                      </span>
                      {worker.isPriorityTarget && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                          重点{worker.priorityCategory}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">{worker.scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSeedData}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'データ投入中...' : 'テストデータを投入'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                ダッシュボードへ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
