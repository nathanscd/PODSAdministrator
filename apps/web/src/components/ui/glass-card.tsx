import React from "react";
import { cn } from "../../lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  interactive = false,
  glow = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-[var(--shadow-subtle)] backdrop-blur-md transition-all duration-300",
        interactive && "hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 cursor-pointer",
        glow && "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-[var(--primary)]/10 before:to-transparent before:blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
