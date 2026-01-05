"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

/**
 * アプリケーションデータ管理コンテキスト
 * Firestoreを使用してデータを永続化
 */

// 転換前準備チェックリストの項目
export interface PreparationChecklist {
  careerUpPlanSubmitted?: boolean;
  employmentRulesReady?: boolean;
  regularEmployeeDefinitionReady?: boolean;
  wageTableReady?: boolean;
  trialPeriodChecked?: boolean;
  socialInsuranceReady?: boolean;
  laborConditionsNotified?: boolean;
  sixMonthEmploymentConfirmed?: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  registrationNumber?: string;
  isSmallBusiness: boolean;
  careerUpManager?: string;
  hasEmploymentRules: boolean;
  careerUpPlanSubmittedAt?: string;
  preparationChecklist?: PreparationChecklist;
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
  status: 'preparing' | 'documents_ready' | 'submitted' | 'under_review' | 'approved' | 'paid' | 'rejected';
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
  submittedAt?: string;
  reviewStartedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  phase: 1 | 2;
  phase1ApplicationId?: string;
  phase2DeadlineNotified?: boolean;
  documentCheckResult?: {
    checkedAt: string;
    completedCount: number;
    totalCount: number;
    missingDocuments: string[];
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DataContextType {
  clients: Client[];
  applications: Application[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'daysRemaining' | 'statusLabel'>) => Promise<Application>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByClientId: (clientId: string) => Application[];
  exportData: () => string;
  importData: (jsonData: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ステータスラベルを取得
function getStatusLabel(status: Application['status']): string {
  const labels: Record<Application['status'], string> = {
    preparing: '準備中',
    documents_ready: '書類作成中',
    submitted: '申請済み',
    under_review: '審査中',
    approved: '承認済み',
    paid: '支給済み',
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

// Firestore Timestampを文字列に変換
function timestampToString(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { officeId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestoreからデータを読み込む
  useEffect(() => {
    if (!officeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let clientsLoaded = false;
    let applicationsLoaded = false;

    const checkLoaded = () => {
      if (clientsLoaded && applicationsLoaded) {
        setLoading(false);
      }
    };

    // クライアントのリアルタイムリスナー
    const clientsRef = collection(db, `offices/${officeId}/clients`);
    const unsubClients = onSnapshot(
      query(clientsRef),
      (snapshot) => {
        const clientsData: Client[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          clientsData.push({
            ...data,
            id: doc.id,
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
          } as Client);
        });
        setClients(clientsData);
        clientsLoaded = true;
        checkLoaded();
      },
      (error) => {
        console.error("クライアント読み込みエラー:", error);
        clientsLoaded = true;
        checkLoaded();
      }
    );

    // 申請のリアルタイムリスナー
    const applicationsRef = collection(db, `offices/${officeId}/applications`);
    const unsubApplications = onSnapshot(
      query(applicationsRef),
      (snapshot) => {
        const appsData: Application[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          appsData.push({
            ...data,
            id: doc.id,
            daysRemaining: calculateDaysRemaining(data.applicationDeadline),
            statusLabel: getStatusLabel(data.status),
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
          } as Application);
        });
        setApplications(appsData);
        applicationsLoaded = true;
        checkLoaded();
      },
      (error) => {
        console.error("申請読み込みエラー:", error);
        applicationsLoaded = true;
        checkLoaded();
      }
    );

    return () => {
      unsubClients();
      unsubApplications();
    };
  }, [officeId]);

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    if (!officeId) throw new Error("認証が必要です");

    const clientsRef = collection(db, `offices/${officeId}/clients`);
    const docRef = await addDoc(clientsRef, {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newClient: Client = {
      ...clientData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newClient;
  }, [officeId]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>): Promise<void> => {
    if (!officeId) throw new Error("認証が必要です");

    const clientRef = doc(db, `offices/${officeId}/clients`, id);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, [officeId]);

  const deleteClient = useCallback(async (id: string): Promise<void> => {
    if (!officeId) throw new Error("認証が必要です");

    // 関連する申請も削除
    const relatedApps = applications.filter(app => app.clientId === id);
    for (const app of relatedApps) {
      const appRef = doc(db, `offices/${officeId}/applications`, app.id);
      await deleteDoc(appRef);
    }

    const clientRef = doc(db, `offices/${officeId}/clients`, id);
    await deleteDoc(clientRef);
  }, [officeId, applications]);

  const addApplication = useCallback(async (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'daysRemaining' | 'statusLabel'>): Promise<Application> => {
    if (!officeId) throw new Error("認証が必要です");

    const applicationsRef = collection(db, `offices/${officeId}/applications`);
    const docRef = await addDoc(applicationsRef, {
      ...appData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newApplication: Application = {
      ...appData,
      id: docRef.id,
      daysRemaining: calculateDaysRemaining(appData.applicationDeadline),
      statusLabel: getStatusLabel(appData.status),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newApplication;
  }, [officeId]);

  const updateApplication = useCallback(async (id: string, updates: Partial<Application>): Promise<void> => {
    if (!officeId) throw new Error("認証が必要です");

    const appRef = doc(db, `offices/${officeId}/applications`, id);
    await updateDoc(appRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, [officeId]);

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    if (!officeId) throw new Error("認証が必要です");

    const appRef = doc(db, `offices/${officeId}/applications`, id);
    await deleteDoc(appRef);
  }, [officeId]);

  const getClientById = useCallback((id: string) => clients.find(c => c.id === id), [clients]);
  const getApplicationById = useCallback((id: string) => applications.find(a => a.id === id), [applications]);
  const getApplicationsByClientId = useCallback((clientId: string) => applications.filter(a => a.clientId === clientId), [applications]);

  // データエクスポート
  const exportData = useCallback((): string => {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      clients,
      applications,
    };
    return JSON.stringify(data, null, 2);
  }, [clients, applications]);

  // データインポート
  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    if (!officeId) return false;

    try {
      const data = JSON.parse(jsonData);

      if (!data.clients || !data.applications) {
        console.error("Invalid data format");
        return false;
      }

      // 既存データを削除
      const clientsRef = collection(db, `offices/${officeId}/clients`);
      const applicationsRef = collection(db, `offices/${officeId}/applications`);

      const existingClients = await getDocs(clientsRef);
      for (const doc of existingClients.docs) {
        await deleteDoc(doc.ref);
      }

      const existingApps = await getDocs(applicationsRef);
      for (const doc of existingApps.docs) {
        await deleteDoc(doc.ref);
      }

      // 新しいデータをインポート
      for (const client of data.clients as Client[]) {
        const { id, ...clientData } = client;
        await addDoc(clientsRef, {
          ...clientData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const app of data.applications as Application[]) {
        const { id, daysRemaining, statusLabel, ...appData } = app;
        await addDoc(applicationsRef, {
          ...appData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return true;
    } catch (error) {
      console.error("Import error:", error);
      return false;
    }
  }, [officeId]);

  return (
    <DataContext.Provider value={{
      clients,
      applications,
      loading,
      addClient,
      updateClient,
      deleteClient,
      addApplication,
      updateApplication,
      deleteApplication,
      getClientById,
      getApplicationById,
      getApplicationsByClientId,
      exportData,
      importData,
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
