"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ========================================
// 型定義
// ========================================

interface ApplicationFormData {
  // 事業所情報
  companyName: string;
  postalCode: string;
  address: string;
  phone: string;
  insuranceNumber: string;
  representativeName: string;
  representativeTitle: string;
  careerUpManager: string;
  isSmallBusiness: boolean;

  // 対象労働者情報
  workerName: string;
  workerNameKana: string;
  birthDate: string;
  gender: '男' | '女';
  hireDate: string;
  conversionDate: string;
  preEmploymentType: string;
  postEmploymentType: string;

  // 賃金情報
  preSalary: number;
  postSalary: number;
  salaryIncreaseRate: number;

  // 重点支援対象者
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;

  // 申請金額
  baseAmount: number;
  priorityBonus: number;
  totalAmount: number;
}

// ========================================
// デモデータ
// ========================================

const DEMO_DATA: ApplicationFormData = {
  companyName: '株式会社サンプル',
  postalCode: '100-0001',
  address: '東京都千代田区千代田1-1-1',
  phone: '03-1234-5678',
  insuranceNumber: '1234-567890-1',
  representativeName: '山田 太郎',
  representativeTitle: '代表取締役',
  careerUpManager: '鈴木 一郎',
  isSmallBusiness: true,

  workerName: '田中 花子',
  workerNameKana: 'タナカ ハナコ',
  birthDate: '1990-05-15',
  gender: '女',
  hireDate: '2024-04-01',
  conversionDate: '2025-04-01',
  preEmploymentType: '有期雇用労働者',
  postEmploymentType: '正規雇用労働者',

  preSalary: 210000,
  postSalary: 227000,
  salaryIncreaseRate: 8.1,

  isPriorityTarget: true,
  priorityCategory: 'A',

  baseAmount: 800000,
  priorityBonus: 120000,
  totalAmount: 920000,
};

// ========================================
// PDF生成関数
// ========================================

