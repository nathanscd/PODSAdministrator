import { useState, useEffect } from 'react';

const API_GET = 'SUA_URL_DO_POWER_AUTOMATE_GET';
const API_POST = 'SUA_URL_DO_POWER_AUTOMATE_POST';
const API_DELETE = 'SUA_URL_DO_POWER_AUTOMATE_DELETE';
const API_UPDATE = 'SUA_URL_DO_POWER_AUTOMATE_UPDATE';

export const useSampleControl = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [search, setSearch] = useState('');
  const [filterSt, setFilterSt] = useState('Todos');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<any[] | null>(null);

  const calculateDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateElapsedDays = (createdAt: string) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const today = new Date();
    const diff = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const checkDeadlineNotifications = (data: any[]) => {
    const urgentItems = data.filter((s) => {
      if (s.Status === 'Enviado') return false;
      const daysRemaining = calculateDaysRemaining(s.Deadline);
      return daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;
    });
    if (urgentItems.length > 0) {
      setNotificationData(urgentItems);
      setShowNotification(true);
    }
  };

  useEffect(() => {
    fetch(API_GET)
      .then((r) => {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then((d) => {
        const data = Array.isArray(d) ? d : [];
        setItems(data);
        checkDeadlineNotifications(data);
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAdd = async (item: any) => {
    setSubmitting(true);
    try {
      const r = await fetch(API_POST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!r.ok) throw 0;
      setItems((p) => [item, ...p]);
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async () => {
    if (!editData.Modelo || !editData.Cliente || !editData.Deadline) return false;
    setSubmitting(true);
    try {
      const r = await fetch(API_UPDATE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!r.ok) throw 0;
      setItems((p) => p.map((s) => (s.id === editingId ? editData : s)));
      setEditingId(null);
      setEditData({});
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const quickChangeStatus = async (id: string, newStatus: string) => {
    try {
      const item = items.find((s) => s.id === id);
      if (!item) return;
      const updated = { ...item, Status: newStatus };
      const r = await fetch(API_UPDATE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!r.ok) throw 0;
      setItems((p) => p.map((s) => (s.id === id ? updated : s)));
    } catch {}
  };

  const removeItem = async (id: string) => {
    setDeletingId(id);
    try {
      const r = await fetch(API_DELETE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw 0;
      setItems((p) => p.filter((s) => s.id !== id));
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter((s) => {
    const q = search.toLowerCase();
    const mS =
      !q ||
      [s.Modelo, s.Cliente, s.Concessionária].some((v) =>
        v?.toLowerCase().includes(q)
      );
    const mF = filterSt === 'Todos' || s.Status === filterSt;
    return mS && mF;
  });

  const counts = {
    total: items.length,
    pendente: items.filter((s) => s.Status === 'Pendente').length,
    atrasado: items.filter((s) => s.Status === 'Atrasado').length,
    enviado: items.filter((s) => s.Status === 'Enviado').length,
  };

  return {
    items,
    isLoading,
    submitting,
    deletingId,
    editingId,
    setEditingId,
    editData,
    setEditData,
    search,
    setSearch,
    filterSt,
    setFilterSt,
    showNotification,
    setShowNotification,
    notificationData,
    filteredItems,
    counts,
    handleAdd,
    saveEdit,
    quickChangeStatus,
    removeItem,
    calculateDaysRemaining,
    calculateElapsedDays,
  };
};
