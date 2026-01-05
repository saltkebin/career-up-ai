import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-900">キャリアアップ助成金 申請支援</h1>
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

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            正社員化コースの申請を<br />かんたん・確実に
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            賃金計算から申請期限管理まで、キャリアアップ助成金の申請業務を
            ミスなくサポートします
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                ログイン
              </Button>
            </Link>
            <Link href="/calculator">
              <Button size="lg" variant="outline" className="text-lg px-8">
                賃金計算を試す
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/calculator">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      賃金上昇率計算
                    </CardTitle>
                    <CardDescription>
                      3%要件を自動チェック
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      残業代・賞与などの除外項目を正しく処理し、
                      転換前後の賃金上昇率を正確に計算します。
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>転換前後6ヶ月の賃金を入力し、3%以上の賃金上昇要件を満たしているか確認できます</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/eligibility">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      支給要件チェック
                    </CardTitle>
                    <CardDescription>
                      受給資格を事前確認
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      キャリアアップ計画の届出時期、雇用期間など、
                      申請前に要件をすべてチェックできます。
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>キャリアアップ計画届出時期、雇用期間、賃金要件など全ての支給要件をチェックします</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/documents">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">📋</span>
                      書類チェック
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">NEW</span>
                    </CardTitle>
                    <CardDescription>
                      必要書類の過不足を確認
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      申請に必要な書類が揃っているか、
                      記入漏れがないかをチェックします。
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>申請に必要な書類（賃金台帳、出勤簿、労働条件通知書など）の準備状況を確認できます</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/guide">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      よくある失敗例
                    </CardTitle>
                    <CardDescription>
                      申請ミスを防ぐガイド
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      残業代の計算ミス、届出時期の誤りなど、
                      よくある失敗パターンを解説します。
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>申請でよくある失敗パターンと対策を解説。事前に確認して申請ミスを防ぎましょう</p>
            </TooltipContent>
          </Tooltip>
        </section>

        {/* Phase 3 機能 */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Link href="/summary">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  申請可否判定
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">NEW</span>
                </CardTitle>
                <CardDescription>
                  L4: 要件充足チェック
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  全ての要件を総合的に判定し、
                  申請可否と助成金額を算出します。
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents/analyze">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI書類分析
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">NEW</span>
                </CardTitle>
                <CardDescription>
                  L3: Gemini 3 Flash OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  賃金台帳や申請書をAIが自動で読み取り、
                  データを抽出します。
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/export">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  PDFエクスポート
                  <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">NEW</span>
                </CardTitle>
                <CardDescription>
                  申請概要書を自動生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  入力データから申請概要書を
                  PDF形式で出力します。
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        <section className="bg-blue-900 text-white rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-4 text-center">
            2025年度の重点支援対象者にも対応
          </h3>
          <p className="text-blue-100 text-center max-w-2xl mx-auto mb-6">
            派遣労働者や雇用保険未加入者からの転換など、
            重点支援対象者に該当するかを自動判定。
            加算額も含めた正確な助成金額を算出します。
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-800 rounded-lg p-4">
              <div className="text-3xl font-bold">カテゴリA</div>
              <div className="text-blue-200 text-sm">雇入れ3年以内・保険未加入者</div>
            </div>
            <div className="bg-blue-800 rounded-lg p-4">
              <div className="text-3xl font-bold">カテゴリB</div>
              <div className="text-blue-200 text-sm">派遣労働者からの転換</div>
            </div>
            <div className="bg-blue-800 rounded-lg p-4">
              <div className="text-3xl font-bold">カテゴリC</div>
              <div className="text-blue-200 text-sm">正社員求人応募→有期雇用</div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h3 className="text-2xl font-bold mb-4">よくある失敗を防ぐヘルプ機能</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            「残業代を3%計算に含めてしまった」「キャリアアップ計画を転換後に届出した」など、
            申請でよくある失敗をシステムが自動で検知し、警告表示でミスを防ぎます。
          </p>
        </section>
      </main>

      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 キャリアアップ助成金 申請支援システム</p>
        </div>
      </footer>
    </div>
  );
}