async function generatePDF(data: ApplicationFormData): Promise<void> {
  // jsPDFを動的インポート（クライアントサイドのみで実行）
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // フォント設定（日本語対応のためにヘルベチカを使用、実際には日本語フォントの埋め込みが必要）
  doc.setFont('helvetica');

  // タイトル
  doc.setFontSize(16);
  doc.text('Career-Up Grant Application Summary', 105, 20, { align: 'center' });
  doc.text('キャリアアップ助成金 申請概要書', 105, 28, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('ja-JP')}`, 105, 35, { align: 'center' });

  // 区切り線
  doc.setDrawColor(200);
  doc.line(20, 40, 190, 40);

  let y = 50;

  // 事業所情報セクション
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 200);
  doc.text('1. Company Information / 事業所情報', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);

  const companyInfo = [
    ['Company Name / 事業所名称', data.companyName],
    ['Insurance Number / 雇用保険番号', data.insuranceNumber],
    ['Address / 所在地', `${data.postalCode} ${data.address}`],
    ['Phone / 電話番号', data.phone],
    ['Representative / 代表者', `${data.representativeTitle} ${data.representativeName}`],
    ['Career-Up Manager / キャリアアップ管理者', data.careerUpManager],
    ['Company Size / 企業規模', data.isSmallBusiness ? 'SME / 中小企業' : 'Large / 大企業'],
  ];

  companyInfo.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, y);
    doc.text(String(value), 100, y);
    y += 6;
  });

  y += 5;

  // 対象労働者情報セクション
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 200);
  doc.text('2. Worker Information / 対象労働者情報', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);

  const workerInfo = [
    ['Name / 氏名', `${data.workerName} (${data.workerNameKana})`],
    ['Birth Date / 生年月日', data.birthDate],
    ['Gender / 性別', data.gender === '男' ? 'Male / 男' : 'Female / 女'],
    ['Hire Date / 雇入れ日', data.hireDate],
    ['Conversion Date / 転換日', data.conversionDate],
    ['Pre-Conversion Type / 転換前雇用形態', data.preEmploymentType],
    ['Post-Conversion Type / 転換後雇用形態', data.postEmploymentType],
  ];

  workerInfo.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, y);
    doc.text(String(value), 100, y);
    y += 6;
  });

  y += 5;

  // 賃金情報セクション
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 200);
  doc.text('3. Salary Information / 賃金情報', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);

  const salaryInfo = [
    ['Pre-Conversion Salary / 転換前賃金', `${data.preSalary.toLocaleString()} JPY/month`],
    ['Post-Conversion Salary / 転換後賃金', `${data.postSalary.toLocaleString()} JPY/month`],
    ['Increase Rate / 賃金上昇率', `${data.salaryIncreaseRate.toFixed(2)}% (Requirement: 3%+)`],
  ];

  salaryInfo.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, y);
    doc.text(String(value), 100, y);
    y += 6;
  });

  y += 5;

  // 助成金額セクション
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 200);
  doc.text('4. Grant Amount / 助成金額', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);

  const grantInfo = [
    ['Priority Target / 重点支援対象者', data.isPriorityTarget ? `Yes - Category ${data.priorityCategory}` : 'No'],
    ['Base Amount / 基本額', `${data.baseAmount.toLocaleString()} JPY`],
    ['Priority Bonus / 加算額', `${data.priorityBonus.toLocaleString()} JPY`],
  ];

  grantInfo.forEach(([label, value]) => {
    doc.text(`${label}:`, 25, y);
    doc.text(String(value), 100, y);
    y += 6;
  });

  // 合計金額（強調）
  y += 3;
  doc.setFontSize(12);
  doc.setTextColor(0, 150, 0);
  doc.text('Total Amount / 合計金額:', 25, y);
  doc.text(`${data.totalAmount.toLocaleString()} JPY`, 100, y);

  // フッター
  y = 270;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('This document is a summary for reference purposes only.', 105, y, { align: 'center' });
  doc.text('For official applications, please use the forms provided by the Ministry of Health, Labour and Welfare.', 105, y + 4, { align: 'center' });
  doc.text('本書類は参考用の概要書です。正式な申請には厚生労働省指定の様式をご使用ください。', 105, y + 8, { align: 'center' });

  // PDFをダウンロード
  const fileName = `career_up_grant_${data.workerName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ========================================
// コンポーネント
// ========================================

export default function ExportPage() {
  const [formData, setFormData] = useState<ApplicationFormData>(DEMO_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // PDF生成
  const handleGeneratePDF = useCallback(async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      await generatePDF(formData);
      setMessage('PDFが正常に生成されました');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      setMessage('PDF生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  // フィールド更新
  const updateField = (field: keyof ApplicationFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <h1 className="text-3xl font-bold text-center mb-2">書類エクスポート</h1>
        <p className="text-gray-600 text-center mb-8">
          申請概要書をPDFとしてエクスポートします
        </p>

        {/* 機能説明 */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertTitle className="text-blue-800">申請書類の自動生成</AlertTitle>
          <AlertDescription className="text-blue-700">
            入力したデータから申請概要書（PDF）を生成します。
            正式な申請には厚生労働省の指定様式をご使用ください。
          </AlertDescription>
        </Alert>

        {/* メッセージ表示 */}
        {message && (
          <Alert className={`mb-6 ${message.includes('エラー') ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
            <AlertDescription className={message.includes('エラー') ? 'text-red-700' : 'text-green-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* 事業所情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>事業所情報</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">事業所名称</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="insuranceNumber">雇用保険適用事業所番号</Label>
              <Input
                id="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={(e) => updateField('insuranceNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">所在地</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="representativeName">代表者氏名</Label>
              <Input
                id="representativeName"
                value={formData.representativeName}
                onChange={(e) => updateField('representativeName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="careerUpManager">キャリアアップ管理者</Label>
              <Input
                id="careerUpManager"
                value={formData.careerUpManager}
                onChange={(e) => updateField('careerUpManager', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 対象労働者情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>対象労働者情報</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workerName">氏名</Label>
              <Input
                id="workerName"
                value={formData.workerName}
                onChange={(e) => updateField('workerName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="workerNameKana">氏名（カナ）</Label>
              <Input
                id="workerNameKana"
                value={formData.workerNameKana}
                onChange={(e) => updateField('workerNameKana', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="birthDate">生年月日</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hireDate">雇入れ日</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => updateField('hireDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conversionDate">転換日</Label>
              <Input
                id="conversionDate"
                type="date"
                value={formData.conversionDate}
                onChange={(e) => updateField('conversionDate', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 賃金・助成金情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>賃金・助成金情報</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preSalary">転換前賃金（月額）</Label>
              <Input
                id="preSalary"
                type="number"
                value={formData.preSalary}
                onChange={(e) => updateField('preSalary', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="postSalary">転換後賃金（月額）</Label>
              <Input
                id="postSalary"
                type="number"
                value={formData.postSalary}
                onChange={(e) => updateField('postSalary', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="salaryIncreaseRate">賃金上昇率（%）</Label>
              <Input
                id="salaryIncreaseRate"
                type="number"
                step="0.01"
                value={formData.salaryIncreaseRate}
                onChange={(e) => updateField('salaryIncreaseRate', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="baseAmount">基本額</Label>
              <Input
                id="baseAmount"
                type="number"
                value={formData.baseAmount}
                onChange={(e) => updateField('baseAmount', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="priorityBonus">加算額</Label>
              <Input
                id="priorityBonus"
                type="number"
                value={formData.priorityBonus}
                onChange={(e) => updateField('priorityBonus', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">合計金額</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => updateField('totalAmount', Number(e.target.value))}
                className="font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* PDF生成ボタン */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            size="lg"
            className="px-8"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                PDF生成中...
              </>
            ) : (
              <>
                📄 PDFをダウンロード
              </>
            )}
          </Button>
        </div>

        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/summary">
            <Button variant="outline">申請可否判定へ</Button>
          </Link>
          <Link href="/documents/check">
            <Button variant="outline">書類チェックへ</Button>
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
