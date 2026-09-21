import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { WidgetConfig, PageInstanceCustomization } from 'shared/types';

export const usePageCustomization = (pageId: string) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: 'w1', type: 'metrics', title: 'Métricas Principais', order: 0, width: 'full' },
    { id: 'w2', type: 'chart', title: 'Gráfico de Atividade', order: 1, width: 'half' },
    { id: 'w3', type: 'tasks', title: 'Tarefas Atribuídas', order: 2, width: 'half' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser || !pageId) return;
    const uid = auth.currentUser.uid;
    const docId = `${pageId}_${uid}`;
    const docRef = doc(db, 'pageCustomizations', docId);

    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as PageInstanceCustomization;
        if (data.widgets) {
          setWidgets(data.widgets);
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [pageId]);

  const saveCustomization = async (newWidgets: WidgetConfig[]) => {
    if (!auth.currentUser || !pageId) return;
    const uid = auth.currentUser.uid;
    const docId = `${pageId}_${uid}`;
    const docRef = doc(db, 'pageCustomizations', docId);

    setWidgets(newWidgets);
    await setDoc(docRef, {
      pageId,
      userId: uid,
      workspaceId: 'default',
      widgets: newWidgets,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  const addWidget = async (type: WidgetConfig['type'], title: string) => {
    const newWidget: WidgetConfig = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      order: widgets.length,
      width: 'half',
    };
    await saveCustomization([...widgets, newWidget]);
  };

  const removeWidget = async (id: string) => {
    const updated = widgets.filter(w => w.id !== id);
    await saveCustomization(updated);
  };

  return {
    widgets,
    loading,
    addWidget,
    removeWidget,
    saveCustomization,
  };
};
