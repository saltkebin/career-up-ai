"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useData, Application, Client } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidePanel } from "@/components/ui/slide-panel";
import { DeadlineProgress, StatusBadge } from "@/components/ui/progress-bar";
import { DashboardSkeleton } from "@/components/ui/skeleton";
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    clients,
    applications,
    loading: dataLoading,
    addClient,
    deleteClient,
    addApplication,
    updateApplication,
    deleteApplication,
    getClientById,
  } = useData();
  const { showToast } = useToast();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'client' | 'application'; id: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 詳細パネルを開く
  const openDetailPanel = (app: Application) => {
    setSelectedApplication(app);
    setIsDetailPanelOpen(true);
  };

  // ステータス変更
  const handleStatusChange = async (newStatus: Application['status']) => {
    if (selectedApplication) {
      try {
        await updateApplication(selectedApplication.id, { status: newStatus });
        setSelectedApplication({ ...selectedApplication, status: newStatus });
        showToast("ステータスを更新しました", "success");
      } catch (error) {
        console.error("ステータス更新エラー:", error);
        showToast("ステータスの更新に失敗しました", "error");
      }
    }
  };

  // 削除確認
  const confirmDelete = (type: 'client' | 'application', id: string) => {
    setDeleteTarget({ type, id });
    setIsDeleteConfirmOpen(true);
  };

  // 削除実行
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      if (deleteTarget.type === 'application') {
        await deleteApplication(deleteTarget.id);
        setIsDetailPanelOpen(false);
        showToast("申請を削除しました", "success");
      } else {
        await deleteClient(deleteTarget.id);
        if (selectedClient?.id === deleteTarget.id) {
          setSelectedClient(null);
        }
        showToast("顧問先を削除しました", "success");
      }
    } catch (error) {
      console.error("削除エラー:", error);
      showToast("削除に失敗しました", "error");
    } finally {
      setIsSubmitting(false);
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // 新規申請登録
  const handleNewApplication = async () => {
    if (!newAppForm.clientId || !newAppForm.workerName || !newAppForm.conversionDate || !newAppForm.applicationDeadline) {
      showToast("必須項目を入力してください", "warning");
      return;
    }

    setIsSubmitting(true);
    const salaryIncreaseRate = newAppForm.preSalary > 0
      ? ((newAppForm.postSalary - newAppForm.preSalary) / newAppForm.preSalary) * 100
      : 0;

    const client = getClientById(newAppForm.clientId);
    const isSmall = client?.isSmallBusiness ?? true;
    const phase1 = isSmall
      ? (newAppForm.isPriorityTarget ? 1200000 : 800000)
      : (newAppForm.isPriorityTarget ? 900000 : 600000);
    const phase2 = newAppForm.isPriorityTarget ? phase1 : 0;

    try {
      await addApplication({
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
        phase: 1,
      });
      showToast("申請を登録しました", "success");
      setIsNewApplicationModalOpen(false);
      resetNewAppForm();
    } catch (error) {
      console.error("申請登録エラー:", error);
      showToast("申請の登録に失敗しました", "error");
    } finally {
      setIsSubmitting(false);
    }
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
  const handleNewClient = async () => {
    if (!newClientForm.companyName) {
      showToast("企業名を入力してください", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await addClient({
        companyName: newClientForm.companyName,
        registrationNumber: newClientForm.registrationNumber || undefined,
        isSmallBusiness: newClientForm.isSmallBusiness,
        careerUpManager: newClientForm.careerUpManager || undefined,
        hasEmploymentRules: newClientForm.hasEmploymentRules,
        careerUpPlanSubmittedAt: newClientForm.careerUpPlanSubmittedAt || undefined,
      });
      showToast("顧問先を登録しました", "success");
      setIsNewClientModalOpen(false);
      resetNewClientForm();
    } catch (error) {
      console.error("顧問先登録エラー:", error);
      showToast("顧問先の登録に失敗しました", "error");
    } finally {
      setIsSubmitting(false);
    }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // データ
  const displayApps = selectedClient
    ? applications.filter(app => app.clientId === selectedClient.id)
    : applications;

  const urgentApps = applications.filter(app => app.daysRemaining >= 0 && app.daysRemaining <= 7);
  const expiredApps = applications.filter(app => app.daysRemaining < 0);
  const priorityApps = applications.filter(app => app.isPriorityTarget);
  const totalAmount = applications.reduce((sum, app) => sum + (app.estimatedAmount?.total || 0), 0);

  // ステータス別にグループ化
  const groupedByStatus = {
    preparing: displayApps.filter(app => app.status === 'preparing'),
    documents_ready: displayApps.filter(app => app.status === 'documents_ready'),
    submitted: displayApps.filter(app => app.status === 'submitted'),
    under_review: displayApps.filter(app => app.status === 'under_review'),
    approved: displayApps.filter(app => app.status === 'approved'),
    paid: displayApps.filter(app => app.status === 'paid'),
  };

  return (
    <AppLayout
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      showClientSelector={true}
    >
      {dataLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* 緊急アラートエリア */}
          {(expiredApps.length > 0 || urgentApps.length > 0) && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">⚠️</span>
                <div>
                  <h2 className="font-bold">緊急対応が必要です</h2>
                  <p className="text-red-100 text-sm">
                    {expiredApps.length > 0 && `期限超過: ${expiredApps.length}件`}
                    {expiredApps.length > 0 && urgentApps.length > 0 && ' / '}
                    {urgentApps.length > 0 && `7日以内: ${urgentApps.length}件`}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    const target = expiredApps[0] || urgentApps[0];
                    if (target) openDetailPanel(target);
                  }}
                >
                  確認する
                </Button>
              </div>
            </div>
          )}

          {/* 統計カード */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
                    <div className="text-sm text-gray-500">顧問先企業</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                    <div className="text-sm text-gray-500">全申請件数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <span className="text-2xl">🔴</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{urgentApps.length + expiredApps.length}</div>
                    <div className="text-sm text-gray-500">要対応</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{priorityApps.length}</div>
                    <div className="text-sm text-gray-500">重点支援</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">¥{(totalAmount / 10000).toFixed(0)}万</div>
                    <div className="text-sm text-gray-500">想定総額</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                resetNewAppForm();
                if (selectedClient) {
                  setNewAppForm(prev => ({ ...prev, clientId: selectedClient.id }));
                }
                setIsNewApplicationModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">➕</span>
              新規申請を登録
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetNewClientForm();
                setIsNewClientModalOpen(true);
              }}
            >
              <span className="mr-2">🏢</span>
              顧問先を追加
            </Button>
          </div>

          {/* 申請一覧 - カンバン風 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 対応中 */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                  対応中
                  <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {groupedByStatus.preparing.length + groupedByStatus.documents_ready.length}
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {[...groupedByStatus.preparing, ...groupedByStatus.documents_ready].map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    client={getClientById(app.clientId)}
                    onClick={() => openDetailPanel(app)}
                  />
                ))}
                {groupedByStatus.preparing.length + groupedByStatus.documents_ready.length === 0 && (
                  <div className="text-center py-8 text-gray-400">なし</div>
                )}
              </div>
            </div>

            {/* 申請済み */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                  申請済み・審査中
                  <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {groupedByStatus.submitted.length + groupedByStatus.under_review.length}
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {[...groupedByStatus.submitted, ...groupedByStatus.under_review].map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    client={getClientById(app.clientId)}
                    onClick={() => openDetailPanel(app)}
                  />
                ))}
                {groupedByStatus.submitted.length + groupedByStatus.under_review.length === 0 && (
                  <div className="text-center py-8 text-gray-400">なし</div>
                )}
              </div>
            </div>

            {/* 完了 */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                  完了
                  <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {groupedByStatus.approved.length + groupedByStatus.paid.length}
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {[...groupedByStatus.approved, ...groupedByStatus.paid].map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    client={getClientById(app.clientId)}
                    onClick={() => openDetailPanel(app)}
                  />
                ))}
                {groupedByStatus.approved.length + groupedByStatus.paid.length === 0 && (
                  <div className="text-center py-8 text-gray-400">なし</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細スライドパネル */}
      <SlidePanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        title="申請詳細"
        width="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">労働者名</span>
                  <span className="font-medium">{selectedApplication.workerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">企業名</span>
                  <span className="font-medium">{getClientById(selectedApplication.clientId)?.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">転換日</span>
                  <span className="font-medium">{selectedApplication.conversionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">申請期限</span>
                  <span className="font-medium">{selectedApplication.applicationDeadline}</span>
                </div>
              </div>
            </div>

            {/* 期限状況 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">期限状況</h3>
              <DeadlineProgress daysRemaining={selectedApplication.daysRemaining} />
            </div>

            {/* ステータス変更 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">ステータス</h3>
              <Select
                value={selectedApplication.status}
                onValueChange={(value: Application['status']) => handleStatusChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparing">準備中</SelectItem>
                  <SelectItem value="documents_ready">書類作成中</SelectItem>
                  <SelectItem value="submitted">申請済み</SelectItem>
                  <SelectItem value="under_review">審査中</SelectItem>
                  <SelectItem value="approved">承認済み</SelectItem>
                  <SelectItem value="paid">支給済み</SelectItem>
                  <SelectItem value="rejected">不承認</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 賃金情報 */}
            {(selectedApplication.preSalary || selectedApplication.postSalary) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">賃金情報</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">転換前賃金</span>
                    <span className="font-medium">¥{selectedApplication.preSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">転換後賃金</span>
                    <span className="font-medium">¥{selectedApplication.postSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">上昇率</span>
                    {(() => {
                      const rate = selectedApplication.salaryIncreaseRate
                        ?? (selectedApplication.preSalary && selectedApplication.postSalary
                          ? ((selectedApplication.postSalary - selectedApplication.preSalary) / selectedApplication.preSalary) * 100
                          : 0);
                      return (
                        <span className={`font-medium ${rate >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                          {rate.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 助成金額 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">想定助成金額</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ¥{selectedApplication.estimatedAmount?.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-500 mt-1">
                    1期: ¥{selectedApplication.estimatedAmount?.phase1.toLocaleString()} /
                    2期: ¥{selectedApplication.estimatedAmount?.phase2.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 重点支援対象 */}
            {selectedApplication.isPriorityTarget && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">重点支援対象者</h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-full text-sm font-medium">
                      カテゴリ {selectedApplication.priorityCategory}
                    </span>
                    {selectedApplication.priorityReason && (
                      <span className="text-purple-700 text-sm">{selectedApplication.priorityReason}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* アクション */}
            <div className="pt-4 border-t space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => confirmDelete('application', selectedApplication.id)}
              >
                この申請を削除
              </Button>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* 新規申請モーダル */}
      <Dialog open={isNewApplicationModalOpen} onOpenChange={setIsNewApplicationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規申請登録</DialogTitle>
            <DialogDescription>新しい労働者の申請情報を入力してください</DialogDescription>
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
                <Label>申請期限 *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newAppForm.applicationDeadline}
                  onChange={(e) => setNewAppForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                />
              </div>
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
            <Button variant="outline" onClick={() => setIsNewApplicationModalOpen(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button onClick={handleNewApplication} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  登録中...
                </>
              ) : (
                "登録"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規顧問先モーダル */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新規顧問先登録</DialogTitle>
            <DialogDescription>新しい顧問先企業の情報を入力してください</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientModalOpen(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button onClick={handleNewClient} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  登録中...
                </>
              ) : (
                "登録"
              )}
            </Button>
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
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={isSubmitting}>
              {isSubmitting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// 申請カードコンポーネント
function ApplicationCard({
  application,
  client,
  onClick
}: {
  application: Application;
  client?: Client;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-3 bg-white border rounded-lg hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900">{application.workerName}</div>
          <div className="text-xs text-gray-500">{client?.companyName}</div>
        </div>
        {application.isPriorityTarget && (
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
            {application.priorityCategory}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={application.statusLabel} size="sm" />
        <DeadlineProgress daysRemaining={application.daysRemaining} showLabel={true} />
      </div>
    </div>
  );
}
