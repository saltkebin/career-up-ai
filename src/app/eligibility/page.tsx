"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================
// 型定義
// ============================================================

interface EligibilityCheckInput {
  hasCareerUpPlan: boolean;
  planSubmittedBeforeConversion: boolean;
  employmentPeriodMonths: number;
  isNotRegularFromStart: boolean;
  hasNoTerminationHistory: boolean;
  companyHasEmploymentRules: boolean;
  socialInsuranceEnrolled: boolean;
  noRelationWithEmployer: boolean;
}

interface CheckItem {
  item: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

interface EligibilityCheckResult {
  isEligible: boolean;
  checks: CheckItem[];
  fatalErrors: string[];
  warnings: string[];
}

interface PriorityTargetInput {
  isWithin3YearsOfHiring: boolean;
  wasNotInsuredBeforeHiring: boolean;
  isDispatchedWorker: boolean;
  appliedForRegularPosition: boolean;
  hiredAsFixedTermInstead: boolean;
}

interface PriorityTargetResult {
  isPriorityTarget: boolean;
  category: "A" | "B" | "C" | null;
  additionalAmount: number;
  message: string;
}

interface DeadlineResult {
  conversionDate: Date;
  salaryPeriodEnd: Date;
  applicationDeadline: Date;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
  message: string;
}

// ============================================================
// 計算ロジック
// ============================================================

function checkEligibility(input: EligibilityCheckInput): EligibilityCheckResult {
  const checks: CheckItem[] = [];
  const fatalErrors: string[] = [];
  const warnings: string[] = [];

  // キャリアアップ計画
  if (input.hasCareerUpPlan) {
    if (input.planSubmittedBeforeConversion) {
      checks.push({
        item: "キャリアアップ計画",
        passed: true,
        message: "キャリアアップ計画が転換前に届出されています",
        severity: "info",
      });
    } else {
      checks.push({
        item: "キャリアアップ計画",
        passed: false,
        message: "キャリアアップ計画は転換前に届出が必要です",
        severity: "error",
      });
      fatalErrors.push("キャリアアップ計画の届出が転換後になっています");
    }
  } else {
    checks.push({
      item: "キャリアアップ計画",
      passed: false,
      message: "キャリアアップ計画の届出が必要です",
      severity: "error",
    });
    fatalErrors.push("キャリアアップ計画が届出されていません");
  }

  // 雇用期間
  if (input.employmentPeriodMonths >= 6 && input.employmentPeriodMonths <= 36) {
    checks.push({
      item: "雇用期間",
      passed: true,
      message: `雇用期間${input.employmentPeriodMonths}ヶ月は要件を満たしています`,
      severity: "info",
    });
  } else if (input.employmentPeriodMonths < 6) {
    checks.push({
      item: "雇用期間",
      passed: false,
      message: "雇用期間が6ヶ月未満です",
      severity: "error",
    });
    fatalErrors.push("転換前の雇用期間が6ヶ月未満です");
  } else {
    checks.push({
      item: "雇用期間",
      passed: false,
      message: "雇用期間が3年を超えています",
      severity: "error",
    });
    fatalErrors.push("転換前の雇用期間が3年を超えています");
  }

  // 非正規雇用
  if (input.isNotRegularFromStart) {
    checks.push({
      item: "非正規雇用",
      passed: true,
      message: "転換前は非正規雇用として雇用されていました",
      severity: "info",
    });
  } else {
    checks.push({
      item: "非正規雇用",
      passed: false,
      message: "転換前から正社員として雇用されている場合は対象外です",
      severity: "error",
    });
    fatalErrors.push("転換前から正社員として雇用されています");
  }

  // 解雇歴
  if (input.hasNoTerminationHistory) {
    checks.push({
      item: "解雇歴",
      passed: true,
      message: "過去6ヶ月以内に解雇等がありません",
      severity: "info",
    });
  } else {
    checks.push({
      item: "解雇歴",
      passed: false,
      message: "過去6ヶ月以内に会社都合の解雇等がある場合は対象外です",
      severity: "error",
    });
    fatalErrors.push("過去6ヶ月以内に会社都合の解雇等があります");
  }

  // 就業規則
  if (input.companyHasEmploymentRules) {
    checks.push({
      item: "就業規則",
      passed: true,
      message: "就業規則が整備されています",
      severity: "info",
    });
  } else {
    checks.push({
      item: "就業規則",
      passed: false,
      message: "就業規則の整備が必要です",
      severity: "error",
    });
    fatalErrors.push("就業規則が整備されていません");
  }

  // 社会保険
  if (input.socialInsuranceEnrolled) {
    checks.push({
      item: "社会保険",
      passed: true,
      message: "社会保険に加入しています",
      severity: "info",
    });
  } else {
    checks.push({
      item: "社会保険",
      passed: false,
      message: "社会保険への加入が必要です",
      severity: "error",
    });
    fatalErrors.push("社会保険に加入していません");
  }

  // 事業主との関係
  if (input.noRelationWithEmployer) {
    checks.push({
      item: "事業主との関係",
      passed: true,
      message: "事業主と特別な関係にありません",
      severity: "info",
    });
  } else {
    checks.push({
      item: "事業主との関係",
      passed: false,
      message: "事業主の親族等は対象外です",
      severity: "error",
    });
    fatalErrors.push("事業主の親族等に該当します");
  }

  return {
    isEligible: fatalErrors.length === 0,
    checks,
    fatalErrors,
    warnings,
  };
}

function checkPriorityTarget(input: PriorityTargetInput): PriorityTargetResult {
  if (input.isWithin3YearsOfHiring && input.wasNotInsuredBeforeHiring) {
    return {
      isPriorityTarget: true,
      category: "A",
      additionalAmount: 120000,
      message: "重点支援対象者（カテゴリA）：雇入れ後3年以内で、雇入れ前に雇用保険被保険者でなかった方",
    };
  }

  if (input.isDispatchedWorker) {
    return {
      isPriorityTarget: true,
      category: "B",
      additionalAmount: 120000,
      message: "重点支援対象者（カテゴリB）：派遣労働者からの転換",
    };
  }

  if (input.appliedForRegularPosition && input.hiredAsFixedTermInstead) {
    return {
      isPriorityTarget: true,
      category: "C",
      additionalAmount: 120000,
      message: "重点支援対象者（カテゴリC）：正社員求人への応募者で有期雇用された方",
    };
  }

  return {
    isPriorityTarget: false,
    category: null,
    additionalAmount: 0,
    message: "重点支援対象者には該当しません",
  };
}

function calculateDeadline(conversionDate: Date, salaryPaymentDay: number = 25): DeadlineResult {
  const salaryPeriodEnd = new Date(conversionDate);
  salaryPeriodEnd.setMonth(salaryPeriodEnd.getMonth() + 6);

  const sixthMonthPayment = new Date(salaryPeriodEnd);
  sixthMonthPayment.setDate(salaryPaymentDay);

  const applicationDeadline = new Date(sixthMonthPayment);
  applicationDeadline.setMonth(applicationDeadline.getMonth() + 2);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (applicationDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining >= 0 && daysRemaining <= 14;

  let message: string;
  if (isOverdue) {
    message = `申請期限を${Math.abs(daysRemaining)}日過ぎています。至急労働局にご相談ください。`;
  } else if (isUrgent) {
    message = `申請期限まであと${daysRemaining}日です。早急に申請準備を完了してください。`;
  } else if (daysRemaining <= 30) {
    message = `申請期限まであと${daysRemaining}日です。書類準備を進めてください。`;
  } else {
    message = `申請期限まであと${daysRemaining}日です。`;
  }

  return {
    conversionDate,
    salaryPeriodEnd,
    applicationDeadline,
    daysRemaining,
    isOverdue,
    isUrgent,
    message,
  };
}

function calculateSubsidyAmount(
  companySize: "large" | "small",
  isPriorityTarget: boolean
): { baseAmount: number; additionalAmount: number; totalAmount: number } {
  const baseAmount = companySize === "small" ? 800000 : 600000;
  const additionalAmount = isPriorityTarget ? 120000 : 0;

  return {
    baseAmount,
    additionalAmount,
    totalAmount: baseAmount + additionalAmount,
  };
}

// ============================================================
// チェックボックスコンポーネント
// ============================================================

function Checkbox({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300"
      />
      <div>
        <Label htmlFor={id} className="cursor-pointer font-medium">
          {label}
        </Label>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

// デモ用データパターン
const DEMO_SCENARIOS = {
  allPass: {
    name: "全要件クリア+重点支援",
    eligibility: {
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: true,
      employmentPeriodMonths: 12,
      isNotRegularFromStart: true,
      hasNoTerminationHistory: true,
      companyHasEmploymentRules: true,
      socialInsuranceEnrolled: true,
      noRelationWithEmployer: true,
    },
    priority: {
      isWithin3YearsOfHiring: true,
      wasNotInsuredBeforeHiring: true,
      isDispatchedWorker: false,
      appliedForRegularPosition: false,
      hiredAsFixedTermInstead: false,
    },
  },
  planError: {
    name: "計画届出エラー",
    eligibility: {
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: false, // 転換後に届出
      employmentPeriodMonths: 12,
      isNotRegularFromStart: true,
      hasNoTerminationHistory: true,
      companyHasEmploymentRules: true,
      socialInsuranceEnrolled: true,
      noRelationWithEmployer: true,
    },
    priority: {
      isWithin3YearsOfHiring: false,
      wasNotInsuredBeforeHiring: false,
      isDispatchedWorker: false,
      appliedForRegularPosition: false,
      hiredAsFixedTermInstead: false,
    },
  },
  dispatchWorker: {
    name: "派遣労働者（カテゴリB）",
    eligibility: {
      hasCareerUpPlan: true,
      planSubmittedBeforeConversion: true,
      employmentPeriodMonths: 18,
      isNotRegularFromStart: true,
      hasNoTerminationHistory: true,
      companyHasEmploymentRules: true,
      socialInsuranceEnrolled: true,
      noRelationWithEmployer: true,
    },
    priority: {
      isWithin3YearsOfHiring: false,
      wasNotInsuredBeforeHiring: false,
      isDispatchedWorker: true,
      appliedForRegularPosition: false,
      hiredAsFixedTermInstead: false,
    },
  },
};

export default function EligibilityPage() {
  // 支給要件チェック
  const [eligibilityInput, setEligibilityInput] = useState<EligibilityCheckInput>({
    hasCareerUpPlan: true,
    planSubmittedBeforeConversion: true,
    employmentPeriodMonths: 12,
    isNotRegularFromStart: true,
    hasNoTerminationHistory: true,
    companyHasEmploymentRules: true,
    socialInsuranceEnrolled: true,
    noRelationWithEmployer: true,
  });

  // 重点支援対象者
  const [priorityInput, setPriorityInput] = useState<PriorityTargetInput>({
    isWithin3YearsOfHiring: true,
    wasNotInsuredBeforeHiring: true,
    isDispatchedWorker: false,
    appliedForRegularPosition: false,
    hiredAsFixedTermInstead: false,
  });

  // 企業規模
  const [companySize, setCompanySize] = useState<"large" | "small">("small");

  // 転換日・給与支払日
  const [conversionDate, setConversionDate] = useState("2025-04-01");
  const [salaryPaymentDay, setSalaryPaymentDay] = useState(25);

  // 結果
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityCheckResult | null>(null);
  const [priorityResult, setPriorityResult] = useState<PriorityTargetResult | null>(null);
  const [deadlineResult, setDeadlineResult] = useState<DeadlineResult | null>(null);
  const [subsidyResult, setSubsidyResult] = useState<{
    baseAmount: number;
    additionalAmount: number;
    totalAmount: number;
  } | null>(null);

  // 初回ロード時に自動チェック
  useEffect(() => {
    const eligibility = checkEligibility(eligibilityInput);
    setEligibilityResult(eligibility);

    const priority = checkPriorityTarget(priorityInput);
    setPriorityResult(priority);

    const subsidy = calculateSubsidyAmount(companySize, priority.isPriorityTarget);
    setSubsidyResult(subsidy);

    if (conversionDate) {
      const deadline = calculateDeadline(new Date(conversionDate), salaryPaymentDay);
      setDeadlineResult(deadline);
    }
  }, []);

  // チェック実行
  const handleCheck = () => {
    const eligibility = checkEligibility(eligibilityInput);
    setEligibilityResult(eligibility);

    const priority = checkPriorityTarget(priorityInput);
    setPriorityResult(priority);

    const subsidy = calculateSubsidyAmount(companySize, priority.isPriorityTarget);
    setSubsidyResult(subsidy);

    if (conversionDate) {
      const deadline = calculateDeadline(new Date(conversionDate), salaryPaymentDay);
      setDeadlineResult(deadline);
    }
  };

  // デモシナリオ適用
  const applyDemoScenario = (scenarioKey: keyof typeof DEMO_SCENARIOS) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    setEligibilityInput(scenario.eligibility);
    setPriorityInput(scenario.priority);

    // 自動でチェック実行
    const eligibility = checkEligibility(scenario.eligibility);
    setEligibilityResult(eligibility);

    const priority = checkPriorityTarget(scenario.priority);
    setPriorityResult(priority);

    const subsidy = calculateSubsidyAmount(companySize, priority.isPriorityTarget);
    setSubsidyResult(subsidy);

    if (conversionDate) {
      const deadline = calculateDeadline(new Date(conversionDate), salaryPaymentDay);
      setDeadlineResult(deadline);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

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
        <h1 className="text-3xl font-bold mb-2">支給要件チェック</h1>
        <p className="text-gray-600 mb-8">
          キャリアアップ助成金の支給要件を確認し、受給資格があるかチェックします
        </p>

        {/* デモシナリオ選択 */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <Label className="text-sm text-gray-600 mb-2 block">デモシナリオを試す:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyDemoScenario(key as keyof typeof DEMO_SCENARIOS)}
                  className="text-xs"
                >
                  {scenario.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 基本要件 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本要件</CardTitle>
            <CardDescription>
              助成金を受給するための必須要件を確認してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Checkbox
              id="hasCareerUpPlan"
              checked={eligibilityInput.hasCareerUpPlan}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({ ...prev, hasCareerUpPlan: checked }))
              }
              label="キャリアアップ計画を届出している"
              description="管轄の労働局にキャリアアップ計画を届け出ている必要があります"
            />
            {eligibilityInput.hasCareerUpPlan && (
              <div className="ml-7">
                <Checkbox
                  id="planSubmittedBeforeConversion"
                  checked={eligibilityInput.planSubmittedBeforeConversion}
                  onChange={(checked) =>
                    setEligibilityInput((prev) => ({
                      ...prev,
                      planSubmittedBeforeConversion: checked,
                    }))
                  }
                  label="転換前に届出を完了している"
                  description="計画の届出は必ず転換前に行う必要があります（重要）"
                />
              </div>
            )}
            <Checkbox
              id="isNotRegularFromStart"
              checked={eligibilityInput.isNotRegularFromStart}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({ ...prev, isNotRegularFromStart: checked }))
              }
              label="転換前は非正規雇用（有期契約・パート等）だった"
              description="最初から正社員として雇用された場合は対象外です"
            />
            <Checkbox
              id="hasNoTerminationHistory"
              checked={eligibilityInput.hasNoTerminationHistory}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({ ...prev, hasNoTerminationHistory: checked }))
              }
              label="過去6ヶ月以内に会社都合の解雇等がない"
              description="事業主都合による解雇や退職勧奨がある場合は対象外です"
            />
            <Checkbox
              id="companyHasEmploymentRules"
              checked={eligibilityInput.companyHasEmploymentRules}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  companyHasEmploymentRules: checked,
                }))
              }
              label="就業規則が整備されている"
              description="正社員への転換制度が就業規則に明記されている必要があります"
            />
            <Checkbox
              id="socialInsuranceEnrolled"
              checked={eligibilityInput.socialInsuranceEnrolled}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({ ...prev, socialInsuranceEnrolled: checked }))
              }
              label="社会保険に加入している"
              description="健康保険・厚生年金保険に加入している必要があります"
            />
            <Checkbox
              id="noRelationWithEmployer"
              checked={eligibilityInput.noRelationWithEmployer}
              onChange={(checked) =>
                setEligibilityInput((prev) => ({ ...prev, noRelationWithEmployer: checked }))
              }
              label="事業主の親族等ではない"
              description="事業主の3親等以内の親族は対象外です"
            />

            <div className="pt-4">
              <Label>転換前の雇用期間（月数）</Label>
              <Input
                type="number"
                value={eligibilityInput.employmentPeriodMonths}
                onChange={(e) =>
                  setEligibilityInput((prev) => ({
                    ...prev,
                    employmentPeriodMonths: Number(e.target.value),
                  }))
                }
                className="mt-1 w-32"
                min={1}
              />
              <p className="text-sm text-gray-500 mt-1">6ヶ月以上3年以内が要件です</p>
            </div>
          </CardContent>
        </Card>

        {/* 重点支援対象者 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>重点支援対象者の判定（2025年度新設）</CardTitle>
            <CardDescription>
              該当すると12万円の加算があります。いずれかに当てはまるかチェックしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
              <h4 className="font-medium">カテゴリA: 新規雇用者</h4>
              <Checkbox
                id="isWithin3YearsOfHiring"
                checked={priorityInput.isWithin3YearsOfHiring}
                onChange={(checked) =>
                  setPriorityInput((prev) => ({ ...prev, isWithin3YearsOfHiring: checked }))
                }
                label="雇入れから3年以内である"
              />
              <Checkbox
                id="wasNotInsuredBeforeHiring"
                checked={priorityInput.wasNotInsuredBeforeHiring}
                onChange={(checked) =>
                  setPriorityInput((prev) => ({ ...prev, wasNotInsuredBeforeHiring: checked }))
                }
                label="雇入れ前に雇用保険の被保険者ではなかった"
                description="学生、主婦、無職などから新たに雇用された方"
              />
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2 mb-4">
              <h4 className="font-medium">カテゴリB: 派遣労働者</h4>
              <Checkbox
                id="isDispatchedWorker"
                checked={priorityInput.isDispatchedWorker}
                onChange={(checked) =>
                  setPriorityInput((prev) => ({ ...prev, isDispatchedWorker: checked }))
                }
                label="派遣労働者として働いていた"
                description="派遣元で有期雇用され、派遣先で勤務していた方"
              />
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="font-medium">カテゴリC: 正社員希望者</h4>
              <Checkbox
                id="appliedForRegularPosition"
                checked={priorityInput.appliedForRegularPosition}
                onChange={(checked) =>
                  setPriorityInput((prev) => ({ ...prev, appliedForRegularPosition: checked }))
                }
                label="正社員の求人に応募した"
              />
              <Checkbox
                id="hiredAsFixedTermInstead"
                checked={priorityInput.hiredAsFixedTermInstead}
                onChange={(checked) =>
                  setPriorityInput((prev) => ({ ...prev, hiredAsFixedTermInstead: checked }))
                }
                label="結果として有期雇用で採用された"
                description="正社員を希望したが、まず有期雇用から始まった方"
              />
            </div>
          </CardContent>
        </Card>

        {/* 企業情報・期限 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>企業情報・申請期限</CardTitle>
            <CardDescription>企業規模と転換日を入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>企業規模</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="companySize"
                    value="small"
                    checked={companySize === "small"}
                    onChange={() => setCompanySize("small")}
                    className="mr-2"
                  />
                  中小企業（基本額: 80万円）
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="companySize"
                    value="large"
                    checked={companySize === "large"}
                    onChange={() => setCompanySize("large")}
                    className="mr-2"
                  />
                  大企業（基本額: 60万円）
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>転換日</Label>
                <Input
                  type="date"
                  value={conversionDate}
                  onChange={(e) => setConversionDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>給与支払日</Label>
                <Input
                  type="number"
                  value={salaryPaymentDay}
                  onChange={(e) => setSalaryPaymentDay(Number(e.target.value))}
                  className="mt-1 w-24"
                  min={1}
                  max={31}
                />
                <p className="text-sm text-gray-500 mt-1">毎月の給与支払日（1〜31日）</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* チェックボタン */}
        <div className="text-center mb-6">
          <Button size="lg" onClick={handleCheck} className="px-12">
            要件をチェック
          </Button>
        </div>

        {/* 結果表示 */}
        {eligibilityResult && (
          <>
            {/* 支給要件結果 */}
            <Card
              className={`mb-6 ${
                eligibilityResult.isEligible ? "border-green-500" : "border-red-500"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {eligibilityResult.isEligible ? (
                    <>
                      <span className="text-green-600 text-2xl">✓</span>
                      <span className="text-green-600">基本要件を満たしています</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600 text-2xl">✗</span>
                      <span className="text-red-600">基本要件を満たしていません</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eligibilityResult.checks.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded ${
                        check.passed ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <span className={check.passed ? "text-green-600" : "text-red-600"}>
                        {check.passed ? "✓" : "✗"}
                      </span>
                      <span className="font-medium">{check.item}:</span>
                      <span>{check.message}</span>
                    </div>
                  ))}
                </div>

                {eligibilityResult.fatalErrors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>受給できない理由</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {eligibilityResult.fatalErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 重点支援対象者結果 */}
            {priorityResult && (
              <Card
                className={`mb-6 ${
                  priorityResult.isPriorityTarget ? "border-blue-500" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>重点支援対象者の判定結果</CardTitle>
                </CardHeader>
                <CardContent>
                  {priorityResult.isPriorityTarget ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 text-xl">★</span>
                        <span className="font-bold text-blue-800">
                          カテゴリ{priorityResult.category}に該当
                        </span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          +{priorityResult.additionalAmount.toLocaleString()}円
                        </span>
                      </div>
                      <p>{priorityResult.message}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">{priorityResult.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 助成金額 */}
            {subsidyResult && eligibilityResult.isEligible && (
              <Card className="mb-6 border-green-500">
                <CardHeader>
                  <CardTitle>想定助成金額</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-gray-50 p-4 rounded text-center cursor-help">
                          <div className="text-sm text-gray-600">基本額</div>
                          <div className="text-2xl font-bold">
                            {subsidyResult.baseAmount.toLocaleString()}円
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>中小企業80万円、大企業60万円が基本額です</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-blue-50 p-4 rounded text-center cursor-help">
                          <div className="text-sm text-gray-600">加算額</div>
                          <div className="text-2xl font-bold text-blue-600">
                            +{subsidyResult.additionalAmount.toLocaleString()}円
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>重点支援対象者（カテゴリA/B/C）に該当すると12万円が加算されます</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-green-50 p-4 rounded text-center cursor-help">
                          <div className="text-sm text-gray-600">合計</div>
                          <div className="text-3xl font-bold text-green-600">
                            {subsidyResult.totalAmount.toLocaleString()}円
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>第1期の想定助成金額です。重点支援対象者は第2期申請でさらに助成金が受けられます</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 申請期限 */}
            {deadlineResult && (
              <Card
                className={`mb-6 ${
                  deadlineResult.isOverdue
                    ? "border-red-500"
                    : deadlineResult.isUrgent
                    ? "border-orange-500"
                    : "border-green-500"
                }`}
              >
                <CardHeader>
                  <CardTitle>申請期限</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">転換日</div>
                      <div className="font-bold">{formatDate(deadlineResult.conversionDate)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">6ヶ月目の賃金支払</div>
                      <div className="font-bold">{formatDate(deadlineResult.salaryPeriodEnd)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">申請期限</div>
                      <div className="font-bold text-lg">
                        {formatDate(deadlineResult.applicationDeadline)}
                      </div>
                    </div>
                  </div>

                  <Alert
                    variant={deadlineResult.isOverdue ? "destructive" : "default"}
                    className={
                      deadlineResult.isUrgent && !deadlineResult.isOverdue
                        ? "border-orange-500 bg-orange-50"
                        : ""
                    }
                  >
                    <AlertTitle>
                      {deadlineResult.isOverdue
                        ? "期限超過"
                        : deadlineResult.isUrgent
                        ? "期限間近"
                        : "申請期限まで"}
                      {!deadlineResult.isOverdue && ` ${deadlineResult.daysRemaining}日`}
                    </AlertTitle>
                    <AlertDescription>{deadlineResult.message}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ナビゲーション */}
        <div className="flex justify-center gap-4">
          <Link href="/documents/check">
            <Button>書類チェックへ</Button>
          </Link>
          <Link href="/calculator">
            <Button variant="outline">賃金計算へ</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">トップへ戻る</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
