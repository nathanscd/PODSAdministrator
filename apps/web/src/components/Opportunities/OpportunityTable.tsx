import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { OpportunityRow } from './OpportunityRow';
import { Opportunity } from '../../types';

interface OpportunityTableProps {
  groupedData: [string, Opportunity[]][];
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupName: string) => void;
  handleOpenMenu: (e: React.MouseEvent, opp: Opportunity) => void;
  t: any;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  groupedData,
  expandedGroups,
  toggleGroup,
  handleOpenMenu,
  t,
}) => {
  const [columnWidths, setColumnWidths] = useState({
    action: 60,
    description: 300,
  });

  const [resize, setResize] = useState<{
    column: keyof typeof columnWidths;
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!resize) return;
      const diff = e.clientX - resize.startX;
      setColumnWidths(prev => ({
        ...prev,
        [resize.column]: Math.max(
          resize.column === 'action' ? 60 : 200,
          resize.startWidth + diff
        )
      }));
    };

    const handleUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setResize(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resize]);

  const startResize = (e: React.MouseEvent, column: keyof typeof columnWidths) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    setResize({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column]
    });
  };

  const calculateGroupProgress = (opps: Opportunity[]) => {
    if (!opps.length) return 0;
    const total = opps.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0);
    return Math.round(total / opps.length);
  };

  const ResizableHeader = ({
    label,
    width,
    left,
    column
  }: {
    label: string;
    width: number;
    left?: number;
    column: keyof typeof columnWidths;
  }) => (
    <th
      style={{ width, left }}
      className="relative px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap sticky z-50 group"
    >
      {label}
      <div
        onMouseDown={(e) => startResize(e, column)}
        className="absolute top-0 right-[-4px] h-full w-[8px] cursor-col-resize z-[100]"
      >
        <div className={`absolute right-[3px] top-[20%] h-[60%] ${resize?.column === column ? 'bg-[var(--text-primary)] w-[2px]' : 'w-[1px] bg-transparent group-hover:bg-[var(--border-color)]'}`} />
      </div>
    </th>
  );

  return (
    <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--card-bg)]" data-lenis-prevent>
      <table className="w-max min-w-full border-separate border-spacing-0 text-left" style={{ tableLayout: 'fixed' }}>
        <thead className="sticky top-0 z-40 bg-[var(--bg-app)]">
          <tr>
            <ResizableHeader label="Actions" width={columnWidths.action} left={0} column="action" />
            <ResizableHeader label={t.opp.table.description} width={columnWidths.description} left={columnWidths.action} column="description" />
            
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.group}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.utility}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.kam}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.product}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.status}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.stage}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.priority}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.progress}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.qty}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.scp}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.homologated}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.country}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.ecosystem}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.start}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.end}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.hqSupport}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.reason}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.competitors}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.productTeam}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.salesMgmt}</th>
            <th className="px-4 py-2 border-b border-r border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{t.opp.table.lastDiscussion}</th>
            <th className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-app)] text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap text-center">{t.opp.table.link}</th>
          </tr>
        </thead>

        <tbody>
          {groupedData.map(([groupName, groupOpps]) => {
            const groupProgress = calculateGroupProgress(groupOpps);
            return (
              <React.Fragment key={`group-${groupName}`}>
                <tr className="sticky left-0 z-30">
                  <td
                    colSpan={25}
                    className="px-4 py-2 sticky left-0 bg-[var(--bg-app)] border-b border-[var(--border-color)]"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="flex items-center gap-2 hover:bg-[var(--border-color)] px-1.5 py-1 rounded transition-colors text-[var(--text-primary)]"
                      >
                        <div className="text-[var(--text-secondary)]">
                          {expandedGroups[groupName] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </div>
                        <span className="text-sm font-semibold">
                          {groupName || t.opp.noGroup}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] font-medium">
                          {groupOpps.length}
                        </span>
                      </button>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Progress: {groupProgress}%</span>
                        <div className="w-16 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--text-primary)]" style={{ width: `${groupProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                {expandedGroups[groupName] !== false && groupOpps.map((opp) => (
                  <OpportunityRow
                    key={opp.id}
                    opp={opp}
                    onOpenMenu={handleOpenMenu}
                    columnWidths={columnWidths}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};