"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            キャリアアップ助成金 申請支援
          </Link>
          <Link href="/login">
            <Button variant="outline">ログイン</Button>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">書類チェック</h1>
        <p className="text-gray-600 text-center mb-8">
          申請に必要な書類が揃っているか、記入漏れがないかを確認します
        </p>

        {/* 機能説明 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                L2: 添付書類チェック
              </CardTitle>
              <CardDescription>
                必要書類の過不足を確認
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ 申請書類（様式第3号など）</li>
                <li>✓ 雇用契約書（転換前・転換後）</li>
                <li>✓ 就業規則（転換前・転換後）</li>
                <li>✓ 賃金台帳・出勤簿（12ヶ月分）</li>
                <li>✓ 登記事項証明書</li>
                <li>✓ 重点支援対象者確認票（該当者のみ）</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                L1: 必須項目チェック
              </CardTitle>
              <CardDescription>
                申請書の記入漏れを検出
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ 雇用保険適用事業所番号</li>
                <li>✓ 事業所名称・代表者氏名</li>
                <li>✓ 対象労働者氏名・転換日</li>
                <li>✓ 転換前後の賃金情報</li>
                <li>✓ 署名・押印の有無</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 注意事項 */}
        <Alert className="mb-8">
          <AlertTitle>申請前の最終確認として</AlertTitle>
          <AlertDescription>
            <p className="mt-2">
              このツールは申請書類の基本的なチェックを行います。
              最終的な書類の確認は、管轄の労働局または社会保険労務士にご相談ください。
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ※ 書類のアップロードは不要です。手元の書類を見ながらチェックリストを確認してください。
            </p>
          </AlertDescription>
        </Alert>

        {/* 必要書類一覧 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>必要書類一覧</CardTitle>
            <CardDescription>
              キャリアアップ助成金（正社員化コース）の申請に必要な書類
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">申請書類</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>1. キャリアアップ計画書（届出済みの写し）</li>
                  <li>2. 様式第3号（キャリアアップ助成金支給申請書）</li>
                  <li>3. 様式第3号・別添様式1-1（正社員化コース内訳）</li>
                  <li>4. 様式第3号・別添様式1-2（賃金上昇要件確認書）</li>
                  <li>5. 支給要件確認申立書</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">雇用関連書類</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>6. 就業規則（転換前・転換後）</li>
                  <li>7. 雇用契約書または労働条件通知書（転換前・転換後）</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">賃金関連書類</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>8. 賃金台帳（転換前6ヶ月＋転換後6ヶ月）</li>
                  <li>9. 出勤簿またはタイムカード（転換前6ヶ月＋転換後6ヶ月）</li>
                  <li>10. 賃金3%増額計算書</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">会社関連書類</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>11. 登記事項証明書（発行から3ヶ月以内）</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">重点支援対象者のみ</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>12. 重点支援対象者確認票（+12万円加算に必要）</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/documents/check">
            <Button size="lg" className="w-full sm:w-auto">
              書類チェックを開始
            </Button>
          </Link>
          <Link href="/documents/analyze">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              📷 AI分析（OCR）
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              トップへ戻る
            </Button>
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2025 キャリアアップ助成金 申請支援アプリ</p>
        </div>
      </footer>
    </div>
  );
}
