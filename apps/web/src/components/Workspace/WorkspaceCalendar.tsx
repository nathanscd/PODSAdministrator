import React from 'react';
import {
  Calendar as CalendarIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User as UserIcon,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { CalendarEvent } from '../../types';
import { motion } from 'framer-motion';

interface WorkspaceCalendarProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  year: number;
  month: number;
  blanks: number[];
  days: number[];
  getEventsForDay: (d: number) => CalendarEvent[];
  isToday: (d: number) => boolean;
  onDayClick: (d: number) => void;
  onNewEvent: () => void;
  onEditEvent: (e: CalendarEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
  isAdmin: boolean;
  currentUserUid?: string;
  t: any;
}

export const WorkspaceCalendar: React.FC<WorkspaceCalendarProps> = ({
  currentDate,
  setCurrentDate,
  year,
  month,
  blanks,
  days,
  getEventsForDay,
  isToday,
  onDayClick,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
  isAdmin,
  currentUserUid,
  t,
}) => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">
            <CalendarIcon size={12} /> {t.workspace.labels.schedule}
          </span>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="flex items-center gap-2 border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 p-1">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="cursor-pointer p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <RotateCcw size={14} />
          </button>
          <div className="h-5 w-px bg-[var(--border-color)]/70" />
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="cursor-pointer p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="cursor-pointer p-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]/70">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="relative z-10 mb-6 grid grid-cols-7 gap-2">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-10" />
        ))}
        {days.map((d) => {
          const evs = getEventsForDay(d);
          const selected = currentDate.getDate() === d;
          const today = isToday(d);
          return (
            <div
              key={d}
              onClick={() => onDayClick(d)}
              className={`relative flex h-11 cursor-pointer flex-col items-center justify-center overflow-hidden text-[11px] font-semibold transition-all ${
                evs.length
                  ? 'border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 text-[var(--text-primary)]'
                  : 'border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]/70 hover:bg-[var(--accent-color)]/5'
              } ${
                today ? 'border-[var(--accent-color)]/50 text-[var(--accent-color)]' : ''
              } ${
                selected
                  ? '!border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--bg-app)] shadow-[0_8px_18px_rgba(0,0,0,0.12)]'
                  : ''
              }`}
            >
              <div className="relative z-10">{d}</div>
              {evs.length > 0 && (
                <div
                  className={`relative z-10 mt-1 h-1.5 w-1.5 rounded-full ${
                    selected ? 'bg-[var(--bg-app)]' : 'bg-[var(--accent-color)]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto border border-[var(--border-color)]/70 bg-[var(--bg-app)]/70 p-5">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)]/70 pb-4">
          <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
            <Clock size={12} className="text-[var(--accent-color)]" />
            {currentDate.getDate()} {currentDate.toLocaleString('en-US', { month: 'short' })}
          </h4>
          <button
            onClick={onNewEvent}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 text-[var(--text-secondary)] transition-all hover:border-[var(--accent-color)]/40 hover:text-[var(--accent-color)]"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {getEventsForDay(currentDate.getDate()).map((e) => (
            <div
              key={e.id}
              className="group relative flex flex-col overflow-hidden border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 p-4 transition-all hover:border-[var(--accent-color)]/30"
            >
              <div className="relative mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      e.type === 'tracker' ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-secondary)]'
                    }`}
                  />
                  <p
                    className="cursor-pointer text-sm font-semibold leading-tight text-[var(--text-primary)] transition-colors hover:text-[var(--accent-color)]"
                    onClick={() => e.type === 'personal' && onEditEvent(e)}
                  >
                    {e.title}
                  </p>
                </div>

                {(isAdmin || e.ownerId === currentUserUid) &&
                  e.type === 'personal' && (
                    <div className="flex translate-x-2 gap-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEditEvent(e);
                        }}
                        className="cursor-pointer border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 p-1.5 text-[var(--text-secondary)] transition-all hover:bg-[var(--accent-color)]/10 hover:text-[var(--accent-color)]"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onDeleteEvent(e.id, e.title);
                        }}
                        className="cursor-pointer border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 p-1.5 text-[var(--text-secondary)] transition-all hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
              </div>

              <div className="relative mt-1 flex flex-wrap items-center gap-2">
                {e.time && (
                  <span className="flex items-center gap-1.5 border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    <Clock size={10} className="text-[var(--accent-color)]" /> {e.time}
                  </span>
                )}
                {e.assignedName && (
                  <span className="flex items-center gap-1.5 border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    <UserIcon size={10} /> {e.assignedName.split(' ')[0]}
                  </span>
                )}
              </div>

              {e.description && (
                <p className="relative mt-3 text-xs font-medium leading-5 text-[var(--text-secondary)]/80">
                  {e.description}
                </p>
              )}

              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noreferrer"
                  className="relative mt-4 flex w-full items-center justify-center gap-2 border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-color)] transition-all hover:bg-[var(--accent-color)] hover:text-[var(--bg-app)]"
                >
                  {t.workspace.labels.link} <ExternalLink size={10} />
                </a>
              )}
            </div>
          ))}
          {getEventsForDay(currentDate.getDate()).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-60">
              <div className="mb-5 flex h-14 w-14 items-center justify-center border border-[var(--border-color)]/70 bg-[var(--bg-app)]/80">
                <CalendarIcon size={26} className="text-[var(--text-secondary)]" />
              </div>
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                {t.workspace.messages.noEvents}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
