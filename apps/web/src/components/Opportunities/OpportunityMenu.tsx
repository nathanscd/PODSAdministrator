import React from 'react';
import { Edit3, ListTodo, BookOpen, Trash2 } from 'lucide-react';
import { Opportunity } from '../../types';
import { useNavigate } from 'react-router-dom';

interface OpportunityMenuProps {
  x: number;
  y: number;
  opp: Opportunity;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
  onOpenNotes: (opp: Opportunity) => void;
  onClose: () => void;
  t: any;
}

export const OpportunityMenu: React.FC<OpportunityMenuProps> = ({
  x,
  y,
  opp,
  onEdit,
  onDelete,
  onOpenNotes,
  onClose,
  t,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed z-[9999] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1.5 w-56 animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: Math.min(y, window.innerHeight - 250),
        left: Math.min(x, window.innerWidth - 240),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
        <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
          {opp.id.slice(0, 8).toUpperCase()} - {opp.utility || "Opportunity"}
        </p>
      </div>

      <button
        onClick={() => {
          onEdit(opp);
          onClose();
        }}
        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-[var(--bg-app)] transition-colors text-sm font-medium text-[var(--text-primary)]"
      >
        <Edit3 size={15} className="text-[var(--text-secondary)]" /> 
        <span>{t.opp.menu.edit}</span>
      </button>

      <button
        onClick={() => {
          navigate('/task-tracker');
          onClose();
        }}
        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-[var(--bg-app)] transition-colors text-sm font-medium text-[var(--text-primary)]"
      >
        <ListTodo size={15} className="text-[var(--text-secondary)]" /> 
        <span>{t.opp.menu.taskTrackers}</span>
      </button>

      <button
        onClick={() => {
          onOpenNotes(opp);
          onClose();
        }}
        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-[var(--bg-app)] transition-colors text-sm font-medium text-[var(--text-primary)]"
      >
        <BookOpen size={15} className="text-[var(--text-secondary)]" /> 
        <span>{t.opp.menu.openNotes}</span>
      </button>

      <div className="h-px bg-[var(--border-color)] my-1 mx-2" />

      <button
        onClick={() => {
          onDelete(opp.id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-red-500/10 text-red-500 transition-colors text-sm font-medium"
      >
        <Trash2 size={15} /> 
        <span>{t.opp.menu.delete}</span>
      </button>
    </div>
  );
};