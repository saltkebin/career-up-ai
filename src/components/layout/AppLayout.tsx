"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useData, Client } from "@/contexts/DataContext";

interface AppLayoutProps {
  children: ReactNode;
  selectedClient?: Client | null;
  onClientChange?: (client: Client | null) => void;
  showClientSelector?: boolean;
}

export function AppLayout({
  children,
  selectedClient,
  onClientChange,
  showClientSelector = false
}: AppLayoutProps) {
  const { applications } = useData();

  // 期限間近の件数を計算
  const urgentCount = applications.filter(
    app => app.daysRemaining >= 0 && app.daysRemaining <= 14
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar urgentCount={urgentCount} />
      <div className="ml-64">
        <Header
          selectedClient={selectedClient}
          onClientChange={onClientChange}
          showClientSelector={showClientSelector}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
