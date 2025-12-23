"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // 申請データを取得（デモ用のサンプルデータ）
        setApplications([
          {
            id: "1",
            workerName: "田中 一郎",
            conversionDate: "2025-04-01",
            applicationDeadline: "2025-12-25",
            status: "準備中",
            daysRemaining: 2,
          },
          {
            id: "2",
            workerName: "鈴木 花子",
            conversionDate: "2025-06-01",
            applicationDeadline: "2026-02-25",
            status: "書類作成中",
            daysRemaining: 64,
          },
          {
            id: "3",
            workerName: "佐藤 次郎",
            conversionDate: "2025-07-15",
            applicationDeadline: "2026-03-25",
            status: "要件確認中",
            daysRemaining: 92,
          },
        ]);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  // 期限が近い申請
  const urgentApplications = applications.filter((app) => app.daysRemaining <= 14);

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
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {applications.length}
                </div>
                <div className="text-sm text-gray-600">進行中の申請</div>
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
                <div className="text-3xl font-bold text-green-600">
                  {applications.filter((a) => a.status === "申請済み").length}
                </div>
                <div className="text-sm text-gray-600">申請完了</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  ¥{(applications.length * 800000).toLocaleString()}
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
                      <th className="text-left py-3 px-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{app.workerName}</td>
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
