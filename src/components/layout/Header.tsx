"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useData, Client } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  selectedClient?: Client | null;
  onClientChange?: (client: Client | null) => void;
  showClientSelector?: boolean;
}

export function Header({
  selectedClient,
  onClientChange,
  showClientSelector = true
}: HeaderProps) {
  const router = useRouter();
  const { logout, officeName } = useAuth();
  const { clients } = useData();
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter(c =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* 企業セレクター */}
        {showClientSelector && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-lg">🏢</span>
              <span className="font-medium text-gray-700">
                {selectedClient ? selectedClient.companyName : "全ての企業"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isClientDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                {/* 検索 */}
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="企業名で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {/* 全企業オプション */}
                  <button
                    onClick={() => {
                      onClientChange?.(null);
                      setIsClientDropdownOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedClient
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">全ての企業</div>
                    <div className="text-xs text-gray-500">{clients.length}社</div>
                  </button>

                  <div className="my-2 border-t" />

                  {/* 企業リスト */}
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        onClientChange?.(client);
                        setIsClientDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedClient?.id === client.id
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">{client.companyName}</div>
                      <div className="text-xs text-gray-500">
                        {client.isSmallBusiness ? "中小企業" : "大企業"}
                      </div>
                    </button>
                  ))}

                  {filteredClients.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      該当する企業がありません
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{officeName}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
