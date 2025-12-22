import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-900">キャリアアップ助成金 申請支援</h1>
          <Link href="/login">
            <Button variant="outline">ログイン</Button>
          </Link>
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
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                無料で始める
              </Button>
            </Link>
            <Link href="/calculator">
              <Button size="lg" variant="outline" className="text-lg px-8">
                賃金計算を試す
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
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
                よくある計算ミスを防ぎます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                申請期限管理
              </CardTitle>
              <CardDescription>
                2ヶ月の期限を逃さない
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                転換日から自動で申請期限を計算。
                期限が近づくとアラートでお知らせ。
                厳格な期限管理で申請漏れを防止します。
              </p>
            </CardContent>
          </Card>

          <Card>
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
                キャリアアップ計画の届出時期、雇用期間、
                就業規則の整備状況など、申請前に要件を
                すべてチェックできます。
              </p>
            </CardContent>
          </Card>
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
