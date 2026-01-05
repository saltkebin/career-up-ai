"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">ログイン</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">ユーザーガイド</h1>
        <p className="text-gray-600 mb-8">社会保険労務士の皆様向けの操作マニュアルです</p>

        {/* 目次 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>目次</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              <a href="#intro" className="block text-blue-600 hover:underline">1. はじめに</a>
              <a href="#access" className="block text-blue-600 hover:underline">2. アプリへのアクセス</a>
              <a href="#features" className="block text-blue-600 hover:underline">3. 主な機能一覧</a>
              <a href="#dashboard" className="block text-blue-600 hover:underline">4. ダッシュボード</a>
              <a href="#calculator" className="block text-blue-600 hover:underline">5. 賃金上昇率計算</a>
              <a href="#eligibility" className="block text-blue-600 hover:underline">6. 支給要件チェック</a>
              <a href="#documents" className="block text-blue-600 hover:underline">7. 書類チェック</a>
              <a href="#priority" className="block text-blue-600 hover:underline">8. 重点支援対象者について</a>
              <a href="#workflow" className="block text-blue-600 hover:underline">9. 推奨ワークフロー</a>
              <a href="#faq" className="block text-blue-600 hover:underline">10. よくある質問</a>
            </nav>
          </CardContent>
        </Card>

        {/* はじめに */}
        <section id="intro" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">1. はじめに</h2>
          <p className="mb-4">
            本アプリは、<strong>キャリアアップ助成金（正社員化コース）</strong>の申請業務を支援するためのWebアプリケーションです。
          </p>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">このアプリでできること</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>顧問先企業と申請案件の一元管理</li>
                <li>賃金3%上昇要件の自動計算（逆算機能付き）</li>
                <li>支給要件の事前チェック</li>
                <li>必要書類の過不足確認</li>
                <li>申請期限のカレンダー管理</li>
                <li>転換前準備チェックリスト</li>
                <li>データのバックアップ・復元</li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>対象となる助成金コース:</strong> 正社員化コース（有期雇用労働者等を正規雇用労働者に転換または直接雇用）
            </p>
          </div>
        </section>

        {/* アプリへのアクセス */}
        <section id="access" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">2. アプリへのアクセス</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">URL</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="https://career-up-ai.vercel.app" className="text-blue-600 hover:underline font-mono">
                  https://career-up-ai.vercel.app
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ログイン</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">事務所専用のパスワードを入力</p>
                <code className="bg-gray-100 px-2 py-1 rounded">sharoushi2025</code>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">推奨ブラウザ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <span className="px-3 py-1 bg-gray-100 rounded">Google Chrome</span>
                <span className="px-3 py-1 bg-gray-100 rounded">Microsoft Edge</span>
                <span className="px-3 py-1 bg-gray-100 rounded">Safari</span>
                <span className="px-3 py-1 bg-gray-100 rounded">Firefox</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 主な機能一覧 */}
        <section id="features" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">3. 主な機能一覧</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">機能名</th>
                  <th className="border p-3 text-left">概要</th>
                  <th className="border p-3 text-left">パス</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 font-medium">ダッシュボード</td>
                  <td className="border p-3">顧問先・申請の一元管理</td>
                  <td className="border p-3"><code>/dashboard</code></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-3 font-medium">賃金上昇率計算</td>
                  <td className="border p-3">3%要件の計算・逆算</td>
                  <td className="border p-3"><code>/calculator</code></td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">支給要件チェック</td>
                  <td className="border p-3">申請要件の確認</td>
                  <td className="border p-3"><code>/eligibility</code></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-3 font-medium">書類チェック</td>
                  <td className="border p-3">必要書類の過不足確認</td>
                  <td className="border p-3"><code>/documents/check</code></td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">カレンダー</td>
                  <td className="border p-3">申請期限の視覚的管理</td>
                  <td className="border p-3"><code>/calendar</code></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-3 font-medium">設定</td>
                  <td className="border p-3">バックアップ・CSVエクスポート</td>
                  <td className="border p-3"><code>/settings</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ダッシュボード */}
        <section id="dashboard" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">4. ダッシュボード</h2>

          <p className="mb-4">ログイン後のメイン画面です。顧問先企業と申請案件を一元管理できます。</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">顧問先企業管理</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>企業一覧の表示</li>
                  <li>新規顧問先の登録</li>
                  <li>企業情報の編集・削除</li>
                  <li>転換前準備チェックリスト</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">申請管理</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>対象労働者の一覧表示</li>
                  <li>新規申請の登録</li>
                  <li>ステータス変更（7段階）</li>
                  <li>重点支援対象者の管理</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>期限アラート:</strong> 申請期限が14日以内の案件がある場合、ダッシュボード上部に赤色のアラートが表示されます。
            </p>
          </div>
        </section>

        {/* 賃金上昇率計算 */}
        <section id="calculator" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">5. 賃金上昇率計算</h2>

          <p className="mb-4">転換前6ヶ月と転換後6ヶ月の賃金データを入力し、3%上昇要件を自動計算します。</p>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">操作手順</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>転換日を入力し「入力フォームを生成」をクリック</li>
                <li>転換前6ヶ月の賃金を入力（基本給、固定的諸手当など）</li>
                <li>転換後6ヶ月の賃金を入力</li>
                <li>「賃金上昇率を計算」をクリック</li>
              </ol>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">計算対象となる賃金</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  <li>基本給</li>
                  <li>役職手当</li>
                  <li>職務手当</li>
                  <li>その他固定的諸手当</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">除外される賃金</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  <li>残業代（時間外手当）</li>
                  <li>賞与</li>
                  <li>通勤手当</li>
                  <li>住宅手当・家族手当</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800">
              <strong>逆算機能:</strong> 3%要件を満たさない場合、達成に必要な昇給額を自動計算します。「クイック逆算ツール」で月額から即座に必要な転換後賃金を確認できます。
            </p>
          </div>
        </section>

        {/* 支給要件チェック */}
        <section id="eligibility" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">6. 支給要件チェック</h2>

          <p className="mb-4">キャリアアップ助成金の支給要件を項目ごとにチェックし、受給資格の有無を事前確認します。</p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">チェック項目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">基本要件</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>キャリアアップ計画の届出（転換前）</li>
                    <li>就業規則の整備</li>
                    <li>社会保険の適用</li>
                    <li>雇用保険の加入</li>
                    <li>6ヶ月以上の雇用実績</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">賃金要件</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>3%以上の賃金上昇</li>
                    <li>賃金支払日の適正性</li>
                    <li>労働条件の明示</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 書類チェック */}
        <section id="documents" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">7. 書類チェック</h2>

          <p className="mb-4">申請に必要な書類が揃っているかをチェックリスト形式で確認します。</p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">必要書類一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">書類名</th>
                      <th className="border p-2 text-left">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2">キャリアアップ計画書</td><td className="border p-2">転換前に届出済み</td></tr>
                    <tr><td className="border p-2">様式第3号（支給申請書）</td><td className="border p-2">正式な申請書</td></tr>
                    <tr><td className="border p-2">就業規則（転換前・後）</td><td className="border p-2">正社員転換規定を含む</td></tr>
                    <tr><td className="border p-2">雇用契約書（転換前・後）</td><td className="border p-2">両方必要</td></tr>
                    <tr><td className="border p-2">賃金台帳（12ヶ月分）</td><td className="border p-2">転換前6ヶ月＋転換後6ヶ月</td></tr>
                    <tr><td className="border p-2">出勤簿（12ヶ月分）</td><td className="border p-2">同上</td></tr>
                    <tr><td className="border p-2">賃金3%増額計算書</td><td className="border p-2">上昇率の計算根拠</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 重点支援対象者 */}
        <section id="priority" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">8. 2025年度の重点支援対象者について</h2>

          <p className="mb-4">2025年度から新設された「重点支援対象者」に該当する場合、助成金が加算されます。</p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg">カテゴリA</CardTitle>
                <CardDescription>雇入れ3年以内＋雇保未加入</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>入社から3年以内</li>
                  <li>転換前に雇用保険未加入</li>
                </ul>
                <p className="mt-3 font-medium text-purple-700">加算: +40万円</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg">カテゴリB</CardTitle>
                <CardDescription>派遣労働者からの転換</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>派遣先に直接雇用</li>
                  <li>派遣期間6ヶ月以上</li>
                </ul>
                <p className="mt-3 font-medium text-purple-700">加算: +40万円</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg">カテゴリC</CardTitle>
                <CardDescription>正社員求人→有期雇用</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>正社員として応募</li>
                  <li>有期雇用で採用</li>
                </ul>
                <p className="mt-3 font-medium text-purple-700">加算: +40万円</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 推奨ワークフロー */}
        <section id="workflow" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">9. 推奨ワークフロー</h2>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium">事前確認フェーズ</h4>
                    <p className="text-sm text-gray-600">支給要件チェック → 受給資格の確認</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium">データ収集フェーズ</h4>
                    <p className="text-sm text-gray-600">書類チェック → 必要書類の確認と収集</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium">計算・検証フェーズ</h4>
                    <p className="text-sm text-gray-600">賃金上昇率計算 → 3%要件の確認</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-medium">申請管理フェーズ</h4>
                    <p className="text-sm text-gray-600">ダッシュボードで進捗管理 → 期限管理</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">10. よくある質問</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q. ログインしなくても使えますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p>はい、賃金計算など一部機能はログインなしでもお試しいただけます。ただし、ダッシュボードでの顧問先・申請管理にはログインが必要です。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q. 入力したデータはどこに保存されますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p>データはブラウザのローカルストレージに保存されます。定期的に「設定」画面からJSONバックアップを取ることをお勧めします。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q. 複数の対象労働者を管理できますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p>はい、ダッシュボード機能で複数の顧問先企業と申請案件を管理できます。企業ごとに労働者を整理して表示できます。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Q. データのバックアップ方法は？</CardTitle>
              </CardHeader>
              <CardContent>
                <p>「設定」ページからJSONエクスポートでバックアップできます。復元もJSONファイルをインポートするだけです。CSVエクスポートでExcel編集も可能です。</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b">お問い合わせ</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">システムに関するお問い合わせ</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Issues
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">助成金制度に関するお問い合わせ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">管轄の労働局またはハローワークへ</p>
                <a
                  href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html"
                  className="text-blue-600 hover:underline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  厚生労働省 キャリアアップ助成金
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="text-center text-gray-500 text-sm py-8 border-t">
          <p>最終更新日: 2026年1月5日</p>
          <p className="mt-2">&copy; 2025 キャリアアップ助成金 申請支援システム</p>
        </footer>
      </main>
    </div>
  );
}
