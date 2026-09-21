import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  role?: string;
  technicalSalesGroup?: string;
  photoURL?: string;
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserData))
      );
    });
    return unsub;
  }, []);

  const handleLaunchUpdate = async (version: string, changes: string) => {
    if (!version || !changes) {
      alert('Preencha a versão e as notas!');
      return;
    }

    setIsSendingUpdate(true);
    try {
      await addDoc(collection(db, 'system_updates'), {
        version,
        changes: changes.split('\n').filter((line) => line.trim() !== ''),
        launchedAt: serverTimestamp(),
        launchedBy: user?.displayName,
      });

      const batch = writeBatch(db);
      users.forEach((u) => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          recipientId: u.id,
          title: '🚀 Nova Atualização Disponível',
          message: `A versão ${version} chegou! Confira as novidades.`,
          type: 'system',
          read: false,
          link: '/changelog',
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();

      await updateDoc(doc(db, 'settings', 'system'), {
        currentVersion: version,
        updateChanges: changes.split('\n').filter((line) => line.trim() !== ''),
      });

      alert('Update lançado e notificações enviadas!');
    } catch (error) {
      console.error(error);
      alert('Erro ao lançar update.');
    } finally {
      setIsSendingUpdate(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar permissões.');
    }
  };

  const deleteUser = async (id: string) => {
    if (
      confirm(
        'Isso removerá os dados do usuário do banco de dados. Confirmar?'
      )
    ) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return {
    users,
    search,
    setSearch,
    isSendingUpdate,
    handleLaunchUpdate,
    updateUser,
    deleteUser,
    filteredUsers,
  };
};
