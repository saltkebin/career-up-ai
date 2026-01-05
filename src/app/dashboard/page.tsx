"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Client {
  id: string;
  companyName: string;
  registrationNumber?: string;
  isSmallBusiness: boolean;
  careerUpManager?: string;
  hasEmploymentRules: boolean;
}

interface Application {
  id: string;
  clientId: string;
  workerName: string;
  conversionDate: string;
  applicationDeadline: string;
  status: string;
  daysRemaining: number;
  isPriorityTarget?: boolean;
  priorityCategory?: 'A' | 'B' | 'C' | null;
  scenario?: string;
  estimatedAmount?: {
    phase1: number;
    phase2: number;
    total: number;
  };
}

// サンプルデータ（テスト用）
const sampleClients: Client[] = [
  {
    id: "client-1",
    companyName: "株式会社テックフォワード",
    registrationNumber: "1301-123456-7",
    isSmallBusiness: true,
    careerUpManager: "山田 太郎",
    hasEmploymentRules: true,
  },
  {
    id: "client-2",
    companyName: "有限会社さくら製作所",
    registrationNumber: "1302-234567-8",
    isSmallBusiness: true,
    careerUpManager: "佐藤 花子",
    hasEmploymentRules: true,
  },
  {
    id: "client-3",
    companyName: "合同会社グリーンテック",
    registrationNumber: "1303-345678-9",
    isSmallBusiness: true,
    careerUpManager: "田中 一郎",
    hasEmploymentRules: false,
  },
];

const sampleApplications: Application[] = [
  {
    id: "app-1",
    clientId: "client-1",
    workerName: "田中 一郎",
    conversionDate: "2025-04-01",
    applicationDeadline: "2026-01-07",
    status: "準備中",
    daysRemaining: 2,
    isPriorityTarget: false,
    priorityCategory: null,
    scenario: "期限間近・緊急対応必要",
    estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
  },
  {
    id: "app-2",
    clientId: "client-1",
    workerName: "鈴木 花子",
    conversionDate: "2025-06-01",
    applicationDeadline: "2026-03-10",
    status: "書類作成中",
    daysRemaining: 64,
    isPriorityTarget: false,
    priorityCategory: null,
    scenario: "順調に進行中",
    estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
  },
  {
    id: "app-3",
    clientId: "client-2",
    workerName: "山田 美咲",
    conversionDate: "2025-01-01",
    applicationDeadline: "2026-02-19",
    status: "書類作成中",
    daysRemaining: 45,
    isPriorityTarget: true,
    priorityCategory: "A",
    scenario: "重点支援対象者A（母子家庭）",
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
  },
  {
    id: "app-4",
    clientId: "client-2",
    workerName: "高橋 健太",
    conversionDate: "2025-03-01",
    applicationDeadline: "2026-02-04",
    status: "準備中",
    daysRemaining: 30,
    isPriorityTarget: true,
    priorityCategory: "B",
    scenario: "重点支援対象者B（5年間に5回離職）",
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
  },
  {
    id: "app-5",
    clientId: "client-3",
    workerName: "加藤 正明",
    conversionDate: "2025-02-01",
    applicationDeadline: "2026-02-12",
    status: "書類作成中",
    daysRemaining: 38,
    isPriorityTarget: true,
    priorityCategory: "C",
    scenario: "重点支援対象者C（就職氷河期世代）",
    estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, logout, officeName } = useAuth();
  const [clients] = useState<Client[]>(sampleClients);
  const [applications] = useState<Application[]>(sampleApplications);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

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
      case "要件確認中":
        return "bg-yellow-100 text-yellow-700";
      case "申請済み":
        return "bg-green-100 text-green-700";
      case "期限超過":
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

  // 選択した会社の申請を取得
  const getClientApplications = (clientId: string) => {
    return applications.filter(app => app.clientId === clientId);
  };

  // 会社ごとの統計を計算
  const getClientStats = (clientId: string) => {
    const clientApps = getClientApplications(clientId);
    const urgent = clientApps.filter(app => app.daysRemaining >= 0 && app.daysRemaining <= 14).length;
    const expired = clientApps.filter(app => app.daysRemaining < 0).length;
    const total = clientApps.reduce((sum, app) => sum + (app.estimatedAmount?.total || 800000), 0);
    return { count: clientApps.length, urgent, expired, total };
  };

  if (loading) {
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
              {allUrgent.slice(0, 3).map((app) => (
                <div key={app.id} className="mt-1">
                  <strong>{app.workerName}</strong>さん: あと{app.daysRemaining}日
                  （期限: {app.applicationDeadline}）
                </div>
              ))}
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
                <CardTitle className="flex items-center gap-2">
                  <span>🏢</span> 顧問先企業
                </CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <span>👤</span>
                  {selectedClient ? `${selectedClient.companyName} の申請` : 'すべての申請'}
                </CardTitle>
                <CardDescription>
                  {selectedClient
                    ? `${selectedClient.companyName} の対象労働者と申請状況`
                    : '全企業の対象労働者と申請状況'}
                </CardDescription>
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
                        <Button className="mt-4">新規申請を登録</Button>
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
                            const client = clients.find(c => c.id === app.clientId);
                            return (
                              <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">
                                  <div className="font-medium">{app.workerName}</div>
                                  {app.scenario && (
                                    <div className="text-xs text-gray-500">{app.scenario}</div>
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
                                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
                                    {app.status}
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
                                  <Button variant="outline" size="sm">詳細</Button>
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
                  <CardTitle className="text-lg">企業情報</CardTitle>
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
    </div>
  );
}
