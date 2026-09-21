import { useState, useCallback } from 'react';
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
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { TestbookModuleContent, TestbookModule } from '../types';

export const useTestbookContent = () => {
  const [content, setContent] = useState<TestbookModuleContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Fetch content for a specific testbook
  const fetchTestbookContent = useCallback(async (testbookId: string) => {
    try {
      setLoading(true);
      const contentRef = collection(db, 'testbooks', testbookId, 'modules');
      const querySnapshot = await getDocs(contentRef);
      const moduleContent: TestbookModuleContent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        moduleContent.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as TestbookModuleContent);
      });

      setContent(moduleContent);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar conteúdo';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Get a specific module content
  const getModuleContent = useCallback(
    (moduleId: TestbookModule): TestbookModuleContent | undefined => {
      // Look for either moduleId or id field (for compatibility with migrated data)
      return content.find((c) => c.moduleId === moduleId || c.id === moduleId);
    },
    [content]
  );

  // Update module content
  const updateModuleContent = useCallback(
    async (
      testbookId: string,
      moduleId: TestbookModule,
      updates: Partial<TestbookModuleContent>,
      userId: string,
      userName: string
    ): Promise<boolean> => {
      try {
        const contentRef = collection(db, 'testbooks', testbookId, 'modules');
        
        // Find existing module content
        const q = query(contentRef, where('moduleId', '==', moduleId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Create new module content if it doesn't exist
          const newContent = {
            moduleId,
            testbookId,
            isGlobal: false,
            updatedBy: userId,
            updatedByName: userName,
            updatedAt: Timestamp.now(),
            ...updates,
          };

          const docRef = await addDoc(contentRef, newContent);
          addToast('Módulo criado com sucesso!', 'success');
          await fetchTestbookContent(testbookId);
          return true;
        } else {
          // Update existing module content
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(db, 'testbooks', testbookId, 'modules', docId);

          await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
            updatedBy: userId,
            updatedByName: userName,
          });

          addToast('Módulo atualizado com sucesso!', 'success');
          await fetchTestbookContent(testbookId);
          return true;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar módulo';
        addToast(message, 'error');
        return false;
      }
    },
    [addToast, fetchTestbookContent]
  );

  // Update global module (affects all testbooks using this module)
  const updateGlobalModule = useCallback(
    async (
      moduleId: TestbookModule,
      updates: Partial<TestbookModuleContent>,
      userId: string,
      userName: string
    ): Promise<boolean> => {
      try {
        // Query all testbooks that have this module
        const testbooksRef = collection(db, 'testbooks');
        const q = query(testbooksRef, where('modules', 'array-contains', moduleId));
        const testbooksSnapshot = await getDocs(q);

        // Update content in all those testbooks
        let updateCount = 0;
        for (const testbookDoc of testbooksSnapshot.docs) {
          const moduleContentRef = collection(db, 'testbooks', testbookDoc.id, 'modules');
          const moduleQuery = query(moduleContentRef, where('moduleId', '==', moduleId));
          const moduleSnapshot = await getDocs(moduleQuery);

          if (!moduleSnapshot.empty) {
            const docId = moduleSnapshot.docs[0].id;
            const docRef = doc(db, 'testbooks', testbookDoc.id, 'modules', docId);

            await updateDoc(docRef, {
              ...updates,
              isGlobal: true,
              updatedAt: Timestamp.now(),
              updatedBy: userId,
              updatedByName: userName,
            });
            updateCount++;
          } else {
            const newContent = {
              moduleId,
              testbookId: testbookDoc.id,
              isGlobal: true,
              updatedBy: userId,
              updatedByName: userName,
              updatedAt: Timestamp.now(),
              ...updates,
            };
            await addDoc(moduleContentRef, newContent);
            updateCount++;
          }
        }

        addToast(`Módulo global atualizado em ${updateCount} testbooks!`, 'success');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar módulo global';
        addToast(message, 'error');
        return false;
      }
    },
    [addToast]
  );

  return {
    content,
    loading,
    error,
    fetchTestbookContent,
    getModuleContent,
    updateModuleContent,
    updateGlobalModule,
  };
};
