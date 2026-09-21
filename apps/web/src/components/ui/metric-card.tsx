import React from "react";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: "up" | "down" | "neutral";
  period?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  period = "vs mês anterior",
  icon,
  subtitle,
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-card)] transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--muted)] text-[var(--foreground)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {value}
        </span>

        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              (!trend || trend === "neutral") && "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400"
            )}
          >
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "neutral" && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {period && (
        <p className="text-[11px] font-medium text-[var(--muted-foreground)] mt-2">
          {period}
        </p>
      )}
    </div>
  );
};
