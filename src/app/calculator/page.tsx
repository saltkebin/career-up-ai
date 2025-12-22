"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// 型定義
interface MonthlySalary {
  yearMonth: string;
  baseSalary: number;
  fixedAllowances: number;
  overtimePay: number;
  commutingAllowance: number;
  workDays: number;
  scheduledWorkDays: number;
}

interface SalaryIncreaseResult {
  success: boolean;
  preTotalSalary: number;
  postTotalSalary: number;
  increaseAmount: number;
  increaseRate: number;
  meetsRequirement: boolean;
  message: string;
  warnings: string[];
  errors: string[];
}

// 計算ロジック
function calculateEligibleSalary(salary: MonthlySalary): number {
  return salary.baseSalary + salary.fixedAllowances;
}

function normalizeMonthlyEligibleSalary(salary: MonthlySalary): number {
  const eligibleSalary = calculateEligibleSalary(salary);
  if (salary.workDays === salary.scheduledWorkDays || salary.scheduledWorkDays === 0) {
    return eligibleSalary;
  }
  if (salary.workDays < salary.scheduledWorkDays && salary.workDays > 0) {
    return (eligibleSalary / salary.workDays) * salary.scheduledWorkDays;
  }
  return eligibleSalary;
}

function validateSalaryData(
  salaries: MonthlySalary[],
  period: "pre" | "post"
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const periodLabel = period === "pre" ? "転換前" : "転換後";

  if (salaries.length !== 6) {
    errors.push(`${periodLabel}の賃金データは6ヶ月分必要です`);
  }

  salaries.forEach((salary, index) => {
    const monthLabel = `${periodLabel}${index + 1}ヶ月目`;
    if (salary.baseSalary <= 0) errors.push(`${monthLabel}: 基本給が0以下です`);
    if (salary.workDays <= 0) errors.push(`${monthLabel}: 実労働日数が0以下です`);
    if (salary.scheduledWorkDays <= 0) errors.push(`${monthLabel}: 所定労働日数が0以下です`);
    if (salary.workDays < salary.scheduledWorkDays * 0.8) {
      warnings.push(`${monthLabel}: 実労働日数が所定の80%未満です`);
    }
    if (salary.overtimePay > salary.baseSalary) {
      warnings.push(`${monthLabel}: 残業代が基本給より多いです`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

function calculateSalaryIncrease(
  preSalaries: MonthlySalary[],
  postSalaries: MonthlySalary[]
): SalaryIncreaseResult {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];

  const preValidation = validateSalaryData(preSalaries, "pre");
  const postValidation = validateSalaryData(postSalaries, "post");

  allErrors.push(...preValidation.errors, ...postValidation.errors);
  allWarnings.push(...preValidation.warnings, ...postValidation.warnings);

  if (allErrors.length > 0) {
    return {
      success: false,
      preTotalSalary: 0,
      postTotalSalary: 0,
      increaseAmount: 0,
      increaseRate: 0,
      meetsRequirement: false,
      message: "入力データにエラーがあります",
      warnings: allWarnings,
      errors: allErrors,
    };
  }

  const preTotalSalary = preSalaries.reduce((sum, s) => sum + normalizeMonthlyEligibleSalary(s), 0);
  const postTotalSalary = postSalaries.reduce((sum, s) => sum + normalizeMonthlyEligibleSalary(s), 0);
  const increaseAmount = postTotalSalary - preTotalSalary;
  const increaseRate = preTotalSalary > 0 ? (increaseAmount / preTotalSalary) * 100 : 0;
  const meetsRequirement = increaseRate >= 3;

  let message: string;
  if (meetsRequirement) {
    message = `賃金上昇率 ${increaseRate.toFixed(2)}% で3%要件を満たしています`;
  } else {
    const requiredIncrease = Math.ceil((preTotalSalary * 0.03 - increaseAmount) / 6);
    message = `賃金上昇率 ${increaseRate.toFixed(2)}% で3%要件を満たしていません。あと月額約${requiredIncrease.toLocaleString()}円の上昇が必要です`;
  }

  if (increaseRate >= 3 && increaseRate < 3.5) {
    allWarnings.push("賃金上昇率が3%ギリギリです。余裕を持った設計をお勧めします。");
  }

  return {
    success: true,
    preTotalSalary: Math.round(preTotalSalary),
    postTotalSalary: Math.round(postTotalSalary),
    increaseAmount: Math.round(increaseAmount),
    increaseRate,
    meetsRequirement,
    message,
    warnings: allWarnings,
    errors: allErrors,
  };
}

// 空の月次データ生成
function createEmptySalary(yearMonth: string): MonthlySalary {
  return {
    yearMonth,
    baseSalary: 0,
    fixedAllowances: 0,
    overtimePay: 0,
    commutingAllowance: 0,
    workDays: 20,
    scheduledWorkDays: 20,
  };
}

// 6ヶ月分の年月生成
function generate6Months(startYear: number, startMonth: number): string[] {
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(startYear, startMonth - 1 + i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }
  return months;
}

// ヘルプアイコンコンポーネント
function HelpIcon({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs bg-gray-200 rounded-full cursor-help">
          ?
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// 月次入力フォームコンポーネント
function MonthlyInputForm({
  salary,
  onChange,
  index,
  period,
}: {
  salary: MonthlySalary;
  onChange: (field: keyof MonthlySalary, value: number) => void;
  index: number;
  period: "pre" | "post";
}) {
  const periodLabel = period === "pre" ? "転換前" : "転換後";

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h4 className="font-medium mb-3 text-sm text-gray-700">
        {periodLabel} {index + 1}ヶ月目 ({salary.yearMonth})
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">
            基本給
            <HelpIcon text="月額の基本給です。3%計算の対象となります。" />
          </Label>
          <Input
            type="number"
            value={salary.baseSalary || ""}
            onChange={(e) => onChange("baseSalary", Number(e.target.value))}
            placeholder="200000"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">
            固定的諸手当
            <HelpIcon text="役職手当、資格手当など毎月固定で支給される手当。3%計算の対象です。" />
          </Label>
          <Input
            type="number"
            value={salary.fixedAllowances || ""}
            onChange={(e) => onChange("fixedAllowances", Number(e.target.value))}
            placeholder="10000"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-orange-600">
            残業代（除外）
            <HelpIcon text="残業代は3%計算から除外されます。参考値として入力してください。" />
          </Label>
          <Input
            type="number"
            value={salary.overtimePay || ""}
            onChange={(e) => onChange("overtimePay", Number(e.target.value))}
            placeholder="30000"
            className="mt-1 border-orange-200"
          />
        </div>
        <div>
          <Label className="text-xs text-orange-600">
            通勤手当（除外）
            <HelpIcon text="通勤手当は3%計算から除外されます。" />
          </Label>
          <Input
            type="number"
            value={salary.commutingAllowance || ""}
            onChange={(e) => onChange("commutingAllowance", Number(e.target.value))}
            placeholder="15000"
            className="mt-1 border-orange-200"
          />
        </div>
        <div>
          <Label className="text-xs">実労働日数</Label>
          <Input
            type="number"
            value={salary.workDays || ""}
            onChange={(e) => onChange("workDays", Number(e.target.value))}
            placeholder="20"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">所定労働日数</Label>
          <Input
            type="number"
            value={salary.scheduledWorkDays || ""}
            onChange={(e) => onChange("scheduledWorkDays", Number(e.target.value))}
            placeholder="20"
            className="mt-1"
          />
        </div>
      </div>
      <div className="mt-2 text-right text-sm">
        <span className="text-gray-500">対象賃金: </span>
        <span className="font-medium">
          {(salary.baseSalary + salary.fixedAllowances).toLocaleString()}円
        </span>
      </div>
    </div>
  );
}

// デモ用サンプルデータのパターン
const DEMO_PATTERNS = {
  // パターン1: 3%要件クリア（基本ケース）
  success: {
    name: "3%要件クリア",
    description: "基本給20万→21.7万で約4.8%上昇",
    pre: { baseSalary: 200000, fixedAllowances: 10000, overtimePay: 25000, commutingAllowance: 15000 },
    post: { baseSalary: 217000, fixedAllowances: 10000, overtimePay: 30000, commutingAllowance: 15000 },
  },
  // パターン2: 3%要件ギリギリ
  borderline: {
    name: "3%ギリギリ",
    description: "基本給20万→20.6万で約3.0%上昇（警告あり）",
    pre: { baseSalary: 200000, fixedAllowances: 10000, overtimePay: 25000, commutingAllowance: 15000 },
    post: { baseSalary: 206300, fixedAllowances: 10000, overtimePay: 30000, commutingAllowance: 15000 },
  },
  // パターン3: 3%要件未達
  failure: {
    name: "3%要件未達",
    description: "基本給20万→20.3万で約1.4%上昇（NG）",
    pre: { baseSalary: 200000, fixedAllowances: 10000, overtimePay: 25000, commutingAllowance: 15000 },
    post: { baseSalary: 203000, fixedAllowances: 10000, overtimePay: 30000, commutingAllowance: 15000 },
  },
  // パターン4: 固定手当で調整
  allowanceAdjust: {
    name: "手当で3%達成",
    description: "基本給据え置き、資格手当1万→2.5万で3.6%上昇",
    pre: { baseSalary: 200000, fixedAllowances: 10000, overtimePay: 25000, commutingAllowance: 15000 },
    post: { baseSalary: 200000, fixedAllowances: 25700, overtimePay: 30000, commutingAllowance: 15000 },
  },
};

export default function CalculatorPage() {
  const [conversionDate, setConversionDate] = useState("2025-04");
  const [preSalaries, setPreSalaries] = useState<MonthlySalary[]>([]);
  const [postSalaries, setPostSalaries] = useState<MonthlySalary[]>([]);
  const [result, setResult] = useState<SalaryIncreaseResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof DEMO_PATTERNS>("success");

  // 初回ロード時にデモデータを自動設定
  useEffect(() => {
    const preMonths = generate6Months(2024, 10); // 2024年10月〜2025年3月
    const postMonths = generate6Months(2025, 4);  // 2025年4月〜9月

    const pattern = DEMO_PATTERNS.success;
    const pre = preMonths.map((ym) => ({
      yearMonth: ym,
      ...pattern.pre,
      workDays: 20,
      scheduledWorkDays: 20,
    }));
    const post = postMonths.map((ym) => ({
      yearMonth: ym,
      ...pattern.post,
      workDays: 20,
      scheduledWorkDays: 20,
    }));

    setPreSalaries(pre);
    setPostSalaries(post);
    setIsInitialized(true);

    // 自動計算
    const calcResult = calculateSalaryIncrease(pre, post);
    setResult(calcResult);
  }, []);

  // 転換日から6ヶ月分のデータを初期化
  const initializeSalaries = useCallback(() => {
    if (!conversionDate) return;

    const [year, month] = conversionDate.split("-").map(Number);

    // 転換前6ヶ月
    const preMonths = generate6Months(year - 1, month + 6);
    const pre = preMonths.map((ym) => createEmptySalary(ym));

    // 転換後6ヶ月
    const postMonths = generate6Months(year, month);
    const post = postMonths.map((ym) => createEmptySalary(ym));

    setPreSalaries(pre);
    setPostSalaries(post);
    setIsInitialized(true);
    setResult(null);
  }, [conversionDate]);

  // 賃金データ更新
  const updatePreSalary = (index: number, field: keyof MonthlySalary, value: number) => {
    setPreSalaries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updatePostSalary = (index: number, field: keyof MonthlySalary, value: number) => {
    setPostSalaries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 計算実行
  const handleCalculate = () => {
    const calcResult = calculateSalaryIncrease(preSalaries, postSalaries);
    setResult(calcResult);
  };

  // サンプルデータ入力（パターン選択）
  const fillSampleData = (patternKey: keyof typeof DEMO_PATTERNS) => {
    if (!isInitialized) return;

    const pattern = DEMO_PATTERNS[patternKey];
    setSelectedPattern(patternKey);

    setPreSalaries((prev) =>
      prev.map((s) => ({
        ...s,
        ...pattern.pre,
        workDays: 20,
        scheduledWorkDays: 20,
      }))
    );

    setPostSalaries((prev) =>
      prev.map((s) => ({
        ...s,
        ...pattern.post,
        workDays: 20,
        scheduledWorkDays: 20,
      }))
    );

    // 自動計算
    const preData = preSalaries.map((s) => ({
      ...s,
      ...pattern.pre,
      workDays: 20,
      scheduledWorkDays: 20,
    }));
    const postData = postSalaries.map((s) => ({
      ...s,
      ...pattern.post,
      workDays: 20,
      scheduledWorkDays: 20,
    }));
    const calcResult = calculateSalaryIncrease(preData, postData);
    setResult(calcResult);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <Link href="/login">
            <Button variant="outline">ログイン</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">賃金上昇率計算</h1>
        <p className="text-gray-600 mb-8">
          転換前後の賃金を入力して、3%要件を満たしているか確認できます
        </p>

        {/* 注意事項 */}
        <Alert className="mb-6">
          <AlertTitle>3%計算の対象について</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              対象となるのは<strong>基本給</strong>と<strong>固定的諸手当</strong>のみです。
              以下は計算から除外されます：
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><span className="text-orange-600">残業代（時間外手当）</span> - 1分単位での計算が必要</li>
              <li><span className="text-orange-600">賞与</span> - 臨時的に支給される賃金</li>
              <li><span className="text-orange-600">通勤手当・住宅手当・家族手当</span> - 実費補填的な手当</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* 転換日入力 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: 転換日を入力</CardTitle>
            <CardDescription>
              正社員に転換した日付を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs">
                <Label>転換日</Label>
                <Input
                  type="month"
                  value={conversionDate}
                  onChange={(e) => setConversionDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={initializeSalaries} disabled={!conversionDate}>
                入力フォームを生成
              </Button>
            </div>
            {isInitialized && (
              <div className="mt-4">
                <Label className="text-sm text-gray-600 mb-2 block">デモデータを試す:</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DEMO_PATTERNS).map(([key, pattern]) => (
                    <Button
                      key={key}
                      variant={selectedPattern === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => fillSampleData(key as keyof typeof DEMO_PATTERNS)}
                      className="text-xs"
                    >
                      {pattern.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  現在: {DEMO_PATTERNS[selectedPattern].description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isInitialized && (
          <>
            {/* 転換前賃金 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 2: 転換前6ヶ月の賃金</CardTitle>
                <CardDescription>
                  正社員転換前6ヶ月間の賃金データを入力してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preSalaries.map((salary, index) => (
                    <MonthlyInputForm
                      key={salary.yearMonth}
                      salary={salary}
                      onChange={(field, value) => updatePreSalary(index, field, value)}
                      index={index}
                      period="pre"
                    />
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <span className="text-gray-600">転換前6ヶ月の対象賃金合計: </span>
                  <span className="text-xl font-bold">
                    {preSalaries
                      .reduce((sum, s) => sum + s.baseSalary + s.fixedAllowances, 0)
                      .toLocaleString()}
                    円
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 転換後賃金 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 3: 転換後6ヶ月の賃金</CardTitle>
                <CardDescription>
                  正社員転換後6ヶ月間の賃金データを入力してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postSalaries.map((salary, index) => (
                    <MonthlyInputForm
                      key={salary.yearMonth}
                      salary={salary}
                      onChange={(field, value) => updatePostSalary(index, field, value)}
                      index={index}
                      period="post"
                    />
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <span className="text-gray-600">転換後6ヶ月の対象賃金合計: </span>
                  <span className="text-xl font-bold">
                    {postSalaries
                      .reduce((sum, s) => sum + s.baseSalary + s.fixedAllowances, 0)
                      .toLocaleString()}
                    円
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 計算ボタン */}
            <div className="text-center mb-6">
              <Button size="lg" onClick={handleCalculate} className="px-12">
                賃金上昇率を計算
              </Button>
            </div>

            {/* 結果表示 */}
            {result && (
              <Card className={result.meetsRequirement ? "border-green-500" : "border-red-500"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.meetsRequirement ? (
                      <>
                        <span className="text-green-600 text-2xl">✓</span>
                        <span className="text-green-600">3%要件を満たしています</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-600 text-2xl">✗</span>
                        <span className="text-red-600">3%要件を満たしていません</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-600">転換前合計</div>
                      <div className="text-xl font-bold">
                        {result.preTotalSalary.toLocaleString()}円
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-600">転換後合計</div>
                      <div className="text-xl font-bold">
                        {result.postTotalSalary.toLocaleString()}円
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-sm text-gray-600">上昇額</div>
                      <div className="text-xl font-bold">
                        {result.increaseAmount >= 0 ? "+" : ""}
                        {result.increaseAmount.toLocaleString()}円
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded ${
                        result.meetsRequirement ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="text-sm text-gray-600">上昇率</div>
                      <div
                        className={`text-2xl font-bold ${
                          result.meetsRequirement ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.increaseRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <p className="text-lg mb-4">{result.message}</p>

                  {result.warnings.length > 0 && (
                    <Alert variant="default" className="mb-4">
                      <AlertTitle>注意</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTitle>エラー</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
