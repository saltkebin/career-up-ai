"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * アプリケーションデータ管理コンテキスト
 * ローカルストレージを使用してデータを永続化
 */

export interface Client {
  id: string;
  companyName: string;
  registrationNumber?: string;
  isSmallBusiness: boolean;
  careerUpManager?: string;
  hasEmploymentRules: boolean;
  careerUpPlanSubmittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  clientId: string;
  workerName: string;
  workerNameKana?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  hireDate?: string;
  conversionDate: string;
  conversionType: 'fixed_to_regular' | 'indefinite_to_regular' | 'dispatch_to_regular';
  applicationDeadline: string;
  status: 'preparing' | 'documents_ready' | 'submitted' | 'approved' | 'rejected';
  statusLabel: string;
  daysRemaining: number;
  isPriorityTarget: boolean;
  priorityCategory: 'A' | 'B' | 'C' | null;
  priorityReason?: string;
  preSalary?: number;
  postSalary?: number;
  salaryIncreaseRate?: number;
  estimatedAmount: {
    phase1: number;
    phase2: number;
    total: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DataContextType {
  clients: Client[];
  applications: Application[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'daysRemaining' | 'statusLabel'>) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByClientId: (clientId: string) => Application[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_CLIENTS = "career-up-ai-clients";
const STORAGE_KEY_APPLICATIONS = "career-up-ai-applications";

// 初期サンプルデータ
const initialClients: Client[] = [
  {
    id: "client-1",
    companyName: "株式会社テックフォワード",
    registrationNumber: "1301-123456-7",
    isSmallBusiness: true,
    careerUpManager: "山田 太郎",
    hasEmploymentRules: true,
    careerUpPlanSubmittedAt: "2024-10-01",
    createdAt: "2024-10-01",
    updatedAt: "2024-10-01",
  },
  {
    id: "client-2",
    companyName: "有限会社さくら製作所",
    registrationNumber: "1302-234567-8",
    isSmallBusiness: true,
    careerUpManager: "佐藤 花子",
    hasEmploymentRules: true,
    careerUpPlanSubmittedAt: "2024-11-01",
    createdAt: "2024-11-01",
    updatedAt: "2024-11-01",
  },
  {
    id: "client-3",
    companyName: "合同会社グリーンテック",
    registrationNumber: "1303-345678-9",
    isSmallBusiness: true,
    careerUpManager: "田中 一郎",
    hasEmploymentRules: false,
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
];

const initialApplications: Application[] = [
  {
    id: "app-1",
    clientId: "client-1",
    workerName: "田中 一郎",
    workerNameKana: "タナカ イチロウ",
    birthDate: "1990-05-15",
    gender: "male",
    hireDate: "2024-04-01",
    conversionDate: "2025-04-01",
    conversionType: "fixed_to_regular",
    applicationDeadline: "2026-01-07",
    status: "preparing",
    statusLabel: "準備中",
    daysRemaining: 2,
    isPriorityTarget: false,
    priorityCategory: null,
    preSalary: 250000,
    postSalary: 260000,
    salaryIncreaseRate: 4.0,
    estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
    notes: "期限間近・緊急対応必要",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
  {
    id: "app-2",
    clientId: "client-1",
    workerName: "鈴木 花子",
    workerNameKana: "スズキ ハナコ",
    birthDate: "1985-08-20",
    gender: "female",
    hireDate: "2024-06-01",
    conversionDate: "2025-06-01",
    conversionType: "fixed_to_regular",
    applicationDeadline: "2026-03-10",
    status: "documents_ready",
    statusLabel: "書類作成中",
    daysRemaining: 64,
    isPriorityTarget: false,
    priorityCategory: null,
    preSalary: 230000,
    postSalary: 240000,
    salaryIncreaseRate: 4.3,
    estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
    notes: "順調に進行中",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
  {
    id: "app-3",
    clientId: "client-2",
    workerName: "山田 美咲",
    workerNameKana: "ヤマダ ミサキ",
    birthDate: "1992-11-25",
    gender: "female",
    hireDate: "2024-01-15",
    conversionDate: "2025-01-01",
    conversionType: "fixed_to_regular",
    applicationDeadline: "2026-02-19",
    status: "documents_ready",
    statusLabel: "書類作成中",
    daysRemaining: 45,
    isPriorityTarget: true,
    priorityCategory: "A",
    priorityReason: "母子家庭の母",
    preSalary: 220000,
    postSalary: 230000,
    salaryIncreaseRate: 4.5,
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
  {
    id: "app-4",
    clientId: "client-2",
    workerName: "高橋 健太",
    workerNameKana: "タカハシ ケンタ",
    birthDate: "1995-02-28",
    gender: "male",
    hireDate: "2024-03-01",
    conversionDate: "2025-03-01",
    conversionType: "fixed_to_regular",
    applicationDeadline: "2026-02-04",
    status: "preparing",
    statusLabel: "準備中",
    daysRemaining: 30,
    isPriorityTarget: true,
    priorityCategory: "B",
    priorityReason: "過去5年間に5回以上離職",
    preSalary: 240000,
    postSalary: 250000,
    salaryIncreaseRate: 4.2,
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
  {
    id: "app-5",
    clientId: "client-3",
    workerName: "加藤 正明",
    workerNameKana: "カトウ マサアキ",
    birthDate: "1978-06-30",
    gender: "male",
    hireDate: "2024-02-01",
    conversionDate: "2025-02-01",
    conversionType: "fixed_to_regular",
    applicationDeadline: "2026-02-12",
    status: "documents_ready",
    statusLabel: "書類作成中",
    daysRemaining: 38,
    isPriorityTarget: true,
    priorityCategory: "C",
    priorityReason: "就職氷河期世代（1970-1982年生まれ）",
    preSalary: 280000,
    postSalary: 290000,
    salaryIncreaseRate: 3.6,
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
  },
];

// ステータスラベルを取得
function getStatusLabel(status: Application['status']): string {
  const labels: Record<Application['status'], string> = {
    preparing: '準備中',
    documents_ready: '書類作成中',
    submitted: '申請済み',
    approved: '承認済み',
    rejected: '不承認',
  };
  return labels[status] || '準備中';
}

// 残り日数を計算
function calculateDaysRemaining(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// UUID生成
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化：ローカルストレージからデータを読み込む
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
      const storedApplications = localStorage.getItem(STORAGE_KEY_APPLICATIONS);

      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(initialClients);
        localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(initialClients));
      }

      if (storedApplications) {
        // 残り日数を再計算
        const apps = JSON.parse(storedApplications) as Application[];
        const updatedApps = apps.map(app => ({
          ...app,
          daysRemaining: calculateDaysRemaining(app.applicationDeadline),
          statusLabel: getStatusLabel(app.status),
        }));
        setApplications(updatedApps);
      } else {
        // 初期データの残り日数を計算
        const appsWithDays = initialApplications.map(app => ({
          ...app,
          daysRemaining: calculateDaysRemaining(app.applicationDeadline),
          statusLabel: getStatusLabel(app.status),
        }));
        setApplications(appsWithDays);
        localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(appsWithDays));
      }
    } catch (error) {
      console.error("データ読み込みエラー:", error);
      setClients(initialClients);
      setApplications(initialApplications);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // データ変更時にローカルストレージに保存
  useEffect(() => {
    if (isInitialized && clients.length > 0) {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    }
  }, [clients, isInitialized]);

  useEffect(() => {
    if (isInitialized && applications.length > 0) {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
    }
  }, [applications, isInitialized]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client =>
      client.id === id
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    // 関連する申請も削除
    setApplications(prev => prev.filter(app => app.clientId !== id));
  };

  const addApplication = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'daysRemaining' | 'statusLabel'>): Application => {
    const now = new Date().toISOString();
    const newApplication: Application = {
      ...appData,
      id: generateId(),
      daysRemaining: calculateDaysRemaining(appData.applicationDeadline),
      statusLabel: getStatusLabel(appData.status),
      createdAt: now,
      updatedAt: now,
    };
    setApplications(prev => [...prev, newApplication]);
    return newApplication;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        const updated = { ...app, ...updates, updatedAt: new Date().toISOString() };
        // 期限が更新された場合は残り日数を再計算
        if (updates.applicationDeadline) {
          updated.daysRemaining = calculateDaysRemaining(updates.applicationDeadline);
        }
        // ステータスが更新された場合はラベルを再設定
        if (updates.status) {
          updated.statusLabel = getStatusLabel(updates.status);
        }
        return updated;
      }
      return app;
    }));
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);
  const getApplicationById = (id: string) => applications.find(a => a.id === id);
  const getApplicationsByClientId = (clientId: string) => applications.filter(a => a.clientId === clientId);

  if (!isInitialized) {
    return null;
  }

  return (
    <DataContext.Provider value={{
      clients,
      applications,
      addClient,
      updateClient,
      deleteClient,
      addApplication,
      updateApplication,
      deleteApplication,
      getClientById,
      getApplicationById,
      getApplicationsByClientId,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
