import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Lock, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Page } from '../../types';

interface TodoHeaderProps {
  pageId: string;
  page: Page;
  boardTitle: string;
  setBoardTitle: (s: string) => void;
  updatePage: (id: string, updates: any) => Promise<void>;
  viewMode: 'board' | 'list';
  setViewMode: (m: 'board' | 'list') => void;
  t: any;
}

export const TodoHeader: React.FC<TodoHeaderProps> = ({
  pageId,
  page,
  boardTitle,
  setBoardTitle,
  updatePage,
  viewMode,
  setViewMode,
  t,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shrink-0 px-2 pt-6 mx-2 md:mx-8 relative z-10"
      data-lenis-prevent
    >
      <div className="flex items-center gap-4 flex-1 w-full">
        <button
          onClick={() => navigate('/todo')}
          className="p-3 hover:bg-[var(--card-bg)] rounded-xl transition-all border border-transparent hover:border-[var(--border-color)] text-[var(--text-primary)] shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <input
          className="text-3xl md:text-5xl font-black bg-transparent border-none outline-none w-full text-[var(--text-primary)] italic uppercase tracking-tighter"
          value={boardTitle}
          onChange={(e) => {
            setBoardTitle(e.target.value);
            updatePage(pageId, { title: e.target.value });
          }}
          placeholder={t.todoPage.defaults.untitled}
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => updatePage(pageId, { isPublic: !page.isPublic })}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 md:flex-none ${
            page.isPublic
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500/20'
          }`}
        >
          {page.isPublic ? <Globe size={14} /> : <Lock size={14} />}
          {page.isPublic ? t.todoPage.ui.public : t.todoPage.ui.private}
        </button>

        <div className="flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'board'
                ? 'bg-[var(--bg-app)] text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-[var(--bg-app)] text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
