import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface MetricItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
}

interface MetricsGridProps {
  metrics: MetricItem[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            {metric.icon && <div className="text-primary">{metric.icon}</div>}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            {metric.description && <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
