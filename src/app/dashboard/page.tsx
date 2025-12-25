"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Application {
  id: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      if (!user) return;

      try {
        // Firestoreから申請データを取得
        const applicationsRef = collection(db, "applications");
        const q = query(
          applicationsRef,
          where("createdBy", "==", user.uid),
          orderBy("daysRemaining", "asc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // データがない場合はデモ用のサンプルデータを表示
          setApplications([
            {
              id: "demo-1",
              workerName: "サンプル 太郎",
              conversionDate: "2025-04-01",
              applicationDeadline: "2025-12-25",
              status: "準備中",
              daysRemaining: 2,
            },
          ]);
        } else {
          const apps: Application[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            // Timestampを文字列に変換
            const conversionDate = data.conversionDate instanceof Timestamp
              ? data.conversionDate.toDate().toISOString().split('T')[0]
              : data.conversionDate;
            const applicationDeadline = typeof data.applicationDeadline === 'string'
              ? data.applicationDeadline
              : data.phase1?.deadline instanceof Timestamp
                ? data.phase1.deadline.toDate().toISOString().split('T')[0]
                : '';

            return {
              id: doc.id,
              workerName: data.workerName || '名前未設定',
              conversionDate,
              applicationDeadline,
              status: data.status || '準備中',
              daysRemaining: data.daysRemaining ?? 0,
              isPriorityTarget: data.isPriorityTarget,
              priorityCategory: data.priorityCategory,
              scenario: data.scenario,
              estimatedAmount: data.estimatedAmount,
            };
          });
          setApplications(apps);
        }
      } catch (error) {
        console.error("申請データの取得エラー:", error);
        // エラー時はデモデータを表示
        setApplications([
          {
            id: "demo-1",
            workerName: "サンプル 太郎",
            conversionDate: "2025-04-01",
            applicationDeadline: "2025-12-25",
            status: "準備中",
            daysRemaining: 2,
          },
        ]);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
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

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  // 期限が近い申請（14日以内、ただし期限超過は除く）
  const urgentApplications = applications.filter((app) => app.daysRemaining >= 0 && app.daysRemaining <= 14);

  // 期限超過の申請
  const expiredApplications = applications.filter((app) => app.daysRemaining < 0);

  // 重点支援対象者の申請
  const priorityApplications = applications.filter((app) => app.isPriorityTarget);

  // 想定助成金総額を計算
  const totalEstimatedAmount = applications.reduce((sum, app) => {
    return sum + (app.estimatedAmount?.total || 800000);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-600 mb-8">申請状況の確認と各種ツールにアクセスできます</p>

        {/* 期限アラート */}
        {urgentApplications.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>申請期限が近い案件があります</AlertTitle>
            <AlertDescription>
              {urgentApplications.map((app) => (
                <div key={app.id} className="mt-1">
                  <strong>{app.workerName}</strong>さん: あと{app.daysRemaining}日
                  （期限: {app.applicationDeadline}）
                </div>
              ))}
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
                <p className="text-sm text-gray-600">
                  3%賃金上昇率を計算
                </p>
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
                <p className="text-sm text-gray-600">
                  支給要件を確認
                </p>
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
                <p className="text-sm text-gray-600">
                  必要書類を確認
                </p>
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
                <p className="text-sm text-gray-600">
                  よくある誤解と対策
                </p>
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
              <p className="text-sm text-gray-600">
                新しい申請を登録
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 統計カード */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {applications.length}
                </div>
                <div className="text-sm text-gray-600">全申請件数</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {urgentApplications.length}
                </div>
                <div className="text-sm text-gray-600">期限間近</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {expiredApplications.length}
                </div>
                <div className="text-sm text-gray-600">期限超過</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {priorityApplications.length}
                </div>
                <div className="text-sm text-gray-600">重点支援対象</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  ¥{totalEstimatedAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">想定助成金総額</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 申請一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>申請一覧</CardTitle>
            <CardDescription>
              進行中のキャリアアップ助成金申請
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>まだ申請がありません</p>
                <Button className="mt-4">新規申請を登録</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">労働者名</th>
                      <th className="text-left py-3 px-2 font-medium">転換日</th>
                      <th className="text-left py-3 px-2 font-medium">申請期限</th>
                      <th className="text-left py-3 px-2 font-medium">残り日数</th>
                      <th className="text-left py-3 px-2 font-medium">ステータス</th>
                      <th className="text-left py-3 px-2 font-medium">重点支援</th>
                      <th className="text-left py-3 px-2 font-medium">想定額</th>
                      <th className="text-left py-3 px-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{app.workerName}</div>
                          {app.scenario && (
                            <div className="text-xs text-gray-500">{app.scenario}</div>
                          )}
                        </td>
                        <td className="py-3 px-2">{app.conversionDate}</td>
                        <td className="py-3 px-2">{app.applicationDeadline}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${getDeadlineColor(
                              app.daysRemaining
                            )}`}
                          >
                            {app.daysRemaining < 0
                              ? `${Math.abs(app.daysRemaining)}日超過`
                              : `${app.daysRemaining}日`}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${getStatusColor(
                              app.status
                            )}`}
                          >
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
                          <Button variant="outline" size="sm">
                            詳細
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
