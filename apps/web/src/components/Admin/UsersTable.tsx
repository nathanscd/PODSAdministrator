import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { UserData } from '../../hooks/useAdminUsers';

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)]">
              <th className="p-6">User Identity</th>
              <th className="p-6">Role (Access)</th>
              <th className="p-6">Assigned Group</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[var(--border-color)] hover:bg-white/5 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-bold uppercase shadow-lg">
                      {u.displayName?.charAt(0) || u.email?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">
                        {u.displayName || 'Sem Nome'}
                      </p>
                      <p className="opacity-50 text-[10px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      u.role === 'admin'
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        : 'bg-white/5 border-white/10 text-[var(--text-secondary)]'
                    }`}
                  >
                    {u.role || 'User'}
                  </span>
                </td>
                <td className="p-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-2 w-fit ${
                      u.technicalSalesGroup && u.technicalSalesGroup !== 'Unassigned'
                        ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20 text-[var(--accent-color)]'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {u.technicalSalesGroup || 'Unassigned'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(u)}
                      className="p-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-color)] text-[var(--text-primary)] transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(u.id)}
                      className="p-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg hover:border-red-500 text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
