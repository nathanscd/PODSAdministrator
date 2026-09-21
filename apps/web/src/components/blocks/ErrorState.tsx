import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Ocorreu um erro",
  message,
  onRetry,
}) => {
  return (
    <Card className="bg-destructive/10 border-destructive/30 p-6 my-6 text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="p-3 rounded-full bg-destructive/20 text-destructive mb-2">
          <AlertTriangle size={32} />
        </div>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground mt-1">{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button variant="destructive" onClick={onRetry}>
            Tentar Novamente
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
