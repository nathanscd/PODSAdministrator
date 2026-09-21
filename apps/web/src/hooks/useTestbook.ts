import { useState, useCallback, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Testbook, TestbookModule } from '../types';

export const useTestbook = () => {
  const [testbooks, setTestbooks] = useState<Testbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Fetch all testbooks (user's own + public)
  const fetchTestbooks = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const testbooksRef = collection(db, 'testbooks');

      // Query for user's own testbooks or public ones
      const querySnapshot = await getDocs(testbooksRef);
      const books: Testbook[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Include if it's user's own or if it's public
        if (data.ownerId === userId || data.isPublic) {
          books.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Testbook);
        }
      });

      setTestbooks(books.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar testbooks';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Create a new testbook
  const createTestbook = useCallback(
    async (
      title: string,
      description: string,
      modules: TestbookModule[],
      userId: string,
      userName: string,
      color: string = 'text-blue-500',
      icon: string = 'Book',
      isPublic: boolean = true
    ): Promise<string | null> => {
      try {
        const testbooksRef = collection(db, 'testbooks');
        const newTestbook = {
          title,
          description,
          modules,
          version: '1.0.0',
          color,
          icon,
          isCustom: true,
          ownerId: userId,
          ownerName: userName,
          isPublic,
          sharedWith: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(testbooksRef, newTestbook);
        addToast('Testbook criado com sucesso!', 'success');
        await fetchTestbooks(userId);
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar testbook';
        addToast(message, 'error');
        return null;
      }
    },
    [addToast, fetchTestbooks]
  );

  // Update testbook
  const updateTestbook = useCallback(
    async (testbookId: string, updates: Partial<Testbook>, userId: string) => {
      try {
        const testbookRef = doc(db, 'testbooks', testbookId);
        await updateDoc(testbookRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
        addToast('Testbook atualizado com sucesso!', 'success');
        await fetchTestbooks(userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar testbook';
        addToast(message, 'error');
      }
    },
    [addToast, fetchTestbooks]
  );

  // Delete testbook
  const deleteTestbook = useCallback(
    async (testbookId: string, userId: string) => {
      try {
        const testbookRef = doc(db, 'testbooks', testbookId);
        await deleteDoc(testbookRef);
        addToast('Testbook deletado com sucesso!', 'success');
        await fetchTestbooks(userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao deletar testbook';
        addToast(message, 'error');
      }
    },
    [addToast, fetchTestbooks]
  );

  // Share testbook with users
  const shareTestbook = useCallback(
    async (testbookId: string, userEmails: string[], userId: string) => {
      try {
        const testbookRef = doc(db, 'testbooks', testbookId);
        const currentTestbook = testbooks.find((t) => t.id === testbookId);

        if (!currentTestbook) throw new Error('Testbook não encontrado');

        const sharedWith = [...new Set([...(currentTestbook.sharedWith || []), ...userEmails])];

        await updateDoc(testbookRef, {
          sharedWith,
          updatedAt: Timestamp.now(),
        });

        addToast('Testbook compartilhado com sucesso!', 'success');
        await fetchTestbooks(userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao compartilhar testbook';
        addToast(message, 'error');
      }
    },
    [testbooks, addToast, fetchTestbooks]
  );

  // Duplicate testbook
  const duplicateTestbook = useCallback(
    async (testbookId: string, userId: string, userName: string) => {
      try {
        const original = testbooks.find((t) => t.id === testbookId);
        if (!original) throw new Error('Testbook não encontrado');

        const newId = await createTestbook(
          `${original.title} (Cópia)`,
          original.description,
          original.modules,
          userId,
          userName,
          original.color,
          original.icon,
          original.isPublic
        );

        return newId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao duplicar testbook';
        addToast(message, 'error');
        return null;
      }
    },
    [testbooks, createTestbook, addToast]
  );

  // Toggle public/private
  const togglePublic = useCallback(
    async (testbookId: string, userId: string) => {
      try {
        const testbook = testbooks.find((t) => t.id === testbookId);
        if (!testbook) throw new Error('Testbook não encontrado');

        await updateTestbook(testbookId, { isPublic: !testbook.isPublic }, userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao mudar visibilidade';
        addToast(message, 'error');
      }
    },
    [testbooks, updateTestbook, addToast]
  );

  return {
    testbooks,
    loading,
    error,
    fetchTestbooks,
    createTestbook,
    updateTestbook,
    deleteTestbook,
    shareTestbook,
    duplicateTestbook,
    togglePublic,
  };
};
