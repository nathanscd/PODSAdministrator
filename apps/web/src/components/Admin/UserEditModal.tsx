import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { UserData } from '../../hooks/useAdminUsers';

const TECHNICAL_GROUPS = [
  'Unassigned',
  '1st Group',
  '2nd Group',
  '3rd Group',
  'HQ Interface',
  'Sales Management',
];

interface UserEditModalProps {
  user: UserData;
  onClose: () => void;
  onSave: (id: string, updates: Partial<UserData>) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [role, setRole] = useState(user.role || 'user');
  const [group, setGroup] = useState(user.technicalSalesGroup || 'Unassigned');

  const handleSave = async () => {
    await onSave(user.id, { role, technicalSalesGroup: group });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)]">
              Edit Access
            </h3>
            <p className="text-[10px] uppercase font-bold opacity-50">{user.email}</p>
          </div>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer">
            <X className="text-[var(--text-secondary)] hover:text-white" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="group">
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
              System Role
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setRole('user')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  role === 'user'
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-500 border-gray-700'
                }`}
              >
                USER
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                    : 'bg-transparent text-gray-500 border-gray-700'
                }`}
              >
                ADMIN
              </button>
            </div>
          </div>
          <div className="group">
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
              Technical Sales Group
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-[var(--accent-color)] text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer"
            >
              {TECHNICAL_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs uppercase hover:bg-white/5 border-none cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs uppercase hover:scale-105 transition-transform flex justify-center items-center gap-2 border-none cursor-pointer"
          >
            <CheckCircle2 size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
