import React from "react";
import { cn } from "../../lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral" | "pending";

export interface StatusBadgeProps {
  status?: StatusType;
  label: string;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = "neutral",
  label,
  dot = true,
  className,
}) => {
  const statusStyles: Record<StatusType, string> = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    pending: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    neutral: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
  };

  const dotStyles: Record<StatusType, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-blue-500",
    pending: "bg-purple-500",
    neutral: "bg-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        statusStyles[status],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[status])} />}
      <span>{label}</span>
    </span>
  );
};
