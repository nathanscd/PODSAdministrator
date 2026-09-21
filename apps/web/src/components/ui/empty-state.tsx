import React from "react";
import { cn } from "../../lib/utils";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-8 h-8 text-[var(--muted-foreground)]" />,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-[var(--card)] border border-dashed border-[var(--border)]",
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--muted)] mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-md mb-6">{description}</p>
      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {primaryActionLabel && (
            <Button size="sm" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
