"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ドキュメントタイプの定義
const DOCUMENT_TYPES = [
  { value: 'salary_ledger', label: '賃金台帳', description: '転換前後の賃金情報を抽出' },
  { value: 'form_3', label: '様式第3号', description: '支給申請書の記入内容を抽出' },
  { value: 'employment_contract', label: '雇用契約書', description: '雇用形態・賃金情報を抽出' },
  { value: 'other', label: 'その他', description: '書類の内容を自動判定して抽出' },
];

interface ExtractedData {
  [key: string]: string | number | boolean | null | undefined;
}

interface OcrResult {
  success: boolean;
  rawText: string;
  extractedData: ExtractedData;
  documentType: string;
  error?: string;
}

export default function DocumentAnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('salary_ledger');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ファイル選択時の処理
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);

      // プレビュー用URLを作成
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, []);

  // OCR実行
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OCR処理に失敗しました');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, documentType]);

  // 抽出データの表示用フォーマット
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '（抽出できませんでした）';
    if (typeof value === 'boolean') return value ? 'あり' : 'なし';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // フィールド名の日本語変換
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      employee_name: '従業員名',
      period: '対象期間',
      base_salary: '基本給',
      fixed_allowances: '固定的手当',
      overtime_pay: '残業代',
      commuting_allowance: '通勤手当',
      total_payment: '総支給額',
      work_days: '出勤日数',
      scheduled_work_days: '所定労働日数',
      company_name: '事業所名称',
      insurance_number: '雇用保険適用事業所番号',
      representative_name: '代表者氏名',
      worker_name: '対象労働者氏名',
      conversion_date: '転換日',
      pre_salary_total: '転換前賃金合計',
      post_salary_total: '転換後賃金合計',
      salary_increase_rate: '賃金上昇率',
      application_amount: '申請金額',
      employment_type: '雇用形態',
      contract_start_date: '契約開始日',
      contract_end_date: '契約終了日',
      working_hours: '所定労働時間',
      has_bonus: '賞与',
      has_retirement_benefit: '退職金',
      rawText: '抽出テキスト',
    };
    return labels[key] || key;
  };

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
        <h1 className="text-3xl font-bold text-center mb-2">書類AI分析</h1>
        <p className="text-gray-600 text-center mb-8">
          Gemini 3 Flash を使用して書類から情報を自動抽出します
        </p>

        {/* 機能説明 */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertTitle className="text-blue-800">L3: 書類間整合性チェック</AlertTitle>
          <AlertDescription className="text-blue-700">
            賃金台帳や申請書をアップロードすると、AIが自動で情報を抽出します。
            抽出したデータは既存の入力データと照合し、整合性をチェックできます。
          </AlertDescription>
        </Alert>

        {/* アップロードセクション */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>書類をアップロード</CardTitle>
            <CardDescription>
              画像ファイル（PNG, JPG）またはPDFをアップロードしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ドキュメントタイプ選択 */}
            <div>
              <Label className="mb-2 block">書類の種類</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDocumentType(type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      documentType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ファイル選択 */}
            <div>
              <Label htmlFor="file" className="mb-2 block">ファイル選択</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500 mt-2">
                  選択中: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* プレビュー */}
            {previewUrl && (
              <div className="mt-4">
                <Label className="mb-2 block">プレビュー</Label>
                <div className="border rounded-lg p-2 bg-white max-h-64 overflow-auto">
                  <img
                    src={previewUrl}
                    alt="プレビュー"
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* 分析ボタン */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  AI分析中...
                </>
              ) : (
                '書類を分析'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 結果表示 */}
        {result && result.success && (
          <Card className="mb-6 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <span>✓</span>
                分析完了
              </CardTitle>
              <CardDescription className="text-green-700">
                {DOCUMENT_TYPES.find(t => t.value === result.documentType)?.label || '書類'}から情報を抽出しました
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {/* 抽出データ */}
              <div className="space-y-3">
                {Object.entries(result.extractedData)
                  .filter(([key]) => key !== 'rawText' && key !== 'parseError')
                  .map(([key, value]) => {
                    const formattedValue = formatValue(value);
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium text-gray-700">{getFieldLabel(key)}</span>
                        <span className={`${
                          value === null ? 'text-gray-400 italic' : 'text-gray-900'
                        }`}>
                          {formattedValue}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* 生テキスト（デバッグ用） */}
              {result.extractedData.rawText && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    抽出された生テキストを表示
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-48">
                    {result.rawText}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/documents/check">
            <Button variant="outline">書類チェックへ</Button>
          </Link>
          <Link href="/calculator">
            <Button variant="outline">賃金計算へ</Button>
          </Link>
          <Link href="/documents">
            <Button variant="outline">書類一覧へ戻る</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">トップへ戻る</Button>
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
