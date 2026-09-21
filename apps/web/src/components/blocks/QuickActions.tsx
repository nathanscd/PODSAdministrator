import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface QuickActionsProps {
  title?: string;
  actions: ActionItem[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ title = "Ações Rápidas", actions }) => {
  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {actions.map((act, idx) => (
          <Button
            key={idx}
            variant={act.variant || "outline"}
            onClick={act.onClick}
            className="flex items-center gap-2"
          >
            {act.icon}
            {act.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
