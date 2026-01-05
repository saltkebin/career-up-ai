"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useData, Application, Client } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout, officeName } = useAuth();
  const {
    clients,
    applications,
    addClient,
    updateClient,
    deleteClient,
    addApplication,
    updateApplication,
    deleteApplication,
    getClientById,
  } = useData();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'client' | 'application'; id: string } | null>(null);

  // 新規申請フォームの状態
  const [newAppForm, setNewAppForm] = useState({
    clientId: "",
    workerName: "",
    workerNameKana: "",
    birthDate: "",
    gender: "" as 'male' | 'female' | '',
    hireDate: "",
    conversionDate: "",
    conversionType: "fixed_to_regular" as 'fixed_to_regular' | 'indefinite_to_regular' | 'dispatch_to_regular',
    applicationDeadline: "",
    status: "preparing" as Application['status'],
    isPriorityTarget: false,
    priorityCategory: null as 'A' | 'B' | 'C' | null,
    priorityReason: "",
    preSalary: 0,
    postSalary: 0,
    notes: "",
  });

  // 新規顧問先フォームの状態
  const [newClientForm, setNewClientForm] = useState({
    companyName: "",
    registrationNumber: "",
    isSmallBusiness: true,
    careerUpManager: "",
    hasEmploymentRules: false,
    careerUpPlanSubmittedAt: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "準備中":
        return "bg-gray-100 text-gray-700";
      case "書類作成中":
        return "bg-blue-100 text-blue-700";
      case "申請済み":
        return "bg-green-100 text-green-700";
      case "承認済み":
        return "bg-emerald-100 text-emerald-700";
      case "不承認":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return "text-red-600 bg-red-50";
    if (days <= 7) return "text-red-600 bg-red-50";
    if (days <= 30) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const getClientApplications = (clientId: string) => {
    return applications.filter(app => app.clientId === clientId);
  };

  const getClientStats = (clientId: string) => {
    const clientApps = getClientApplications(clientId);
    const urgent = clientApps.filter(app => app.daysRemaining >= 0 && app.daysRemaining <= 14).length;
    const expired = clientApps.filter(app => app.daysRemaining < 0).length;
    const total = clientApps.reduce((sum, app) => sum + (app.estimatedAmount?.total || 800000), 0);
    return { count: clientApps.length, urgent, expired, total };
  };

  // 詳細モーダルを開く
  const openDetailModal = (app: Application) => {
    setSelectedApplication(app);
    setIsDetailModalOpen(true);
  };

  // ステータス変更
  const handleStatusChange = (newStatus: Application['status']) => {
    if (selectedApplication) {
      updateApplication(selectedApplication.id, { status: newStatus });
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
  };

  // 申請削除確認
  const confirmDeleteApplication = (appId: string) => {
    setDeleteTarget({ type: 'application', id: appId });
    setIsDeleteConfirmOpen(true);
  };

  // 顧問先削除確認
  const confirmDeleteClient = (clientId: string) => {
    setDeleteTarget({ type: 'client', id: clientId });
    setIsDeleteConfirmOpen(true);
  };

  // 削除実行
  const executeDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'application') {
        deleteApplication(deleteTarget.id);
        setIsDetailModalOpen(false);
      } else {
        deleteClient(deleteTarget.id);
        if (selectedClient?.id === deleteTarget.id) {
          setSelectedClient(null);
        }
      }
    }
    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  // 新規申請登録
  const handleNewApplication = () => {
    if (!newAppForm.clientId || !newAppForm.workerName || !newAppForm.conversionDate || !newAppForm.applicationDeadline) {
      alert("必須項目を入力してください");
      return;
    }

    const salaryIncreaseRate = newAppForm.preSalary > 0
      ? ((newAppForm.postSalary - newAppForm.preSalary) / newAppForm.preSalary) * 100
      : 0;

    // 助成金額を計算
    const client = getClientById(newAppForm.clientId);
    const isSmall = client?.isSmallBusiness ?? true;
    const phase1 = isSmall
      ? (newAppForm.isPriorityTarget ? 1200000 : 800000)
      : (newAppForm.isPriorityTarget ? 900000 : 600000);
    const phase2 = newAppForm.isPriorityTarget ? phase1 : 0;

    addApplication({
      clientId: newAppForm.clientId,
      workerName: newAppForm.workerName,
      workerNameKana: newAppForm.workerNameKana || undefined,
      birthDate: newAppForm.birthDate || undefined,
      gender: newAppForm.gender || undefined,
      hireDate: newAppForm.hireDate || undefined,
      conversionDate: newAppForm.conversionDate,
      conversionType: newAppForm.conversionType,
      applicationDeadline: newAppForm.applicationDeadline,
      status: newAppForm.status,
      isPriorityTarget: newAppForm.isPriorityTarget,
      priorityCategory: newAppForm.isPriorityTarget ? newAppForm.priorityCategory : null,
      priorityReason: newAppForm.isPriorityTarget ? newAppForm.priorityReason : undefined,
      preSalary: newAppForm.preSalary || undefined,
      postSalary: newAppForm.postSalary || undefined,
      salaryIncreaseRate: salaryIncreaseRate || undefined,
      estimatedAmount: { phase1, phase2, total: phase1 + phase2 },
      notes: newAppForm.notes || undefined,
    });

    setIsNewApplicationModalOpen(false);
    resetNewAppForm();
  };

  const resetNewAppForm = () => {
    setNewAppForm({
      clientId: selectedClient?.id || "",
      workerName: "",
      workerNameKana: "",
      birthDate: "",
      gender: "",
      hireDate: "",
      conversionDate: "",
      conversionType: "fixed_to_regular",
      applicationDeadline: "",
      status: "preparing",
      isPriorityTarget: false,
      priorityCategory: null,
      priorityReason: "",
      preSalary: 0,
      postSalary: 0,
      notes: "",
    });
  };

  // 新規顧問先登録
  const handleNewClient = () => {
    if (!newClientForm.companyName) {
      alert("企業名を入力してください");
      return;
    }

    addClient({
      companyName: newClientForm.companyName,
      registrationNumber: newClientForm.registrationNumber || undefined,
      isSmallBusiness: newClientForm.isSmallBusiness,
      careerUpManager: newClientForm.careerUpManager || undefined,
      hasEmploymentRules: newClientForm.hasEmploymentRules,
      careerUpPlanSubmittedAt: newClientForm.careerUpPlanSubmittedAt || undefined,
    });

    setIsNewClientModalOpen(false);
    resetNewClientForm();
  };

  const resetNewClientForm = () => {
    setNewClientForm({
      companyName: "",
      registrationNumber: "",
      isSmallBusiness: true,
      careerUpManager: "",
      hasEmploymentRules: false,
      careerUpPlanSubmittedAt: "",
    });
  };

  // 顧問先編集
  const handleEditClient = () => {
    if (selectedClient && newClientForm.companyName) {
      updateClient(selectedClient.id, {
        companyName: newClientForm.companyName,
        registrationNumber: newClientForm.registrationNumber || undefined,
        isSmallBusiness: newClientForm.isSmallBusiness,
        careerUpManager: newClientForm.careerUpManager || undefined,
        hasEmploymentRules: newClientForm.hasEmploymentRules,
        careerUpPlanSubmittedAt: newClientForm.careerUpPlanSubmittedAt || undefined,
      });
      setSelectedClient({
        ...selectedClient,
        ...newClientForm,
      });
      setIsEditClientModalOpen(false);
    }
  };

  const openEditClientModal = () => {
    if (selectedClient) {
      setNewClientForm({
        companyName: selectedClient.companyName,
        registrationNumber: selectedClient.registrationNumber || "",
        isSmallBusiness: selectedClient.isSmallBusiness,
        careerUpManager: selectedClient.careerUpManager || "",
        hasEmploymentRules: selectedClient.hasEmploymentRules,
        careerUpPlanSubmittedAt: selectedClient.careerUpPlanSubmittedAt || "",
      });
      setIsEditClientModalOpen(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // 全体の統計
  const allUrgent = applications.filter((app) => app.daysRemaining >= 0 && app.daysRemaining <= 14);
  const allPriority = applications.filter((app) => app.isPriorityTarget);
  const totalAmount = applications.reduce((sum, app) => sum + (app.estimatedAmount?.total || 800000), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{officeName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-600 mb-8">申請状況の確認と各種ツールにアクセスできます</p>

        {/* 期限アラート */}
        {allUrgent.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>申請期限が近い案件があります</AlertTitle>
            <AlertDescription>
              {allUrgent.slice(0, 3).map((app) => {
                const client = getClientById(app.clientId);
                return (
                  <div key={app.id} className="mt-1">
                    <strong>{client?.companyName}</strong> - {app.workerName}さん: あと{app.daysRemaining}日
                    （期限: {app.applicationDeadline}）
                  </div>
                );
              })}
              {allUrgent.length > 3 && (
                <div className="mt-1 text-sm">他 {allUrgent.length - 3} 件</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* クイックアクション */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/calculator">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  賃金計算
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3%賃金上昇率を計算</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/eligibility">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  要件チェック
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">支給要件を確認</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents/check">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  書類チェック
                  <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">NEW</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">必要書類を確認</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/guide">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  ガイド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">よくある誤解と対策</p>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer h-full"
            onClick={() => {
              resetNewAppForm();
              if (selectedClient) {
                setNewAppForm(prev => ({ ...prev, clientId: selectedClient.id }));
              }
              setIsNewApplicationModalOpen(true);
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">➕</span>
                新規申請
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">新しい申請を登録</p>
            </CardContent>
          </Card>
        </div>

        {/* 統計サマリー */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
                <div className="text-sm text-gray-600">顧問先企業</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
                <div className="text-sm text-gray-600">全申請件数</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{allUrgent.length}</div>
                <div className="text-sm text-gray-600">期限間近</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{allPriority.length}</div>
                <div className="text-sm text-gray-600">重点支援対象</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">¥{totalAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">想定助成金総額</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ: 会社選択 → 労働者一覧 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 顧問先企業一覧 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <span>🏢</span> 顧問先企業
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetNewClientForm();
                      setIsNewClientModalOpen(true);
                    }}
                  >
                    追加
                  </Button>
                </div>
                <CardDescription>企業を選択して申請を表示</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* 全社表示ボタン */}
                  <button
                    onClick={() => setSelectedClient(null)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedClient === null
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">すべての企業</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {applications.length} 件の申請
                    </div>
                  </button>

                  {/* 企業リスト */}
                  {clients.map((client) => {
                    const stats = getClientStats(client.id);
                    return (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedClient?.id === client.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{client.companyName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {client.isSmallBusiness ? '中小企業' : '大企業'}
                              {client.careerUpManager && ` • ${client.careerUpManager}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{stats.count} 件</div>
                            {stats.urgent > 0 && (
                              <div className="text-xs text-red-600">{stats.urgent} 件期限間近</div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 申請一覧（選択した会社の労働者） */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>👤</span>
                      {selectedClient ? `${selectedClient.companyName} の申請` : 'すべての申請'}
                    </CardTitle>
                    <CardDescription>
                      {selectedClient
                        ? `${selectedClient.companyName} の対象労働者と申請状況`
                        : '全企業の対象労働者と申請状況'}
                    </CardDescription>
                  </div>
                  {selectedClient && (
                    <Button
                      onClick={() => {
                        resetNewAppForm();
                        setNewAppForm(prev => ({ ...prev, clientId: selectedClient.id }));
                        setIsNewApplicationModalOpen(true);
                      }}
                    >
                      新規申請
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const displayApps = selectedClient
                    ? getClientApplications(selectedClient.id)
                    : applications;

                  if (displayApps.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <p>{selectedClient ? 'この企業にはまだ申請がありません' : 'まだ申請がありません'}</p>
                        <Button
                          className="mt-4"
                          onClick={() => {
                            resetNewAppForm();
                            if (selectedClient) {
                              setNewAppForm(prev => ({ ...prev, clientId: selectedClient.id }));
                            }
                            setIsNewApplicationModalOpen(true);
                          }}
                        >
                          新規申請を登録
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">労働者名</th>
                            {!selectedClient && (
                              <th className="text-left py-3 px-2 font-medium">企業</th>
                            )}
                            <th className="text-left py-3 px-2 font-medium">残り日数</th>
                            <th className="text-left py-3 px-2 font-medium">ステータス</th>
                            <th className="text-left py-3 px-2 font-medium">重点</th>
                            <th className="text-left py-3 px-2 font-medium">想定額</th>
                            <th className="text-left py-3 px-2 font-medium">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayApps.map((app) => {
                            const client = getClientById(app.clientId);
                            return (
                              <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">
                                  <div className="font-medium">{app.workerName}</div>
                                  {app.notes && (
                                    <div className="text-xs text-gray-500">{app.notes}</div>
                                  )}
                                </td>
                                {!selectedClient && (
                                  <td className="py-3 px-2 text-sm text-gray-600">
                                    {client?.companyName || '-'}
                                  </td>
                                )}
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-1 rounded text-sm font-medium ${getDeadlineColor(app.daysRemaining)}`}>
                                    {app.daysRemaining < 0
                                      ? `${Math.abs(app.daysRemaining)}日超過`
                                      : `${app.daysRemaining}日`}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.statusLabel)}`}>
                                    {app.statusLabel}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  {app.isPriorityTarget ? (
                                    <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-700">
                                      {app.priorityCategory}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-sm">
                                  ¥{(app.estimatedAmount?.total || 800000).toLocaleString()}
                                </td>
                                <td className="py-3 px-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDetailModal(app)}
                                  >
                                    詳細
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* 選択した会社の詳細情報 */}
            {selectedClient && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">企業情報</CardTitle>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={openEditClientModal}>
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => confirmDeleteClient(selectedClient.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">企業名</div>
                      <div className="font-medium">{selectedClient.companyName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">雇用保険適用事業所番号</div>
                      <div className="font-medium">{selectedClient.registrationNumber || '未登録'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">企業規模</div>
                      <div className="font-medium">{selectedClient.isSmallBusiness ? '中小企業' : '大企業'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">キャリアアップ管理者</div>
                      <div className="font-medium">{selectedClient.careerUpManager || '未設定'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">就業規則</div>
                      <div className="font-medium">
                        {selectedClient.hasEmploymentRules ? (
                          <span className="text-green-600">整備済み</span>
                        ) : (
                          <span className="text-red-600">未整備</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">キャリアアップ計画届出日</div>
                      <div className="font-medium">{selectedClient.careerUpPlanSubmittedAt || '未届出'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">想定助成金総額</div>
                      <div className="font-medium">
                        ¥{getClientStats(selectedClient.id).total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* 労働者詳細モーダル */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申請詳細</DialogTitle>
            <DialogDescription>
              {selectedApplication && getClientById(selectedApplication.clientId)?.companyName} - {selectedApplication?.workerName}さん
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">基本情報</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">労働者名</div>
                    <div className="font-medium">{selectedApplication.workerName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">フリガナ</div>
                    <div className="font-medium">{selectedApplication.workerNameKana || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">生年月日</div>
                    <div className="font-medium">{selectedApplication.birthDate || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">性別</div>
                    <div className="font-medium">
                      {selectedApplication.gender === 'male' ? '男性' : selectedApplication.gender === 'female' ? '女性' : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">雇入れ日</div>
                    <div className="font-medium">{selectedApplication.hireDate || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">正社員転換日</div>
                    <div className="font-medium">{selectedApplication.conversionDate}</div>
                  </div>
                </div>
              </div>

              {/* 申請情報 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">申請情報</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">転換区分</div>
                    <div className="font-medium">
                      {selectedApplication.conversionType === 'fixed_to_regular' && '有期→正規'}
                      {selectedApplication.conversionType === 'indefinite_to_regular' && '無期→正規'}
                      {selectedApplication.conversionType === 'dispatch_to_regular' && '派遣→正規'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">申請期限</div>
                    <div className="font-medium">{selectedApplication.applicationDeadline}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">残り日数</div>
                    <div className={`font-medium ${selectedApplication.daysRemaining <= 14 ? 'text-red-600' : ''}`}>
                      {selectedApplication.daysRemaining < 0
                        ? `${Math.abs(selectedApplication.daysRemaining)}日超過`
                        : `${selectedApplication.daysRemaining}日`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">ステータス</div>
                    <div>
                      <Select
                        value={selectedApplication.status}
                        onValueChange={(value: Application['status']) => handleStatusChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preparing">準備中</SelectItem>
                          <SelectItem value="documents_ready">書類作成中</SelectItem>
                          <SelectItem value="submitted">申請済み</SelectItem>
                          <SelectItem value="approved">承認済み</SelectItem>
                          <SelectItem value="rejected">不承認</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 賃金情報 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">賃金情報</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">転換前賃金</div>
                    <div className="font-medium">
                      {selectedApplication.preSalary
                        ? `¥${selectedApplication.preSalary.toLocaleString()}`
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">転換後賃金</div>
                    <div className="font-medium">
                      {selectedApplication.postSalary
                        ? `¥${selectedApplication.postSalary.toLocaleString()}`
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">上昇率</div>
                    <div className={`font-medium ${(selectedApplication.salaryIncreaseRate || 0) >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedApplication.salaryIncreaseRate
                        ? `${selectedApplication.salaryIncreaseRate.toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 重点支援対象者 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">重点支援対象者</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">対象区分</div>
                    <div className="font-medium">
                      {selectedApplication.isPriorityTarget ? (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">
                          カテゴリ {selectedApplication.priorityCategory}
                        </span>
                      ) : (
                        <span className="text-gray-400">対象外</span>
                      )}
                    </div>
                  </div>
                  {selectedApplication.isPriorityTarget && selectedApplication.priorityReason && (
                    <div>
                      <div className="text-gray-500">理由</div>
                      <div className="font-medium">{selectedApplication.priorityReason}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 助成金額 */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">想定助成金額</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">1期目</div>
                    <div className="font-medium">
                      ¥{(selectedApplication.estimatedAmount?.phase1 || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">2期目</div>
                    <div className="font-medium">
                      ¥{(selectedApplication.estimatedAmount?.phase2 || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">合計</div>
                    <div className="font-bold text-lg text-blue-600">
                      ¥{(selectedApplication.estimatedAmount?.total || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* メモ */}
              {selectedApplication.notes && (
                <div>
                  <h3 className="font-medium mb-3 text-gray-700">メモ</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => selectedApplication && confirmDeleteApplication(selectedApplication.id)}
            >
              削除
            </Button>
            <Button onClick={() => setIsDetailModalOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規申請モーダル */}
      <Dialog open={isNewApplicationModalOpen} onOpenChange={setIsNewApplicationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規申請登録</DialogTitle>
            <DialogDescription>
              新しい労働者の申請情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>顧問先企業 *</Label>
              <Select
                value={newAppForm.clientId}
                onValueChange={(value) => setNewAppForm(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="企業を選択" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>労働者名 *</Label>
                <Input
                  className="mt-1"
                  value={newAppForm.workerName}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, workerName: e.target.value }))}
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <Label>フリガナ</Label>
                <Input
                  className="mt-1"
                  value={newAppForm.workerNameKana}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, workerNameKana: e.target.value }))}
                  placeholder="ヤマダ タロウ"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>生年月日</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newAppForm.birthDate}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>性別</Label>
                <Select
                  value={newAppForm.gender}
                  onValueChange={(value: 'male' | 'female') => setNewAppForm(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>雇入れ日</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newAppForm.hireDate}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, hireDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>正社員転換日 *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newAppForm.conversionDate}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, conversionDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>転換区分</Label>
                <Select
                  value={newAppForm.conversionType}
                  onValueChange={(value: typeof newAppForm.conversionType) => setNewAppForm(prev => ({ ...prev, conversionType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_to_regular">有期→正規</SelectItem>
                    <SelectItem value="indefinite_to_regular">無期→正規</SelectItem>
                    <SelectItem value="dispatch_to_regular">派遣→正規</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>申請期限 *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newAppForm.applicationDeadline}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                />
              </div>
              <div>
                <Label>ステータス</Label>
                <Select
                  value={newAppForm.status}
                  onValueChange={(value: Application['status']) => setNewAppForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparing">準備中</SelectItem>
                    <SelectItem value="documents_ready">書類作成中</SelectItem>
                    <SelectItem value="submitted">申請済み</SelectItem>
                    <SelectItem value="approved">承認済み</SelectItem>
                    <SelectItem value="rejected">不承認</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>転換前賃金（月額）</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={newAppForm.preSalary || ""}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, preSalary: parseInt(e.target.value) || 0 }))}
                  placeholder="250000"
                />
              </div>
              <div>
                <Label>転換後賃金（月額）</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={newAppForm.postSalary || ""}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, postSalary: parseInt(e.target.value) || 0 }))}
                  placeholder="260000"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="isPriorityTarget"
                  checked={newAppForm.isPriorityTarget}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, isPriorityTarget: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isPriorityTarget" className="font-medium text-purple-700">
                  重点支援対象者
                </Label>
              </div>
              {newAppForm.isPriorityTarget && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>カテゴリ</Label>
                    <Select
                      value={newAppForm.priorityCategory || ""}
                      onValueChange={(value: 'A' | 'B' | 'C') => setNewAppForm(prev => ({ ...prev, priorityCategory: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A（雇保未加入・母子家庭等）</SelectItem>
                        <SelectItem value="B">B（5年間に5回以上離職）</SelectItem>
                        <SelectItem value="C">C（就職氷河期世代）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>理由</Label>
                    <Input
                      className="mt-1"
                      value={newAppForm.priorityReason}
                      onChange={(e) => setNewAppForm(prev => ({ ...prev, priorityReason: e.target.value }))}
                      placeholder="母子家庭の母"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>メモ</Label>
              <Input
                className="mt-1"
                value={newAppForm.notes}
                onChange={(e) => setNewAppForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="特記事項があれば入力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewApplicationModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleNewApplication}>登録</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規顧問先モーダル */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新規顧問先登録</DialogTitle>
            <DialogDescription>
              新しい顧問先企業の情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>企業名 *</Label>
              <Input
                className="mt-1"
                value={newClientForm.companyName}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="株式会社○○"
              />
            </div>
            <div>
              <Label>雇用保険適用事業所番号</Label>
              <Input
                className="mt-1"
                value={newClientForm.registrationNumber}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder="1301-123456-7"
              />
            </div>
            <div>
              <Label>企業規模</Label>
              <Select
                value={newClientForm.isSmallBusiness ? "small" : "large"}
                onValueChange={(value) => setNewClientForm(prev => ({ ...prev, isSmallBusiness: value === "small" }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">中小企業</SelectItem>
                  <SelectItem value="large">大企業</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>キャリアアップ管理者</Label>
              <Input
                className="mt-1"
                value={newClientForm.careerUpManager}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, careerUpManager: e.target.value }))}
                placeholder="山田 太郎"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasEmploymentRules"
                checked={newClientForm.hasEmploymentRules}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, hasEmploymentRules: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="hasEmploymentRules">就業規則整備済み</Label>
            </div>
            <div>
              <Label>キャリアアップ計画届出日</Label>
              <Input
                type="date"
                className="mt-1"
                value={newClientForm.careerUpPlanSubmittedAt}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, careerUpPlanSubmittedAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleNewClient}>登録</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 顧問先編集モーダル */}
      <Dialog open={isEditClientModalOpen} onOpenChange={setIsEditClientModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>顧問先編集</DialogTitle>
            <DialogDescription>
              企業情報を編集してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>企業名 *</Label>
              <Input
                className="mt-1"
                value={newClientForm.companyName}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="株式会社○○"
              />
            </div>
            <div>
              <Label>雇用保険適用事業所番号</Label>
              <Input
                className="mt-1"
                value={newClientForm.registrationNumber}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder="1301-123456-7"
              />
            </div>
            <div>
              <Label>企業規模</Label>
              <Select
                value={newClientForm.isSmallBusiness ? "small" : "large"}
                onValueChange={(value) => setNewClientForm(prev => ({ ...prev, isSmallBusiness: value === "small" }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">中小企業</SelectItem>
                  <SelectItem value="large">大企業</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>キャリアアップ管理者</Label>
              <Input
                className="mt-1"
                value={newClientForm.careerUpManager}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, careerUpManager: e.target.value }))}
                placeholder="山田 太郎"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasEmploymentRulesEdit"
                checked={newClientForm.hasEmploymentRules}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, hasEmploymentRules: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="hasEmploymentRulesEdit">就業規則整備済み</Label>
            </div>
            <div>
              <Label>キャリアアップ計画届出日</Label>
              <Input
                type="date"
                className="mt-1"
                value={newClientForm.careerUpPlanSubmittedAt}
                onChange={(e) => setNewClientForm(prev => ({ ...prev, careerUpPlanSubmittedAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditClient}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認モーダル */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>削除確認</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'application'
                ? 'この申請を削除してもよろしいですか？'
                : 'この顧問先を削除してもよろしいですか？関連する全ての申請も削除されます。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
