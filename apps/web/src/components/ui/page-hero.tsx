import React from "react";
import { cn } from "../../lib/utils";

export interface PageHeroProps {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  badge,
  title,
  description,
  actions,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col md:flex-row md:items-center pointer-events-none justify-between gap-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] overflow-hidden mb-6",
        className
      )}
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4 z-10">
        {icon && (
          <div className="flex items-center justify-center p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)]">
              {badge}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      {actions && <div className="relative z-10 flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};

export const SectionHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => (
  <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
    <div>
      <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">{title}</h2>
      {description && <p className="text-xs text-[var(--muted-foreground)]">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
