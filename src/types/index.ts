import { Timestamp } from 'firebase/firestore';

// ============================================
// User & Office
// ============================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'sharoushi' | 'admin';
  officeId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Office {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'basic' | 'pro';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Client (企業)
// ============================================

export interface Client {
  id: string;
  officeId: string;
  companyName: string;
  registrationNumber?: string; // 雇用保険適用事業所番号
  isSmallBusiness: boolean; // 中小企業フラグ
  careerUpManager?: string; // キャリアアップ管理者名
  hasEmploymentRules: boolean; // 就業規則有無
  employmentRulesSubmittedAt?: Timestamp; // 就業規則届出日
  careerUpPlanSubmittedAt?: Timestamp; // キャリアアップ計画書届出日
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Worker (対象労働者)
// ============================================

export interface Worker {
  id: string;
  clientId: string;
  
  // 基本情報
  name: string;
  nameKana: string;
  birthDate: Timestamp;
  gender: 'male' | 'female';
  
  // 雇用情報
  hireDate: Timestamp;
  employmentType: 'fixed' | 'indefinite' | 'dispatch';
  contractStartDate: Timestamp;
  contractEndDate?: Timestamp;
  
  // 対象外条件チェック
  eligibilityCheck: EligibilityCheck;
  
  // 職歴（重点支援対象者B判定用）
  employmentHistory: EmploymentHistoryItem[];
  
  // 重点支援対象者判定
  priorityTarget: PriorityTargetResult;
  
  // 賃金情報
  preSalary?: SalaryPeriod;
  postSalary?: SalaryPeriod;
  salaryCalculation?: SalaryCalculationResult;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface EligibilityCheck {
  wasHiredAsRegular: boolean; // 正規雇用を条件に雇用された
  wasRegularIn3Years: boolean; // 過去3年以内に正社員だった
  isRelativeWithin3Degrees: boolean; // 3親等以内の親族
  isNewGraduateUnder1Year: boolean; // 新卒1年未満
  isNearRetirement: boolean; // 定年まで1年未満
  isTechnicalIntern: boolean; // 技能実習生
  wasPromisedRegular: boolean; // 正社員化を約束されていた
}

export interface EmploymentHistoryItem {
  companyName: string;
  position: string;
  startDate: Timestamp;
  endDate: Timestamp;
  wasRegularEmployee: boolean;
}

export interface PriorityTargetResult {
  isEligible: boolean;
  category: 'A' | 'B' | 'C' | null;
  categoryReason: string;
  checkedAt: Timestamp;
}

// ============================================
// Salary (賃金)
// ============================================

export interface SalaryPeriod {
  months: MonthlySalary[];
}

export interface MonthlySalary {
  yearMonth: string; // "2025-01"
  baseSalary: number;
  allowances: SalaryAllowance[];
  fixedOvertime?: {
    hours: number;
    amount: number;
  };
  totalIncludable: number;
}

export interface SalaryAllowance {
  name: string;
  amount: number;
  isIncludable: boolean;
}

export interface SalaryCalculationResult {
  preTotalSalary: number;
  postTotalSalary: number;
  increaseAmount: number;
  increaseRate: number;
  isEligible: boolean;
  requiredMinimum: number;
  shortfall: number;
  warnings: string[];
  calculatedAt: Timestamp;
}

// ============================================
// Application (申請)
// ============================================

export interface Application {
  id: string;
  clientId: string;
  workerId: string;
  
  // 転換情報
  conversionDate: Timestamp;
  conversionType: 'fixed_to_regular' | 'indefinite_to_regular';
  
  // 重点支援対象者情報
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;
  
  // 申請期限（自動計算）
  phase1: ApplicationPhase;
  phase2?: ApplicationPhase; // 重点支援対象者のみ
  
  // 支給見込額
  estimatedAmount: {
    phase1: number;
    phase2: number;
    total: number;
  };
  
  // 書類チェック状態
  documentCheck?: DocumentCheckResult;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface ApplicationPhase {
  salaryPaymentDate: Timestamp;
  deadline: Timestamp;
  status: ApplicationStatus;
  submittedAt?: Timestamp;
  approvedAt?: Timestamp;
  amount?: number;
}

export type ApplicationStatus =
  | 'preparing'
  | 'documents_ready'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface DocumentCheckResult {
  level: 1 | 2 | 3 | 4;
  lastCheckedAt: Timestamp;
  issues: DocumentIssue[];
}

export interface DocumentIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}

// ============================================
// Notification (通知)
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    applicationId?: string;
    workerId?: string;
    clientId?: string;
    daysUntilDeadline?: number;
  };
  channels: ('in_app' | 'email' | 'push')[];
  status: 'pending' | 'sent' | 'read' | 'failed';
  scheduledAt: Timestamp;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

export type NotificationType =
  | 'deadline_reminder_14d'
  | 'deadline_reminder_7d'
  | 'deadline_reminder_3d'
  | 'deadline_reminder_1d'
  | 'deadline_today'
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'phase2_scheduled';
