import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, action }) => {
  return (
    <Card className="mb-6 bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{title}</CardTitle>
          {description && <CardDescription className="text-muted-foreground mt-1">{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
    </Card>
  );
};
