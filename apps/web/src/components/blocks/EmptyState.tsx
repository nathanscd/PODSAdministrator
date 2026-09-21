import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FolderOpen size={40} className="text-muted-foreground" />,
}) => {
  return (
    <Card className="bg-card border-border border-dashed p-8 text-center my-6">
      <CardContent className="flex flex-col items-center justify-center space-y-3 pt-4">
        <div className="p-3 rounded-full bg-muted/50">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
