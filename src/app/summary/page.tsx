"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ========================================
// 型定義
// ========================================

interface ApplicationData {
  // 企業情報
  companyName: string;
  insuranceNumber: string;
  representativeName: string;
  isSmallBusiness: boolean;

  // 労働者情報
  workerName: string;
  hireDate: string;
  conversionDate: string;
  employmentPeriodMonths: number;

  // 賃金情報
  preSalary: number;
  postSalary: number;
  salaryIncreaseRate: number;

  // 要件チェック
  hasCareerUpPlan: boolean;
  planSubmittedBeforeConversion: boolean;
  hasEmploymentRules: boolean;
  hasSocialInsurance: boolean;
  noRelationWithEmployer: boolean;
  noTerminationHistory: boolean;

  // 重点支援対象者
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;

  // 書類チェック
  documentsComplete: boolean;
  missingDocuments: string[];
}

interface CheckResult {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface SummaryResult {
  overallStatus: 'eligible' | 'ineligible' | 'needs_review';
  estimatedAmount: number;
  baseAmount: number;
  priorityBonus: number;
  checkResults: CheckResult[];
  criticalIssues: string[];
  warnings: string[];
  applicationDeadline: string;
}

// ========================================
// デモデータ
// ========================================

const DEMO_SCENARIOS = {
  eligible: {
    name: '申請可能',
    description: '全要件クリア・重点支援対象者',
    data: {
      companyName: '株式会社サンプル',
      insuranceNumber: '1234-567890-1',
      representativeName: '山田太郎',
      isSmallBusiness: true,
      workerName: '田中花子',
      hireDate: '2024-04-01',
      conversionDate: '2025-04-01',
      employmentPeriodMonths: 12,
      preSalary: 210000,
      postSalary: 227000,
      salaryIncreaseRate: 8.1,
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: true,
      hasEmploymentRules: true,
      hasSocialInsurance: true,
      noRelationWithEmployer: true,
      noTerminationHistory: true,
      isPriorityTarget: true,
      priorityCategory: 'A' as const,
      documentsComplete: true,
      missingDocuments: [],
    },
  },
  salaryIssue: {
    name: '賃金要件未達',
    description: '3%賃金上昇要件を満たしていない',
    data: {
      companyName: '株式会社サンプル',
      insuranceNumber: '1234-567890-1',
      representativeName: '山田太郎',
      isSmallBusiness: true,
      workerName: '田中花子',
      hireDate: '2024-04-01',
      conversionDate: '2025-04-01',
      employmentPeriodMonths: 12,
      preSalary: 210000,
      postSalary: 213000,
      salaryIncreaseRate: 1.43,
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: true,
      hasEmploymentRules: true,
      hasSocialInsurance: true,
      noRelationWithEmployer: true,
      noTerminationHistory: true,
      isPriorityTarget: false,
      priorityCategory: null,
      documentsComplete: true,
      missingDocuments: [],
    },
  },
  documentIssue: {
    name: '書類不備',
    description: '計画届出が転換後になっている',
    data: {
      companyName: '株式会社サンプル',
      insuranceNumber: '1234-567890-1',
      representativeName: '山田太郎',
      isSmallBusiness: true,
      workerName: '田中花子',
      hireDate: '2024-04-01',
      conversionDate: '2025-04-01',
      employmentPeriodMonths: 12,
      preSalary: 210000,
      postSalary: 227000,
      salaryIncreaseRate: 8.1,
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: false,
      hasEmploymentRules: true,
      hasSocialInsurance: true,
      noRelationWithEmployer: true,
      noTerminationHistory: true,
      isPriorityTarget: false,
      priorityCategory: null,
      documentsComplete: false,
      missingDocuments: ['賃金台帳（12ヶ月分）', '出勤簿'],
    },
  },
};

// ========================================
// 判定ロジック
// ========================================

function calculateApplicationDeadline(conversionDate: string): string {
  const conversion = new Date(conversionDate);
  // 転換後6ヶ月の賃金支払日 + 2ヶ月
  const sixMonthsLater = new Date(conversion);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const deadline = new Date(sixMonthsLater);
  deadline.setMonth(deadline.getMonth() + 2);
  return deadline.toISOString().split('T')[0];
}

function validateApplication(data: ApplicationData): SummaryResult {
  const checkResults: CheckResult[] = [];
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  // 1. キャリアアップ計画チェック
  if (!data.hasCareerUpPlan) {
    checkResults.push({
      category: '計画届出',
      item: 'キャリアアップ計画',
      status: 'fail',
      message: 'キャリアアップ計画が届出されていません',
    });
    criticalIssues.push('キャリアアップ計画の届出が必要です');
  } else if (!data.planSubmittedBeforeConversion) {
    checkResults.push({
      category: '計画届出',
      item: '届出時期',
      status: 'fail',
      message: '計画の届出が転換後になっています',
    });
    criticalIssues.push('キャリアアップ計画は転換前に届出が必要です');
  } else {
    checkResults.push({
      category: '計画届出',
      item: 'キャリアアップ計画',
      status: 'pass',
      message: '計画が転換前に届出されています',
    });
  }

  // 2. 雇用期間チェック
  if (data.employmentPeriodMonths < 6) {
    checkResults.push({
      category: '雇用期間',
      item: '有期雇用期間',
      status: 'fail',
      message: `雇用期間${data.employmentPeriodMonths}ヶ月は6ヶ月未満です`,
    });
    criticalIssues.push('有期雇用期間が6ヶ月以上必要です');
  } else if (data.employmentPeriodMonths > 36) {
    checkResults.push({
      category: '雇用期間',
      item: '有期雇用期間',
      status: 'fail',
      message: `雇用期間${data.employmentPeriodMonths}ヶ月は3年を超えています`,
    });
    criticalIssues.push('有期雇用期間が3年以内である必要があります');
  } else {
    checkResults.push({
      category: '雇用期間',
      item: '有期雇用期間',
      status: 'pass',
      message: `雇用期間${data.employmentPeriodMonths}ヶ月は要件を満たしています`,
    });
  }

  // 3. 賃金上昇チェック
  const actualIncreaseRate = ((data.postSalary - data.preSalary) / data.preSalary) * 100;
  if (actualIncreaseRate < 3) {
    checkResults.push({
      category: '賃金要件',
      item: '3%賃金上昇',
      status: 'fail',
      message: `賃金上昇率${actualIncreaseRate.toFixed(2)}%は3%未満です`,
    });
    const requiredSalary = Math.ceil(data.preSalary * 1.03);
    const shortfall = requiredSalary - data.postSalary;
    criticalIssues.push(`賃金上昇率が3%未満です（あと月額${shortfall.toLocaleString()}円必要）`);
  } else {
    checkResults.push({
      category: '賃金要件',
      item: '3%賃金上昇',
      status: 'pass',
      message: `賃金上昇率${actualIncreaseRate.toFixed(2)}%は要件を満たしています`,
    });
  }

  // 4. 就業規則チェック
  if (!data.hasEmploymentRules) {
    checkResults.push({
      category: '就業規則',
      item: '転換制度',
      status: 'fail',
      message: '就業規則に転換制度が規定されていません',
    });
    criticalIssues.push('就業規則に正社員転換制度の規定が必要です');
  } else {
    checkResults.push({
      category: '就業規則',
      item: '転換制度',
      status: 'pass',
      message: '就業規則が整備されています',
    });
  }

  // 5. 社会保険チェック
  if (!data.hasSocialInsurance) {
    checkResults.push({
      category: '社会保険',
      item: '加入状況',
      status: 'fail',
      message: '社会保険に加入していません',
    });
    criticalIssues.push('社会保険への加入が必要です');
  } else {
    checkResults.push({
      category: '社会保険',
      item: '加入状況',
      status: 'pass',
      message: '社会保険に加入しています',
    });
  }

  // 6. 親族チェック
  if (!data.noRelationWithEmployer) {
    checkResults.push({
      category: '対象要件',
      item: '親族関係',
      status: 'fail',
      message: '事業主の親族等に該当します',
    });
    criticalIssues.push('事業主の3親等以内の親族は対象外です');
  } else {
    checkResults.push({
      category: '対象要件',
      item: '親族関係',
      status: 'pass',
      message: '親族関係はありません',
    });
  }

  // 7. 解雇歴チェック
  if (!data.noTerminationHistory) {
    checkResults.push({
      category: '対象要件',
      item: '解雇歴',
      status: 'fail',
      message: '過去6ヶ月以内に解雇等があります',
    });
    criticalIssues.push('過去6ヶ月以内に会社都合の解雇がある場合は対象外です');
  } else {
    checkResults.push({
      category: '対象要件',
      item: '解雇歴',
      status: 'pass',
      message: '解雇歴はありません',
    });
  }

  // 8. 書類チェック
  if (!data.documentsComplete) {
    checkResults.push({
      category: '書類',
      item: '必要書類',
      status: 'warning',
      message: `不足書類: ${data.missingDocuments.join(', ')}`,
    });
    warnings.push(`不足している書類があります: ${data.missingDocuments.join(', ')}`);
  } else {
    checkResults.push({
      category: '書類',
      item: '必要書類',
      status: 'pass',
      message: '全ての書類が揃っています',
    });
  }

  // 助成金額計算
  const baseAmount = data.isSmallBusiness ? 800000 : 600000;
  const priorityBonus = data.isPriorityTarget ? 120000 : 0;
  const estimatedAmount = baseAmount + priorityBonus;

  // 重点支援対象者チェック
  if (data.isPriorityTarget) {
    checkResults.push({
      category: '加算',
      item: '重点支援対象者',
      status: 'pass',
      message: `カテゴリ${data.priorityCategory}に該当（+${priorityBonus.toLocaleString()}円）`,
    });
  }

  // 総合判定
  let overallStatus: 'eligible' | 'ineligible' | 'needs_review';
  if (criticalIssues.length > 0) {
    overallStatus = 'ineligible';
  } else if (warnings.length > 0) {
    overallStatus = 'needs_review';
  } else {
    overallStatus = 'eligible';
  }

  return {
    overallStatus,
    estimatedAmount,
    baseAmount,
    priorityBonus,
    checkResults,
    criticalIssues,
    warnings,
    applicationDeadline: calculateApplicationDeadline(data.conversionDate),
  };
}

// ========================================
// コンポーネント
// ========================================

export default function SummaryPage() {
  const [applicationData, setApplicationData] = useState<ApplicationData>(DEMO_SCENARIOS.eligible.data);
  const [result, setResult] = useState<SummaryResult | null>(null);

  // デモシナリオ適用
  const applyScenario = useCallback((scenarioKey: keyof typeof DEMO_SCENARIOS) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    setApplicationData(scenario.data);
  }, []);

