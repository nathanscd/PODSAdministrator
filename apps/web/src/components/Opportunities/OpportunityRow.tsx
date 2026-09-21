import React, { memo } from 'react';
import {
  MoreHorizontal,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { Opportunity } from '../../types';

interface OpportunityRowProps {
  opp: Opportunity;
  onOpenMenu: (e: React.MouseEvent, opp: Opportunity) => void;
  columnWidths: {
    action: number;
    description: number;
  };
}

export const OpportunityRow = memo(
  ({ opp, onOpenMenu, columnWidths }: OpportunityRowProps) => {

    const getStatusConfig = (status: string) => {
      const s = status?.toLowerCase() || '';

      if (s.includes('bad') || s.includes('ruim') || s.includes('lost') || s.includes('cancel')) {
        return {
          rowClass: 'bg-[color-mix(in_srgb,var(--bg-app),#ef4444_6%)] hover:bg-[color-mix(in_srgb,var(--bg-app),#ef4444_10%)]',
          border: 'border-red-500/50',
          pillBg: 'bg-red-500/10',
          pillText: 'text-red-500',
          dot: 'bg-red-500'
        };
      }

      if (s.includes('attention') || s.includes('atenção') || s.includes('hold') || s.includes('rfi') || s.includes('rfp')) {
        return {
          rowClass: 'bg-[color-mix(in_srgb,var(--bg-app),#f59e0b_6%)] hover:bg-[color-mix(in_srgb,var(--bg-app),#f59e0b_10%)]',
          border: 'border-amber-500/50',
          pillBg: 'bg-amber-500/10',
          pillText: 'text-amber-500',
          dot: 'bg-amber-500'
        };
      }

      if (s.includes('good') || s.includes('bom') || s.includes('won') || s.includes('delivered')) {
        return {
          rowClass: 'bg-[color-mix(in_srgb,var(--bg-app),#10b981_6%)] hover:bg-[color-mix(in_srgb,var(--bg-app),#10b981_10%)]',
          border: 'border-emerald-500/50',
          pillBg: 'bg-emerald-500/10',
          pillText: 'text-emerald-500',
          dot: 'bg-emerald-500'
        };
      }

      return {
        rowClass: 'bg-[var(--bg-app)] hover:bg-[var(--card-bg)]',
        border: 'border-transparent',
        pillBg: 'bg-[var(--border-color)]/30',
        pillText: 'text-[var(--text-secondary)]',
        dot: 'bg-[var(--text-secondary)]'
      };
    };

    const config = getStatusConfig(opp.status);

    return (
      <tr className={`group border-b border-[var(--border-color)] transition-colors ${config.rowClass}`}>
        
        <td
          style={{ width: columnWidths.action }}
          className="px-4 py-3 sticky left-0 z-20 bg-inherit border-r border-b border-[var(--border-color)] transition-colors"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] border-l-[3px] ${config.border} transition-colors`} />
          <button
            onClick={(e) => onOpenMenu(e, opp)}
            className="h-8 w-full flex items-center justify-center rounded hover:bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
        </td>

        <td
          style={{
            width: columnWidths.description,
            left: columnWidths.action
          }}
          className="px-4 py-3 sticky z-10 bg-inherit border-r border-b border-[var(--border-color)] transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.05)]"
        >
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: columnWidths.description - 32 }}
          >
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {opp.description}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
              {opp.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)] whitespace-nowrap">
            {opp.technicalSalesGroup || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)] whitespace-nowrap">
            {opp.utility || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)] whitespace-nowrap">
            {opp.kam || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)] whitespace-nowrap">
            {opp.product || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          {opp.status ? (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.pillBg} ${config.pillText} whitespace-nowrap`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              <span className="text-xs font-medium">
                {opp.status}
              </span>
            </div>
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">-</span>
          )}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
            {opp.businessStages || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <span className={`text-sm whitespace-nowrap font-medium ${(opp.priority === 'Alta' || opp.priority === 'Crítica') ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
            {opp.priority || '-'}
          </span>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full bg-[var(--text-primary)]"
                style={{ width: `${opp.progress || 0}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-secondary)] font-mono w-8">
              {opp.progress || 0}%
            </span>
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] font-mono whitespace-nowrap">
          {opp.quantity || '0'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] font-mono whitespace-nowrap">
          {opp.scp || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <div className="flex justify-center">
            {opp.homologated ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <X size={16} className="text-[var(--border-color)]" />
            )}
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-primary)] whitespace-nowrap">
          {opp.country || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-primary)] whitespace-nowrap">
          {opp.ecosystem || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {opp.yearStart || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {opp.yearEnd || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {opp.hqInterface || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <div className="max-w-[200px] truncate text-sm text-[var(--text-secondary)]" title={opp.reasonWinLoss}>
            {opp.reasonWinLoss || '-'}
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] max-w-[150px] truncate" title={opp.competitors}>
          {opp.competitors || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {opp.productTeam || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] whitespace-nowrap">
          {opp.salesManagement || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-sm font-mono text-[var(--text-secondary)] whitespace-nowrap">
          {opp.lastCustomerDiscussion || '-'}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] text-center">
          {opp.files ? (
            <a
              href={opp.files}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded hover:bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          ) : (
            <span className="text-[var(--border-color)]">-</span>
          )}
        </td>
      </tr>
    );
  }
);