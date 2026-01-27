"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useData, Application } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { applications, loading: dataLoading, getClientById } = useData();

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // 月の日付を生成
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // カレンダーの開始日（前月の日曜日から）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // カレンダーの終了日（次月の土曜日まで）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // 日付ごとの申請を取得
  const getApplicationsForDate = (date: Date): Application[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return applications.filter(app => app.applicationDeadline === dateStr);
  };

  // 期限の緊急度に応じた色
  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return "bg-red-600 text-white";
    if (daysRemaining <= 7) return "bg-red-500 text-white";
    if (daysRemaining <= 14) return "bg-orange-500 text-white";
    if (daysRemaining <= 30) return "bg-yellow-500 text-white";
    return "bg-blue-500 text-white";
  };

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  // 今月に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 月名
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // 今月の期限一覧
  const thisMonthDeadlines = applications
    .filter(app => {
      const deadline = new Date(app.applicationDeadline);
      return deadline.getFullYear() === currentDate.getFullYear() &&
             deadline.getMonth() === currentDate.getMonth();
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <AppLayout>
      {dataLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">申請期限カレンダー</h1>
            <p className="text-gray-600 text-sm mt-1">申請期限を視覚的に確認できます</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
                      ← 前月
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      今月
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
                      翌月 →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((day, i) => (
                    <div
                      key={day}
                      className={`text-center py-2 font-medium text-sm ${
                        i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダー日付 */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.getTime() === today.getTime();
                    const dayApps = getApplicationsForDate(date);
                    const dayOfWeek = date.getDay();

                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-1 border rounded ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div
                          className={`text-sm mb-1 ${
                            !isCurrentMonth ? 'text-gray-400' :
                            dayOfWeek === 0 ? 'text-red-600' :
                            dayOfWeek === 6 ? 'text-blue-600' : ''
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayApps.slice(0, 3).map(app => {
                            const client = getClientById(app.clientId);
                            return (
                              <div
                                key={app.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${getDeadlineColor(app.daysRemaining)}`}
                                title={`${client?.companyName} - ${app.workerName}`}
                              >
                                {app.workerName}
                              </div>
                            );
                          })}
                          {dayApps.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayApps.length - 3}件
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 凡例 */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <span className="w-4 h-4 rounded bg-red-600"></span>
                        <span>期限超過</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>申請期限を過ぎています。早急に労働局に相談してください</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <span className="w-4 h-4 rounded bg-red-500"></span>
                        <span>7日以内</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>期限まで7日以内。最優先で書類を完成させてください</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <span className="w-4 h-4 rounded bg-orange-500"></span>
                        <span>14日以内</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>期限まで14日以内。書類の準備を急いでください</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <span className="w-4 h-4 rounded bg-yellow-500"></span>
                        <span>30日以内</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>期限まで30日以内。計画的に書類を準備しましょう</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <span className="w-4 h-4 rounded bg-blue-500"></span>
                        <span>31日以上</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>期限まで余裕があります。必要書類を確認しておきましょう</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー: 今月の期限一覧 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {monthNames[currentDate.getMonth()]}の期限
                </CardTitle>
                <CardDescription>
                  {thisMonthDeadlines.length}件の申請
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thisMonthDeadlines.length === 0 ? (
                  <p className="text-gray-500 text-sm">この月に期限の申請はありません</p>
                ) : (
                  <div className="space-y-3">
                    {thisMonthDeadlines.map(app => {
                      const client = getClientById(app.clientId);
                      return (
                        <div
                          key={app.id}
                          className={`p-3 rounded-lg border ${
                            app.daysRemaining < 0 ? 'border-red-300 bg-red-50' :
                            app.daysRemaining <= 7 ? 'border-red-200 bg-red-50' :
                            app.daysRemaining <= 14 ? 'border-orange-200 bg-orange-50' :
                            'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{app.workerName}</div>
                          <div className="text-xs text-gray-600">{client?.companyName}</div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {app.applicationDeadline}
                            </span>
                            <span className={`text-xs font-medium ${
                              app.daysRemaining < 0 ? 'text-red-600' :
                              app.daysRemaining <= 7 ? 'text-red-600' :
                              app.daysRemaining <= 14 ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              {app.daysRemaining < 0
                                ? `${Math.abs(app.daysRemaining)}日超過`
                                : `残り${app.daysRemaining}日`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 期限アラート設定 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🔔</span> リマインダー設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>14日前通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>7日前通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3日前通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>1日前通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  ※ 通知はダッシュボードのアラートに表示されます
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      )}
    </AppLayout>
  );
}