  // 初回ロード時に判定実行
  useEffect(() => {
    const summaryResult = validateApplication(applicationData);
    setResult(summaryResult);
  }, [applicationData]);

  // 判定実行
  const handleValidate = useCallback(() => {
    const summaryResult = validateApplication(applicationData);
    setResult(summaryResult);
  }, [applicationData]);

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'warning': return '⚠';
    }
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
        <h1 className="text-3xl font-bold text-center mb-2">申請可否判定</h1>
        <p className="text-gray-600 text-center mb-8">
          L4: 要件充足チェック - 全ての要件を総合的に判定します
        </p>

        {/* デモシナリオ */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">デモシナリオを試す:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => applyScenario(key as keyof typeof DEMO_SCENARIOS)}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 総合判定結果 */}
        {result && (
          <>
            <Card className={`mb-6 ${
              result.overallStatus === 'eligible' ? 'border-green-500' :
              result.overallStatus === 'needs_review' ? 'border-yellow-500' :
              'border-red-500'
            }`}>
              <CardHeader className={`${
                result.overallStatus === 'eligible' ? 'bg-green-50' :
                result.overallStatus === 'needs_review' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">
                    {result.overallStatus === 'eligible' ? '✓' :
                     result.overallStatus === 'needs_review' ? '⚠' : '✗'}
                  </span>
                  <div>
                    <div className={`text-xl ${
                      result.overallStatus === 'eligible' ? 'text-green-800' :
                      result.overallStatus === 'needs_review' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {result.overallStatus === 'eligible' ? '申請可能' :
                       result.overallStatus === 'needs_review' ? '確認が必要' :
                       '申請不可'}
                    </div>
                    <div className="text-sm font-normal text-gray-600">
                      {applicationData.companyName} / {applicationData.workerName}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* 助成金額 */}
                <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">基本額</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.baseAmount.toLocaleString()}円
                    </div>
                    <div className="text-xs text-gray-400">
                      {applicationData.isSmallBusiness ? '中小企業' : '大企業'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">加算額</div>
                    <div className="text-2xl font-bold text-purple-600">
                      +{result.priorityBonus.toLocaleString()}円
                    </div>
                    <div className="text-xs text-gray-400">
                      {applicationData.isPriorityTarget ? `カテゴリ${applicationData.priorityCategory}` : 'なし'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">想定助成金額</div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.estimatedAmount.toLocaleString()}円
                    </div>
                  </div>
                </div>

                {/* 申請期限 */}
                <Alert className="mb-4">
                  <AlertTitle>申請期限</AlertTitle>
                  <AlertDescription>
                    <span className="font-bold text-lg">{result.applicationDeadline}</span>
                    <span className="ml-2 text-gray-500">
                      （転換日 {applicationData.conversionDate} から起算）
                    </span>
                  </AlertDescription>
                </Alert>

                {/* 致命的な問題 */}
                {result.criticalIssues.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>申請不可の理由</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2">
                        {result.criticalIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* 警告 */}
                {result.warnings.length > 0 && (
                  <Alert className="mb-4 border-yellow-500 bg-yellow-50">
                    <AlertTitle className="text-yellow-800">確認が必要な項目</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      <ul className="list-disc list-inside mt-2">
                        {result.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 詳細チェック結果 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>要件チェック詳細</CardTitle>
                <CardDescription>
                  各要件の判定結果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.checkResults.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getStatusIcon(check.status)}</span>
                        <div>
                          <span className="font-medium">{check.category}</span>
                          <span className="text-gray-400 mx-2">/</span>
                          <span>{check.item}</span>
                        </div>
                      </div>
                      <div className="text-sm text-right max-w-xs">
                        {check.message}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/calculator">
            <Button variant="outline">賃金計算へ</Button>
          </Link>
          <Link href="/eligibility">
            <Button variant="outline">要件チェックへ</Button>
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
