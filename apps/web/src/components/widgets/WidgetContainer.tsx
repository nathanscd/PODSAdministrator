import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Move, Trash2, Settings } from 'lucide-react';
import { WidgetConfig } from 'shared/types';

interface WidgetContainerProps {
  widget: WidgetConfig;
  onRemove?: (id: string) => void;
  onConfigure?: (id: string) => void;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  onRemove,
  onConfigure,
  children,
}) => {
  const widthClass = 
    widget.width === 'half' ? 'col-span-1 md:col-span-1' :
    widget.width === 'third' ? 'col-span-1 md:col-span-1 lg:col-span-1' : 'col-span-full';

  return (
    <Card className={`bg-card border-border shadow-sm ${widthClass}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-muted-foreground cursor-grab" />
          <CardTitle className="text-sm font-semibold text-foreground">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          {onConfigure && (
            <Button variant="ghost" size="icon" onClick={() => onConfigure(widget.id)} title="Configurar">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="icon" onClick={() => onRemove(widget.id)} title="Remover">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
};
