"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 既にログインしている場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // シンプルなパスワード認証
    const success = login(password);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("パスワードが正しくありません");
    }

    setLoading(false);
  };

  // 認証状態確認中は読み込み表示
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <div>
            <CardTitle className="text-2xl text-blue-900">
              キャリアアップ助成金
            </CardTitle>
            <CardTitle className="text-lg text-blue-700">
              申請支援システム
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            パスワードを入力してログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="password" className="text-base">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                className="mt-2 h-12 text-lg"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">このシステムでできること</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ 3%賃金上昇率の自動計算</li>
              <li>✅ 支給要件のチェック</li>
              <li>✅ 重点支援対象者の判定</li>
              <li>✅ 申請期限の管理</li>
              <li>✅ 必要書類のチェックリスト</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              トップページに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
