"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout, officeName } = useAuth();
  const { clients, applications, loading: dataLoading, importData, exportData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{ clients: number; applications: number } | null>(null);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // JSONエクスポート
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `career-up-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'バックアップファイルをダウンロードしました' });
    } catch {
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
    }
  };

  // ファイル選択
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // プレビュー情報を設定
        setImportPreview({
          clients: data.clients?.length || 0,
          applications: data.applications?.length || 0,
        });
        setPendingImportData(content);
        setIsImportConfirmOpen(true);
      } catch {
        setMessage({ type: 'error', text: '無効なファイル形式です。JSONファイルを選択してください。' });
      }
    };
    reader.readAsText(file);

    // 同じファイルを再選択できるようにリセット
    event.target.value = '';
  };

  // インポート実行
  const executeImport = async () => {
    if (!pendingImportData) return;

    try {
      const success = await importData(pendingImportData);
      if (success) {
        setMessage({ type: 'success', text: 'データを復元しました' });
      } else {
        setMessage({ type: 'error', text: 'データの復元に失敗しました' });
      }
    } catch {
      setMessage({ type: 'error', text: 'データの復元に失敗しました' });
    }

    setIsImportConfirmOpen(false);
    setPendingImportData(null);
    setImportPreview(null);
  };

  // データクリア
  const handleClearData = async () => {
    if (confirm('すべてのデータを削除してもよろしいですか？この操作は取り消せません。')) {
      try {
        // 空のJSONをインポートしてデータをクリア
        await importData(JSON.stringify({ clients: [], applications: [] }));
        setMessage({ type: 'success', text: 'すべてのデータを削除しました' });
      } catch {
        setMessage({ type: 'error', text: 'データの削除に失敗しました' });
      }
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-blue-900">
            キャリアアップ助成金 申請支援
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-sm text-gray-600 hover:text-blue-600">
              ヘルプ
            </Link>
            <span className="text-sm text-gray-600">{officeName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">&larr; ダッシュボードに戻る</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">設定</h1>
        <p className="text-gray-600 mb-8">データのバックアップと復元、各種設定を管理します</p>

        {message && (
          <Alert
            className={`mb-6 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
          >
            <AlertTitle>{message.type === 'success' ? '完了' : 'エラー'}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* データバックアップ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💾</span>
              データバックアップ
            </CardTitle>
            <CardDescription>
              顧問先企業と申請データをJSONファイルとして保存します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">現在のデータ</div>
                  <div className="text-sm text-gray-600">
                    顧問先: {clients.length}件 / 申請: {applications.length}件
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleExport}>
                      JSONエクスポート
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>全データをJSONファイルとしてダウンロードします。このファイルで完全復元が可能です</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-500">
                定期的にバックアップを取ることをお勧めします。
                エクスポートしたファイルは安全な場所に保管してください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* データ復元 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📥</span>
              データ復元
            </CardTitle>
            <CardDescription>
              バックアップファイルからデータを復元します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-gray-600 mb-4">
                  JSONファイルを選択してデータを復元します
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      ファイルを選択
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>以前エクスポートしたJSONファイルを選択してデータを復元します</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Alert className="border-orange-300 bg-orange-50">
                <AlertTitle className="text-orange-700">注意</AlertTitle>
                <AlertDescription className="text-orange-600">
                  インポートすると現在のデータは上書きされます。
                  事前に現在のデータをエクスポートしておくことをお勧めします。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* CSVエクスポート */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              CSVエクスポート
            </CardTitle>
            <CardDescription>
              申請データをCSV形式でエクスポートしてExcelで編集できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => exportToCSV('applications')}
                  >
                    <div className="text-left">
                      <div className="font-medium">申請データCSV</div>
                      <div className="text-xs text-gray-500">全{applications.length}件の申請</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>申請データをExcelで開けるCSVファイルとしてダウンロードします</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => exportToCSV('clients')}
                  >
                    <div className="text-left">
                      <div className="font-medium">顧問先データCSV</div>
                      <div className="text-xs text-gray-500">全{clients.length}件の企業</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>顧問先企業データをExcelで開けるCSVファイルとしてダウンロードします</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <span className="text-2xl">⚠️</span>
              データ管理
            </CardTitle>
            <CardDescription>
              危険な操作です。実行前に必ずバックアップを取ってください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleClearData}
            >
              すべてのデータを削除
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* インポート確認モーダル */}
      <Dialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データ復元の確認</DialogTitle>
            <DialogDescription>
              以下のデータをインポートします。現在のデータは上書きされます。
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>顧問先企業:</span>
                  <span className="font-medium">{importPreview.clients}件</span>
                </div>
                <div className="flex justify-between">
                  <span>申請データ:</span>
                  <span className="font-medium">{importPreview.applications}件</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={executeImport}>
              インポートする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // CSVエクスポート関数
  function exportToCSV(type: 'applications' | 'clients') {
    try {
      let csv = '';
      const timestamp = new Date().toISOString().slice(0, 10);
      let filename = '';

      if (type === 'applications') {
        // ヘッダー行
        csv = '企業名,労働者名,フリガナ,生年月日,性別,雇入れ日,転換日,転換区分,申請期限,残り日数,ステータス,重点支援,カテゴリ,理由,転換前賃金,転換後賃金,上昇率,1期目,2期目,合計,メモ\n';

        // データ行
        applications.forEach(app => {
          const client = clients.find(c => c.id === app.clientId);
          const gender = app.gender === 'male' ? '男性' : app.gender === 'female' ? '女性' : '';
          const conversionType = app.conversionType === 'fixed_to_regular' ? '有期→正規'
            : app.conversionType === 'indefinite_to_regular' ? '無期→正規'
            : '派遣→正規';

          csv += [
            escapeCSV(client?.companyName || ''),
            escapeCSV(app.workerName),
            escapeCSV(app.workerNameKana || ''),
            app.birthDate || '',
            gender,
            app.hireDate || '',
            app.conversionDate,
            conversionType,
            app.applicationDeadline,
            app.daysRemaining,
            app.statusLabel,
            app.isPriorityTarget ? 'はい' : 'いいえ',
            app.priorityCategory || '',
            escapeCSV(app.priorityReason || ''),
            app.preSalary || '',
            app.postSalary || '',
            app.salaryIncreaseRate?.toFixed(1) || '',
            app.estimatedAmount?.phase1 || 0,
            app.estimatedAmount?.phase2 || 0,
            app.estimatedAmount?.total || 0,
            escapeCSV(app.notes || ''),
          ].join(',') + '\n';
        });

        filename = `applications-${timestamp}.csv`;
      } else {
        // 顧問先データ
        csv = '企業名,事業所番号,企業規模,キャリアアップ管理者,就業規則,計画届出日,申請件数,想定助成金総額\n';

        clients.forEach(client => {
          const clientApps = applications.filter(a => a.clientId === client.id);
          const totalAmount = clientApps.reduce((sum, a) => sum + (a.estimatedAmount?.total || 0), 0);

          csv += [
            escapeCSV(client.companyName),
            escapeCSV(client.registrationNumber || ''),
            client.isSmallBusiness ? '中小企業' : '大企業',
            escapeCSV(client.careerUpManager || ''),
            client.hasEmploymentRules ? '整備済み' : '未整備',
            client.careerUpPlanSubmittedAt || '',
            clientApps.length,
            totalAmount,
          ].join(',') + '\n';
        });

        filename = `clients-${timestamp}.csv`;
      }

      // BOM付きUTF-8でダウンロード
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `${type === 'applications' ? '申請' : '顧問先'}データをエクスポートしました` });
    } catch {
      setMessage({ type: 'error', text: 'CSVエクスポートに失敗しました' });
    }
  }

  function escapeCSV(str: string): string {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
