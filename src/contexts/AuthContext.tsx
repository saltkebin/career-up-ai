"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * シンプルなパスワード認証コンテキスト
 * 特定の社労士事務所向けに、パスワード入力のみでアプリ全体を使用可能にする
 */

// 環境変数からパスワードを取得（設定されていない場合はデフォルト値）
const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "sharoushi2025";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  officeName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "career-up-ai-auth";
const OFFICE_NAME = "テスト社労士事務所"; // 後で設定可能に

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージから認証状態を復元
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "authenticated") {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("認証状態の復元エラー:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY, "authenticated");
      } catch (error) {
        console.error("認証状態の保存エラー:", error);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
      officeName: OFFICE_NAME
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
