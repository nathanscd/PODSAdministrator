import React from "react";
import { cn } from "../../lib/utils";

export interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const WidgetHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, actions, className }) => (
  <div className={cn("flex items-center justify-between px-5 py-4 border-b border-[var(--border)]", className)}>
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--muted)] text-[var(--primary)] font-medium">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  contentClassName,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] overflow-hidden transition-all duration-200",
        className
      )}
    >
      <WidgetHeader title={title} subtitle={subtitle} icon={icon} actions={actions} />
      <div className={cn("p-5 flex-1", contentClassName)}>{children}</div>
    </div>
  );
};
