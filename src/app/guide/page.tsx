"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// よくある誤解とその対策
const commonMistakes = [
  {
    id: 1,
    title: "残業代を3%計算に含めてしまう",
    category: "賃金計算",
    severity: "critical",
    description:
      "残業代（時間外手当、深夜手当、休日手当）は3%の賃金上昇計算から除外しなければなりません。基本給と固定的諸手当のみが計算対象です。",
    example:
      "基本給20万円、残業代5万円の場合、計算対象は20万円のみ。25万円で計算すると誤りです。",
    prevention: "当システムでは残業代を別枠で入力し、自動的に除外して計算します。",
    officialRule: "厚生労働省Q&A「賃金の上昇に係る算定方法について」参照",
  },
  {
    id: 2,
    title: "キャリアアップ計画を転換後に届出",
    category: "手続き",
    severity: "critical",
    description:
      "キャリアアップ計画の届出は、必ず正社員転換の「前」に行う必要があります。転換後に届出しても助成金は受給できません。",
    example:
      "4月1日に転換する場合、3月31日までに計画届出が完了している必要があります。",
    prevention:
      "当システムでは届出日と転換日の前後関係をチェックし、誤りがあれば警告を表示します。",
    officialRule: "キャリアアップ助成金支給要領 第3章「計画の作成・届出」",
  },
  {
    id: 3,
    title: "申請期限（2ヶ月）を過ぎてしまう",
    category: "手続き",
    severity: "critical",
    description:
      "転換後6ヶ月間の賃金を支払った日の翌日から起算して2ヶ月以内に申請が必要です。この期限は厳格で、1日でも過ぎると受給できません。",
    example:
      "4月1日転換、給与支払日25日の場合：9月25日が6ヶ月目の支払日→11月25日が申請期限",
    prevention:
      "当システムでは転換日から自動で申請期限を計算し、期限が近づくとアラート通知します。",
    officialRule: "キャリアアップ助成金支給要領 第4章「支給申請」",
  },
  {
    id: 4,
    title: "就業規則に転換規定がない",
    category: "準備",
    severity: "critical",
    description:
      "正社員転換制度が就業規則に明記されていないと助成金を受給できません。「正社員に登用する場合がある」という曖昧な表現では不十分です。",
    example:
      "「転換の要件」「転換時期」「転換後の処遇」を具体的に規定する必要があります。",
    prevention:
      "当システムのチェックリストで就業規則の整備状況を確認できます。",
    officialRule: "キャリアアップ助成金支給要領 第2章「支給要件」",
  },
  {
    id: 5,
    title: "30分単位で残業を切り捨てている",
    category: "労務管理",
    severity: "warning",
    description:
      "残業時間の30分単位切り捨ては労働基準法違反です。1分単位での計算が必要です。これが発覚すると助成金の不支給や返還につながる可能性があります。",
    example:
      "1時間20分の残業を1時間で計算するのは違法。正しくは1時間20分（80分）で計算。",
    prevention:
      "当システムでは残業代入力時に注意喚起メッセージを表示します。",
    officialRule: "労働基準法第37条、通達「1か月の残業時間の端数処理」",
  },
  {
    id: 6,
    title: "雇用期間の要件を満たしていない",
    category: "要件",
    severity: "critical",
    description:
      "転換前の有期雇用期間が6ヶ月以上3年以内である必要があります。6ヶ月未満や3年を超えると対象外です。",
    example:
      "入社3ヶ月で正社員に転換した場合は対象外。また、3年1ヶ月の有期雇用後の転換も対象外。",
    prevention:
      "当システムでは雇用期間をチェックし、要件を満たさない場合は警告します。",
    officialRule: "キャリアアップ助成金支給要領 第2章「対象労働者」",
  },
  {
    id: 7,
    title: "賞与を3%計算に含めてしまう",
    category: "賃金計算",
    severity: "warning",
    description:
      "賞与は臨時的な賃金であり、3%計算の対象外です。ただし、毎月固定で支給される「精勤手当」などは対象となる場合があります。",
    example:
      "夏冬の賞与は除外。一方、毎月5千円の「皆勤手当」は固定的諸手当として含める。",
    prevention:
      "当システムでは賞与と固定手当を明確に区別して入力できます。",
    officialRule: "厚生労働省Q&A「対象となる賃金の範囲について」",
  },
  {
    id: 8,
    title: "通勤手当・住宅手当を含めてしまう",
    category: "賃金計算",
    severity: "warning",
    description:
      "通勤手当、住宅手当、家族手当などの実費補填的な手当は3%計算から除外されます。",
    example:
      "通勤手当1.5万円、住宅手当2万円は計算対象外。基本給と資格手当のみが対象。",
    prevention:
      "当システムでは除外項目を明示し、自動的に計算から除外します。",
    officialRule: "厚生労働省Q&A「実費弁償的な手当について」",
  },
];

// カテゴリでグループ化
const categories = [
  { id: "賃金計算", label: "賃金計算の誤り", color: "blue" },
  { id: "手続き", label: "手続きの誤り", color: "purple" },
  { id: "準備", label: "準備不足", color: "orange" },
  { id: "労務管理", label: "労務管理の問題", color: "red" },
  { id: "要件", label: "要件の誤解", color: "green" },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-sm text-gray-600 hover:text-blue-600">
              ヘルプ
            </Link>
            <Link href="/login">
              <Button variant="outline">ログイン</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">よくある誤解と失敗例</h1>
        <p className="text-gray-600 mb-8">
          キャリアアップ助成金の申請で企業がよく間違えるポイントをまとめました。
          申請前に必ずご確認ください。
        </p>

        {/* 重要な注意 */}
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>助成金申請は厳格です</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              キャリアアップ助成金は要件や期限が厳格に定められています。
              小さなミスでも不支給や返還につながる可能性があります。
            </p>
            <p>
              不明点がある場合は、必ず管轄の労働局または社会保険労務士にご相談ください。
            </p>
          </AlertDescription>
        </Alert>

        {/* カテゴリ別サマリー */}
        <div className="grid md:grid-cols-5 gap-3 mb-8">
          {categories.map((cat) => {
            const count = commonMistakes.filter((m) => m.category === cat.id).length;
            return (
              <div key={cat.id} className="bg-white border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{cat.label}</div>
              </div>
            );
          })}
        </div>

        {/* 誤解リスト */}
        <div className="space-y-6">
          {commonMistakes.map((mistake) => (
            <Card
              key={mistake.id}
              className={
                mistake.severity === "critical" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-yellow-500"
              }
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      mistake.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {mistake.severity === "critical" ? "致命的" : "注意"}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    {mistake.category}
                  </span>
                </div>
                <CardTitle className="text-lg">{mistake.title}</CardTitle>
                <CardDescription>{mistake.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">具体例</div>
                    <p className="text-sm text-gray-600">{mistake.example}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      当システムでの対策
                    </div>
                    <p className="text-sm text-blue-600">{mistake.prevention}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    根拠: {mistake.officialRule}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 追加リソース */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>参考資料</CardTitle>
            <CardDescription>公式情報を必ずご確認ください</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  厚生労働省 キャリアアップ助成金のページ
                </a>
              </li>
              <li>
                <a
                  href="https://www.mhlw.go.jp/content/11910500/000923180.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  キャリアアップ助成金パンフレット（PDF）
                </a>
              </li>
              <li>
                <a
                  href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Q&A集・支給要領
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ナビゲーション */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/calculator">
            <Button>賃金計算へ</Button>
          </Link>
          <Link href="/eligibility">
            <Button variant="outline">要件チェックへ</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">トップへ戻る</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
