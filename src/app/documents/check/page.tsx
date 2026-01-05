"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentCode, DocumentCheckItem, DocumentCheckResult, MandatoryField } from "@/types/documents";

// ========================================
// 書類定義データ
// ========================================

interface DocumentDefinition {
  code: DocumentCode;
  name: string;
  nameShort: string;
  category: string;
  description: string;
  isRequired: boolean;
  isRequiredForPriorityTarget: boolean;
}

const DOCUMENT_DEFINITIONS: Record<DocumentCode, DocumentDefinition> = {
  career_up_plan: {
    code: 'career_up_plan',
    name: 'キャリアアップ計画書',
    nameShort: '計画書',
    category: 'application',
    description: '転換前に届出済みの計画書（写し）',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  form_3: {
    code: 'form_3',
    name: '様式第3号（支給申請書）',
    nameShort: '様式第3号',
    category: 'application',
    description: '助成金の支給申請書本体',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  form_3_1_1: {
    code: 'form_3_1_1',
    name: '様式第3号・別添様式1-1',
    nameShort: '別添1-1',
    category: 'application',
    description: '対象労働者ごとの詳細情報',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  form_3_1_2: {
    code: 'form_3_1_2',
    name: '様式第3号・別添様式1-2',
    nameShort: '別添1-2',
    category: 'application',
    description: '賃金上昇要件確認書',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  requirement_confirmation: {
    code: 'requirement_confirmation',
    name: '支給要件確認申立書',
    nameShort: '要件申立書',
    category: 'application',
    description: '支給要件を満たしていることの申立書',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  employment_rules_pre: {
    code: 'employment_rules_pre',
    name: '就業規則（転換前）',
    nameShort: '就業規則（前）',
    category: 'employment',
    description: '転換前の雇用形態に適用される就業規則',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  employment_rules_post: {
    code: 'employment_rules_post',
    name: '就業規則（転換後）',
    nameShort: '就業規則（後）',
    category: 'employment',
    description: '転換後の正社員に適用される就業規則',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  contract_pre: {
    code: 'contract_pre',
    name: '雇用契約書（転換前）',
    nameShort: '契約書（前）',
    category: 'employment',
    description: '転換前の有期雇用契約を証明する書類',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  contract_post: {
    code: 'contract_post',
    name: '雇用契約書（転換後）',
    nameShort: '契約書（後）',
    category: 'employment',
    description: '転換後の正社員契約を証明する書類',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  salary_ledger: {
    code: 'salary_ledger',
    name: '賃金台帳（12ヶ月分）',
    nameShort: '賃金台帳',
    category: 'salary',
    description: '転換前6ヶ月＋転換後6ヶ月の賃金支払記録',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  attendance_record: {
    code: 'attendance_record',
    name: '出勤簿/タイムカード（12ヶ月分）',
    nameShort: '出勤簿',
    category: 'salary',
    description: '転換前6ヶ月＋転換後6ヶ月の勤務記録',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  salary_calc: {
    code: 'salary_calc',
    name: '賃金3%増額計算書',
    nameShort: '3%計算書',
    category: 'salary',
    description: '3%以上の賃金上昇を計算した書類',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  company_registration: {
    code: 'company_registration',
    name: '登記事項証明書',
    nameShort: '登記簿',
    category: 'company',
    description: '法人の登記事項証明書（発行から3ヶ月以内）',
    isRequired: true,
    isRequiredForPriorityTarget: false,
  },
  priority_target_form: {
    code: 'priority_target_form',
    name: '重点支援対象者確認票',
    nameShort: '重点支援確認票',
    category: 'priority_target',
    description: '重点支援対象者であることを確認する書類',
    isRequired: false,
    isRequiredForPriorityTarget: true,
  },
};

// ========================================
// デモシナリオ
// ========================================

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  isPriorityTarget: boolean;
  documents: Record<DocumentCode, { isPresent: boolean; isComplete: boolean }>;
  fields: {
    companyName: string;
    insuranceNumber: string;
    representativeName: string;
    workerName: string;
    conversionDate: string;
    preSalary: number | null;
    postSalary: number | null;
  };
}

const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  allComplete: {
    id: 'allComplete',
    name: '全書類完備',
    description: '全ての書類が揃い、記入も完了',
    isPriorityTarget: true,
    documents: {
      career_up_plan: { isPresent: true, isComplete: true },
      form_3: { isPresent: true, isComplete: true },
      form_3_1_1: { isPresent: true, isComplete: true },
      form_3_1_2: { isPresent: true, isComplete: true },
      requirement_confirmation: { isPresent: true, isComplete: true },
      employment_rules_pre: { isPresent: true, isComplete: true },
      employment_rules_post: { isPresent: true, isComplete: true },
      contract_pre: { isPresent: true, isComplete: true },
      contract_post: { isPresent: true, isComplete: true },
      salary_ledger: { isPresent: true, isComplete: true },
      attendance_record: { isPresent: true, isComplete: true },
      salary_calc: { isPresent: true, isComplete: true },
      company_registration: { isPresent: true, isComplete: true },
      priority_target_form: { isPresent: true, isComplete: true },
    },
    fields: {
      companyName: '株式会社サンプル',
      insuranceNumber: '1234-567890-1',
      representativeName: '山田太郎',
      workerName: '田中花子',
      conversionDate: '2025-04-01',
      preSalary: 210000,
      postSalary: 227000,
    },
  },
  missingDocuments: {
    id: 'missingDocuments',
    name: '書類不足（3件）',
    description: '賃金台帳、出勤簿、登記簿が不足',
    isPriorityTarget: false,
    documents: {
      career_up_plan: { isPresent: true, isComplete: true },
      form_3: { isPresent: true, isComplete: true },
      form_3_1_1: { isPresent: true, isComplete: true },
      form_3_1_2: { isPresent: true, isComplete: true },
      requirement_confirmation: { isPresent: true, isComplete: true },
      employment_rules_pre: { isPresent: true, isComplete: true },
      employment_rules_post: { isPresent: true, isComplete: true },
      contract_pre: { isPresent: true, isComplete: true },
      contract_post: { isPresent: true, isComplete: true },
      salary_ledger: { isPresent: false, isComplete: false },
      attendance_record: { isPresent: false, isComplete: false },
      salary_calc: { isPresent: true, isComplete: true },
      company_registration: { isPresent: false, isComplete: false },
      priority_target_form: { isPresent: false, isComplete: false },
    },
    fields: {
      companyName: '株式会社サンプル',
      insuranceNumber: '1234-567890-1',
      representativeName: '山田太郎',
      workerName: '田中花子',
      conversionDate: '2025-04-01',
      preSalary: 210000,
      postSalary: 227000,
    },
  },
  incompleteFields: {
    id: 'incompleteFields',
    name: '記入漏れあり',
    description: '必須項目が未記入',
    isPriorityTarget: false,
    documents: {
      career_up_plan: { isPresent: true, isComplete: true },
      form_3: { isPresent: true, isComplete: false },
      form_3_1_1: { isPresent: true, isComplete: false },
      form_3_1_2: { isPresent: true, isComplete: true },
      requirement_confirmation: { isPresent: true, isComplete: false },
      employment_rules_pre: { isPresent: true, isComplete: true },
      employment_rules_post: { isPresent: true, isComplete: true },
      contract_pre: { isPresent: true, isComplete: true },
      contract_post: { isPresent: true, isComplete: true },
      salary_ledger: { isPresent: true, isComplete: true },
      attendance_record: { isPresent: true, isComplete: true },
      salary_calc: { isPresent: true, isComplete: true },
      company_registration: { isPresent: true, isComplete: true },
      priority_target_form: { isPresent: false, isComplete: false },
    },
    fields: {
      companyName: '株式会社サンプル',
      insuranceNumber: '',
      representativeName: '',
      workerName: '田中花子',
      conversionDate: '2025-04-01',
      preSalary: 210000,
      postSalary: null,
    },
  },
};

// ========================================
// 検証ロジック
// ========================================

function getRequiredDocuments(isPriorityTarget: boolean): DocumentCode[] {
  return Object.values(DOCUMENT_DEFINITIONS)
    .filter(doc => doc.isRequired || (isPriorityTarget && doc.isRequiredForPriorityTarget))
    .map(doc => doc.code);
}

function validateDocuments(
  documentStates: Record<DocumentCode, { isPresent: boolean; isComplete: boolean }>,
  isPriorityTarget: boolean
): DocumentCheckResult {
  const requiredDocs = getRequiredDocuments(isPriorityTarget);
  const missingDocuments: string[] = [];
  const incompleteDocuments: string[] = [];

  for (const code of requiredDocs) {
    const state = documentStates[code];
    const def = DOCUMENT_DEFINITIONS[code];
    if (!state?.isPresent) {
      missingDocuments.push(def.name);
    } else if (!state?.isComplete) {
      incompleteDocuments.push(def.name);
    }
  }

  const presentCount = requiredDocs.filter(code => documentStates[code]?.isPresent).length;
  const completeCount = requiredDocs.filter(code => documentStates[code]?.isComplete).length;

  let status: 'pass' | 'fail' | 'warning' = 'pass';
  if (missingDocuments.length > 0) {
    status = 'fail';
  } else if (incompleteDocuments.length > 0) {
    status = 'warning';
  }

  return {
    status,
    checkLevel: 2,
    totalRequired: requiredDocs.length,
    presentCount,
    completeCount,
    missingDocuments,
    incompleteDocuments,
    fieldErrors: [],
    checkedAt: new Date(),
  };
}

function validateFields(fields: DemoScenario['fields']): string[] {
  const errors: string[] = [];

  if (!fields.companyName?.trim()) {
    errors.push('事業所名称が未入力です');
  }
  if (!fields.insuranceNumber?.trim()) {
    errors.push('雇用保険適用事業所番号が未入力です');
  } else if (!/^\d{4}-\d{6}-\d$/.test(fields.insuranceNumber)) {
    errors.push('雇用保険適用事業所番号の形式が正しくありません（例: 1234-567890-1）');
  }
  if (!fields.representativeName?.trim()) {
    errors.push('代表者氏名が未入力です');
  }
  if (!fields.workerName?.trim()) {
    errors.push('対象労働者氏名が未入力です');
  }
  if (!fields.conversionDate?.trim()) {
    errors.push('転換日が未入力です');
  }
  if (fields.preSalary === null || fields.preSalary === undefined) {
    errors.push('転換前賃金が未入力です');
  }
  if (fields.postSalary === null || fields.postSalary === undefined) {
    errors.push('転換後賃金が未入力です');
  }

  // 3%チェック
  if (fields.preSalary && fields.postSalary) {
    const increaseRate = ((fields.postSalary - fields.preSalary) / fields.preSalary) * 100;
    if (increaseRate < 3) {
      errors.push(`賃金上昇率が3%未満です（現在: ${increaseRate.toFixed(2)}%）`);
    }
  }

  return errors;
}

// ========================================
// コンポーネント
// ========================================

export default function DocumentCheckPage() {
  const [isPriorityTarget, setIsPriorityTarget] = useState(false);
  const [documentStates, setDocumentStates] = useState<Record<DocumentCode, { isPresent: boolean; isComplete: boolean }>>(() => {
    const initial: Record<string, { isPresent: boolean; isComplete: boolean }> = {};
    for (const code of Object.keys(DOCUMENT_DEFINITIONS) as DocumentCode[]) {
      initial[code] = { isPresent: false, isComplete: false };
    }
    return initial as Record<DocumentCode, { isPresent: boolean; isComplete: boolean }>;
  });
  const [fields, setFields] = useState<DemoScenario['fields']>({
    companyName: '',
    insuranceNumber: '',
    representativeName: '',
    workerName: '',
    conversionDate: '',
    preSalary: null,
    postSalary: null,
  });
  const [result, setResult] = useState<DocumentCheckResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  // デモシナリオ適用
  const applyScenario = useCallback((scenarioId: string) => {
    const scenario = DEMO_SCENARIOS[scenarioId];
    if (!scenario) return;

    setIsPriorityTarget(scenario.isPriorityTarget);
    setDocumentStates(scenario.documents);
    setFields(scenario.fields);
  }, []);

  // 初回ロード時にデモシナリオを適用
  useEffect(() => {
    applyScenario('allComplete');
  }, [applyScenario]);

  // チェック実行
  const runCheck = useCallback(() => {
    const docResult = validateDocuments(documentStates, isPriorityTarget);
    const fieldErrs = validateFields(fields);

    // フィールドエラーがあれば結果に反映
    if (fieldErrs.length > 0 && docResult.status === 'pass') {
      docResult.status = 'warning';
    }
    if (fieldErrs.length > 0 && docResult.missingDocuments.length === 0) {
      docResult.checkLevel = 1;
    }
    docResult.fieldErrors = fieldErrs;

    setResult(docResult);
    setFieldErrors(fieldErrs);
  }, [documentStates, fields, isPriorityTarget]);

  // 書類チェックボックス変更
  const handleDocumentChange = (code: DocumentCode, field: 'isPresent' | 'isComplete', value: boolean) => {
    setDocumentStates(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value,
        // isPresentがfalseならisCompleteもfalse
        ...(field === 'isPresent' && !value ? { isComplete: false } : {}),
      },
    }));
  };

  // フィールド変更
  const handleFieldChange = (fieldName: keyof DemoScenario['fields'], value: string | number | null) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 書類カテゴリごとにグループ化
  const categoryGroups = [
    { category: 'application', title: '申請書類', codes: ['career_up_plan', 'form_3', 'form_3_1_1', 'form_3_1_2', 'requirement_confirmation'] },
    { category: 'employment', title: '雇用関連書類', codes: ['employment_rules_pre', 'employment_rules_post', 'contract_pre', 'contract_post'] },
    { category: 'salary', title: '賃金関連書類', codes: ['salary_ledger', 'attendance_record', 'salary_calc'] },
    { category: 'company', title: '会社関連書類', codes: ['company_registration'] },
    { category: 'priority_target', title: '重点支援対象者用', codes: ['priority_target_form'] },
  ];

  const requiredDocs = getRequiredDocuments(isPriorityTarget);

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
          必要書類の確認と必須項目のチェックを行います
        </p>

        {/* デモシナリオ */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">デモシナリオを試す:</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(DEMO_SCENARIOS).map(scenario => (
              <Button
                key={scenario.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  applyScenario(scenario.id);
                  setTimeout(runCheck, 100);
                }}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 重点支援対象者フラグ */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPriorityTarget}
                    onChange={(e) => setIsPriorityTarget(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium">重点支援対象者である</span>
                    <p className="text-sm text-gray-500">該当する場合は追加書類が必要です（+12万円加算）</p>
                  </div>
                </label>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>カテゴリA:雇入れ3年以内で保険未加入、B:派遣労働者、C:正社員希望で有期採用のいずれかに該当する場合にチェック</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        {/* L2: 書類チェックリスト */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>L2: 添付書類チェック</CardTitle>
            <CardDescription>
              必要書類が揃っているかチェックしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryGroups.map(group => {
                // 重点支援対象者でない場合はpriority_target_formを表示しない
                if (group.category === 'priority_target' && !isPriorityTarget) {
                  return null;
                }

                return (
                  <div key={group.category}>
                    <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">{group.title}</h4>
                    <div className="space-y-3">
                      {group.codes.map(code => {
                        const docCode = code as DocumentCode;
                        const def = DOCUMENT_DEFINITIONS[docCode];
                        const state = documentStates[docCode];
                        const isRequired = requiredDocs.includes(docCode);

                        return (
                          <div key={docCode} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={state.isPresent}
                                  onChange={(e) => handleDocumentChange(docCode, 'isPresent', e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">書類あり</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={state.isComplete}
                                  onChange={(e) => handleDocumentChange(docCode, 'isComplete', e.target.checked)}
                                  disabled={!state.isPresent}
                                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                />
                                <span className="text-sm">記入完了</span>
                              </label>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{def.name}</span>
                                {isRequired && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">必須</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{def.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* L1: 必須項目チェック */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>L1: 必須項目チェック</CardTitle>
            <CardDescription>
              様式第3号の主要な必須項目を確認してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">事業所名称</Label>
                <Input
                  id="companyName"
                  value={fields.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  placeholder="株式会社サンプル"
                />
              </div>
              <div>
                <Label htmlFor="insuranceNumber">雇用保険適用事業所番号</Label>
                <Input
                  id="insuranceNumber"
                  value={fields.insuranceNumber}
                  onChange={(e) => handleFieldChange('insuranceNumber', e.target.value)}
                  placeholder="1234-567890-1"
                />
                <p className="text-xs text-gray-500 mt-1">形式: 0000-000000-0</p>
              </div>
              <div>
                <Label htmlFor="representativeName">代表者氏名</Label>
                <Input
                  id="representativeName"
                  value={fields.representativeName}
                  onChange={(e) => handleFieldChange('representativeName', e.target.value)}
                  placeholder="山田太郎"
                />
              </div>
              <div>
                <Label htmlFor="workerName">対象労働者氏名</Label>
                <Input
                  id="workerName"
                  value={fields.workerName}
                  onChange={(e) => handleFieldChange('workerName', e.target.value)}
                  placeholder="田中花子"
                />
              </div>
              <div>
                <Label htmlFor="conversionDate">転換日</Label>
                <Input
                  id="conversionDate"
                  type="date"
                  value={fields.conversionDate}
                  onChange={(e) => handleFieldChange('conversionDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preSalary">転換前賃金（月額）</Label>
                <Input
                  id="preSalary"
                  type="number"
                  value={fields.preSalary ?? ''}
                  onChange={(e) => handleFieldChange('preSalary', e.target.value ? Number(e.target.value) : null)}
                  placeholder="210000"
                />
              </div>
              <div>
                <Label htmlFor="postSalary">転換後賃金（月額）</Label>
                <Input
                  id="postSalary"
                  type="number"
                  value={fields.postSalary ?? ''}
                  onChange={(e) => handleFieldChange('postSalary', e.target.value ? Number(e.target.value) : null)}
                  placeholder="227000"
                />
              </div>
              {fields.preSalary && fields.postSalary && (
                <div className="flex items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">賃金上昇率: </span>
                    <span className={`font-bold ${
                      ((fields.postSalary - fields.preSalary) / fields.preSalary) * 100 >= 3
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(((fields.postSalary - fields.preSalary) / fields.preSalary) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* チェック実行ボタン */}
        <Button onClick={runCheck} size="lg" className="w-full mb-6">
          書類をチェック
        </Button>

        {/* 結果表示 */}
        {result && (
          <Card className={`mb-6 ${
            result.status === 'pass' ? 'border-green-500' :
            result.status === 'warning' ? 'border-yellow-500' :
            'border-red-500'
          }`}>
            <CardHeader className={`${
              result.status === 'pass' ? 'bg-green-50' :
              result.status === 'warning' ? 'bg-yellow-50' :
              'bg-red-50'
            }`}>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {result.status === 'pass' ? '✓' :
                   result.status === 'warning' ? '⚠' : '✗'}
                </span>
                {result.status === 'pass' ? '書類チェック完了' :
                 result.status === 'warning' ? '確認が必要な項目があります' :
                 '不足している書類があります'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* 進捗 */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{result.totalRequired}</div>
                    <div className="text-sm text-gray-500">必要書類</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{result.presentCount}</div>
                    <div className="text-sm text-gray-500">揃っている</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{result.completeCount}</div>
                    <div className="text-sm text-gray-500">記入完了</div>
                  </div>
                </div>
              </div>

              {/* 不足書類 */}
              {result.missingDocuments.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>不足している書類（{result.missingDocuments.length}件）</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                      {result.missingDocuments.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* 記入未完了 */}
              {result.incompleteDocuments.length > 0 && (
                <Alert className="mb-4 border-yellow-500 bg-yellow-50">
                  <AlertTitle className="text-yellow-800">記入が未完了の書類（{result.incompleteDocuments.length}件）</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    <ul className="list-disc list-inside mt-2">
                      {result.incompleteDocuments.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* フィールドエラー */}
              {fieldErrors.length > 0 && (
                <Alert className="mb-4 border-orange-500 bg-orange-50">
                  <AlertTitle className="text-orange-800">必須項目の問題（{fieldErrors.length}件）</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    <ul className="list-disc list-inside mt-2">
                      {fieldErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* 成功メッセージ */}
              {result.status === 'pass' && (
                <Alert className="border-green-500 bg-green-50">
                  <AlertTitle className="text-green-800">申請準備完了</AlertTitle>
                  <AlertDescription className="text-green-700">
                    全ての書類が揃い、必須項目も入力されています。申請に進むことができます。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ナビゲーション */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/calculator">
            <Button variant="outline">賃金計算へ</Button>
          </Link>
          <Link href="/eligibility">
            <Button variant="outline">要件チェックへ</Button>
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
