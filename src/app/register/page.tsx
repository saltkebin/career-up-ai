"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    officeName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 既にログインしている場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (formData.password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }

    setLoading(true);

    try {
      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;
      const now = new Date().toISOString();

      // プロフィール更新とFirestore保存を並列実行
      await Promise.all([
        updateProfile(userCredential.user, {
          displayName: formData.name,
        }),
        setDoc(doc(db, "users", uid), {
          uid,
          email: formData.email,
          name: formData.name,
          officeName: formData.officeName,
          role: "admin",
          createdAt: now,
          updatedAt: now,
        }),
        setDoc(doc(db, "offices", uid), {
          id: uid,
          name: formData.officeName,
          ownerUid: uid,
          createdAt: now,
          updatedAt: now,
        }),
      ]);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          setError("このメールアドレスは既に登録されています");
        } else if (err.message.includes("weak-password")) {
          setError("パスワードが弱すぎます。より強力なパスワードを設定してください");
        } else if (err.message.includes("invalid-email")) {
          setError("メールアドレスの形式が正しくありません");
        } else {
          setError("登録に失敗しました。もう一度お試しください");
        }
      }
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-xl font-bold text-blue-900 mb-4 block">
            キャリアアップ助成金 申請支援
          </Link>
          <CardTitle>新規登録</CardTitle>
          <CardDescription>
            アカウントを作成して申請管理を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="officeName">事務所名</Label>
              <Input
                id="officeName"
                name="officeName"
                type="text"
                value={formData.officeName}
                onChange={handleChange}
                placeholder="○○社会保険労務士事務所"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">担当者名</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@company.co.jp"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8文字以上"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                8文字以上で設定してください
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="パスワードを再入力"
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "アカウントを作成"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              既にアカウントをお持ちの方は
              <Link href="/login" className="text-blue-600 hover:underline ml-1">
                ログイン
              </Link>
            </p>
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
