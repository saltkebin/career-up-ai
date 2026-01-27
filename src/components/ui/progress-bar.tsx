"use client";

import { cn } from "@/lib/utils";

interface DeadlineProgressProps {
  daysRemaining: number;
  maxDays?: number;
  showLabel?: boolean;
}

export function DeadlineProgress({
  daysRemaining,
  maxDays = 60,
  showLabel = true
}: DeadlineProgressProps) {
  // 進捗率を計算（期限切れは0%、60日以上は100%）
  const progress = Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100));

  // 色を決定
  const getColor = () => {
    if (daysRemaining < 0) return "bg-red-500";
    if (daysRemaining <= 7) return "bg-red-500";
    if (daysRemaining <= 14) return "bg-orange-500";
    if (daysRemaining <= 30) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getIcon = () => {
    if (daysRemaining < 0) return "🔴";
    if (daysRemaining <= 7) return "🔴";
    if (daysRemaining <= 14) return "🟠";
    if (daysRemaining <= 30) return "🟡";
    return "🟢";
  };

  const getText = () => {
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)}日超過`;
    if (daysRemaining === 0) return "本日期限";
    return `あと${daysRemaining}日`;
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm font-medium whitespace-nowrap">
          {getIcon()} {getText()}
        </span>
      )}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "準備中":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "書類作成中":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "申請済み":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "審査中":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "承認済み":
        return "bg-green-100 text-green-700 border-green-300";
      case "支給済み":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "不承認":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        getStatusStyle(),
        sizeClasses[size]
      )}
    >
      {status}
    </span>
  );
}
