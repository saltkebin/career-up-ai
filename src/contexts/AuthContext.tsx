"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * シンプルなパスワード認証コンテキスト
 * 特定の社労士事務所向けに、パスワード入力のみでアプリ全体を使用可能にする
 */

// 環境変数からパスワードを取得（設定されていない場合はデフォルト値）
const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "sharoushi2025";

// 事務所IDを固定（デモ用）
// 本番環境ではパスワードに基づくユニークIDに変更可能
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateOfficeId(_password: string): string {
  return "demo-office";
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  officeName: string;
  officeId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "career-up-ai-auth";
const OFFICE_ID_KEY = "career-up-ai-office-id";
const OFFICE_NAME = "テスト社労士事務所"; // 後で設定可能に

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [officeId, setOfficeId] = useState<string | null>(null);

  useEffect(() => {
    // ローカルストレージから認証状態を復元
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedOfficeId = localStorage.getItem(OFFICE_ID_KEY);
      if (stored === "authenticated" && storedOfficeId) {
        setIsAuthenticated(true);
        setOfficeId(storedOfficeId);
      }
    } catch (error) {
      console.error("認証状態の復元エラー:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === APP_PASSWORD) {
      const newOfficeId = generateOfficeId(password);
      setIsAuthenticated(true);
      setOfficeId(newOfficeId);
      try {
        localStorage.setItem(STORAGE_KEY, "authenticated");
        localStorage.setItem(OFFICE_ID_KEY, newOfficeId);
      } catch (error) {
        console.error("認証状態の保存エラー:", error);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setOfficeId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OFFICE_ID_KEY);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      login,
      logout,
      officeName: OFFICE_NAME,
      officeId
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
