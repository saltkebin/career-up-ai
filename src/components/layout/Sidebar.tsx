"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  badgeColor?: string;
}

interface SidebarProps {
  urgentCount?: number;
}

export function Sidebar({ urgentCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "ダッシュボード", icon: "📊" },
    { href: "/calendar", label: "カレンダー", icon: "📅" },
    { href: "/calculator", label: "賃金計算", icon: "🧮" },
    { href: "/eligibility", label: "要件チェック", icon: "✅" },
    { href: "/documents/check", label: "書類チェック", icon: "📋" },
    { href: "/guide", label: "ガイド", icon: "📚" },
  ];

  const bottomItems: NavItem[] = [
    { href: "/settings", label: "設定", icon: "⚙️" },
    { href: "/help", label: "ヘルプ", icon: "❓" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col">
      {/* ロゴ */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <div>
            <div className="font-bold text-sm">キャリアアップ助成金</div>
            <div className="text-xs text-slate-400">申請支援システム</div>
          </div>
        </Link>
      </div>

      {/* 緊急アラート */}
      {urgentCount > 0 && (
        <div className="mx-3 mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-400 animate-pulse">●</span>
            <span className="text-sm font-medium text-red-300">
              期限間近: {urgentCount}件
            </span>
          </div>
        </div>
      )}

      {/* メインナビ */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "ml-auto px-2 py-0.5 text-xs rounded-full",
                  item.badgeColor || "bg-red-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 下部ナビ */}
      <div className="p-3 border-t border-slate-700 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
