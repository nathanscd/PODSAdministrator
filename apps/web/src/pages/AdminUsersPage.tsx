'use client';

import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import { useAdminUsers, UserData } from '../hooks/useAdminUsers';
import { SystemUpdateForm } from '../components/Admin/SystemUpdateForm';
import { UsersTable } from '../components/Admin/UsersTable';
import { UserEditModal } from '../components/Admin/UserEditModal';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  const {
    search,
    setSearch,
    isSendingUpdate,
    handleLaunchUpdate,
    updateUser,
    deleteUser,
    filteredUsers,
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-16 ml-10 -mr-10 -mt-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              Admin Console
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              User Management & Access Control
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-3 rounded-2xl border border-[var(--border-color)]">
            <Search size={16} className="opacity-20 text-[var(--text-primary)]" />
            <input
              placeholder="SEARCH USERS..."
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-48 text-[var(--text-primary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <SystemUpdateForm
            isSendingUpdate={isSendingUpdate}
            handleLaunchUpdate={handleLaunchUpdate}
          />

          <UsersTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={deleteUser}
          />
        </div>

        {isModalOpen && editingUser && (
          <UserEditModal
            user={editingUser}
            onClose={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}
            onSave={updateUser}
          />
        )}
      </div>
    </PageTransition>
  );
}