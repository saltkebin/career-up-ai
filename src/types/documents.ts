/**
 * 書類チェック機能の型定義
 * Phase 2: L1（必須項目チェック）、L2（添付書類チェック）
 */

/**
 * 書類コード - 申請に必要な各書類を識別
 */
export type DocumentCode =
  | 'career_up_plan'           // キャリアアップ計画書
  | 'form_3'                   // 様式第3号（支給申請書）
  | 'form_3_1_1'               // 様式第3号・別添様式1-1
  | 'form_3_1_2'               // 様式第3号・別添様式1-2
  | 'requirement_confirmation' // 支給要件確認申立書
  | 'employment_rules_pre'     // 就業規則（転換前）
  | 'employment_rules_post'    // 就業規則（転換後）
  | 'contract_pre'             // 雇用契約書（転換前）
  | 'contract_post'            // 雇用契約書（転換後）
  | 'salary_ledger'            // 賃金台帳（12ヶ月分）
  | 'attendance_record'        // 出勤簿/タイムカード（12ヶ月分）
  | 'salary_calc'              // 賃金3%増額計算書
  | 'company_registration'     // 登記事項証明書
  | 'priority_target_form';    // 重点支援対象者確認票

/**
 * 書類カテゴリ
 */
export type DocumentCategory =
  | 'application'      // 申請書類
  | 'employment'       // 雇用関連書類
  | 'salary'           // 賃金関連書類
  | 'company'          // 会社関連書類
  | 'priority_target'; // 重点支援対象者用

/**
 * 書類定義 - 各書類のメタデータ
 */
export interface DocumentDefinition {
  code: DocumentCode;
  name: string;
  nameShort: string;
  category: DocumentCategory;
  description: string;
  isRequired: boolean;
  isRequiredForPriorityTarget: boolean;
  periodMonths?: number; // 必要な期間（月数）
  needsPrePost?: boolean; // 転換前後の両方が必要か
  helpText?: string;
}

/**
 * 書類チェック項目の状態
 */
export interface DocumentCheckItem {
  code: DocumentCode;
  name: string;
  isPresent: boolean;
  isComplete: boolean;
  issues: string[];
}

/**
 * 必須項目（L1チェック用）
 */
export interface MandatoryField {
  fieldId: string;
  fieldName: string;
  section?: string;
  isRequired: boolean;
  value: string | number | null;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 書類チェック結果
 */
export interface DocumentCheckResult {
  status: 'pass' | 'fail' | 'warning';
  checkLevel: 1 | 2; // L1 or L2
  totalRequired: number;
  presentCount: number;
  completeCount: number;
  missingDocuments: string[];
  incompleteDocuments: string[];
  fieldErrors: string[];
  checkedAt: Date;
}

/**
 * デモシナリオ
 */
export interface DocumentDemoScenario {
  id: string;
  name: string;
  description: string;
  isPriorityTarget: boolean;
  documents: Record<DocumentCode, { isPresent: boolean; isComplete: boolean }>;
  fieldValues?: Record<string, string | number | null>;
}
