import React from 'react';
import { WidgetConfig } from 'shared/types';
import { WidgetContainer } from './WidgetContainer';

interface WidgetRegistryProps {
  widgets: WidgetConfig[];
  onRemoveWidget?: (id: string) => void;
  onConfigureWidget?: (id: string) => void;
}

export const WidgetRegistry: React.FC<WidgetRegistryProps> = ({
  widgets,
  onRemoveWidget,
  onConfigureWidget,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <WidgetContainer
          key={widget.id}
          widget={widget}
          onRemove={onRemoveWidget}
          onConfigure={onConfigureWidget}
        >
          <div className="text-sm text-muted-foreground py-6 text-center">
            Widget [{widget.type.toUpperCase()}] carregado com sucesso.
          </div>
        </WidgetContainer>
      ))}
    </div>
  );
};
