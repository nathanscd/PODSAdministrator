import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface WorkspaceEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent: CalendarEvent | null;
  newEventTitle: string;
  setNewEventTitle: (val: string) => void;
  newEventDesc: string;
  setNewEventDesc: (val: string) => void;
  newEventLink: string;
  setNewEventLink: (val: string) => void;
  newEventDate: string;
  setNewEventDate: (val: string) => void;
  newEventTime: string;
  setNewEventTime: (val: string) => void;
  selectedUserForEvent: string;
  setSelectedUserForEvent: (val: string) => void;
  usersList: { id: string; name: string }[];
  onSave: () => void;
  t: any;
}

export const WorkspaceEventModal: React.FC<WorkspaceEventModalProps> = ({
  isOpen,
  onClose,
  editingEvent,
  newEventTitle,
  setNewEventTitle,
  newEventDesc,
  setNewEventDesc,
  newEventLink,
  setNewEventLink,
  newEventDate,
  setNewEventDate,
  newEventTime,
  setNewEventTime,
  selectedUserForEvent,
  setSelectedUserForEvent,
  usersList,
  onSave,
  t,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-start mb-8 shrink-0">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] flex items-center gap-2">
                  <CalendarIcon size={14} /> {t.workspace.labels.management}
                </span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
                  {editingEvent
                    ? t.workspace.headers.editEvent
                    : t.workspace.headers.newEvent}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors hover:bg-[var(--card-bg)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                  Title *
                </label>
                <input
                  autoFocus
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 rounded-2xl outline-none text-[var(--text-primary)] font-bold text-lg focus:border-[var(--accent-color)] transition-colors placeholder:text-[var(--text-secondary)]/50"
                  placeholder="Meeting with..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 rounded-2xl outline-none text-[var(--text-primary)] text-sm focus:border-[var(--accent-color)] transition-colors [color-scheme:dark]"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 rounded-2xl outline-none text-[var(--text-primary)] text-sm focus:border-[var(--accent-color)] transition-colors [color-scheme:dark]"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 rounded-2xl outline-none text-[var(--text-primary)] text-sm focus:border-[var(--accent-color)] transition-colors placeholder:text-[var(--text-secondary)]/50 resize-none"
                  placeholder="Details about the event..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                  {t.workspace.labels.meetingLink}
                </label>
                <div className="relative">
                  <LinkIcon
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  />
                  <input
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 pl-12 rounded-2xl outline-none text-[var(--text-primary)] text-sm focus:border-[var(--accent-color)] transition-colors placeholder:text-[var(--text-secondary)]/50"
                    placeholder="https://meet..."
                    value={newEventLink}
                    onChange={(e) => setNewEventLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">
                  {t.workspace.labels.assignTo}
                </label>
                <div className="relative">
                  <UserIcon
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  />
                  <select
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-5 pl-12 rounded-2xl outline-none text-[var(--text-primary)] text-xs font-black uppercase tracking-widest cursor-pointer appearance-none hover:border-[var(--accent-color)] transition-colors"
                    value={selectedUserForEvent}
                    onChange={(e) => setSelectedUserForEvent(e.target.value)}
                  >
                    <option value="">{t.workspace.labels.personalOnly}</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6 shrink-0 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl border border-[var(--border-color)] font-black text-[10px] uppercase tracking-widest text-[var(--text-primary)] cursor-pointer bg-transparent hover:bg-[var(--bg-app)] transition-colors"
              >
                {t.workspace.buttons.cancel}
              </button>
              <button
                onClick={onSave}
                className="flex-[2] py-4 px-8 rounded-2xl bg-[var(--accent-color)] text-white font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-[0_10px_30px_rgba(255,106,0,0.3)] hover:brightness-110 hover:-translate-y-1 transition-all"
              >
                {editingEvent
                  ? t.workspace.buttons.saveChanges
                  : t.workspace.buttons.scheduleEvent}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
