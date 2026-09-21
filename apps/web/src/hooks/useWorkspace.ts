import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Opportunity, TaskTracker, CalendarEvent, QuickTask } from '../types';
import { useLang } from '../contexts/LangContext';
import { logAction } from '../utils/systemLogger';
import { sendNotification } from '../utils/notificationSystem';

export const useWorkspace = () => {
  const { user, userGroup, isAdmin } = useAuth();
  const { addToast } = useToast();
  const { t } = useLang();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myTrackers, setMyTrackers] = useState<TaskTracker[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<
    { task: any; pageId: string; pageTitle: string }[]
  >([]);
  const [usersList, setUsersList] = useState<{ id: string; name: string }[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLink, setNewEventLink] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [selectedUserForEvent, setSelectedUserForEvent] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [newTaskInput, setNewTaskInput] = useState('');
  const [selectedUserForTask, setSelectedUserForTask] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (s) => {
      setUsersList(
        s.docs.map((d) => ({
          id: d.id,
          name: d.data().displayName || d.data().name || t.workspace.status.unknown,
        }))
      );
    });
    return unsub;
  }, [t]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myUid = auth.currentUser.uid;

    const qOpps = isAdmin
      ? query(collection(db, 'opportunities'))
      : query(
          collection(db, 'opportunities'),
          where('technicalSalesGroup', '==', userGroup || 'Unassigned')
        );

    const unsubOpps = onSnapshot(qOpps, (s) => {
      setOpportunities(
        s.docs.map((d) => ({ id: d.id, ...d.data() } as Opportunity))
      );
    });

    const unsubTrackers = onSnapshot(collection(db, 'taskTrackers'), (s) => {
      setMyTrackers(
        s.docs.map((d) => ({ id: d.id, ...d.data() } as TaskTracker))
      );
    });

    const unsubPages = onSnapshot(collection(db, 'pages'), (snapshot) => {
      const tasks: any[] = [];
      snapshot.docs.forEach((doc) => {
        const page = doc.data();
        if (page.type === 'board' || page.type === 'kanban' || !page.type) {
          if (page.tasks) {
            Object.values(page.tasks).forEach((task: any) => {
              if (task.assignedTo === myUid && task.status !== 'done') {
                tasks.push({
                  task: task,
                  pageId: doc.id,
                  pageTitle: page.title,
                });
              }
            });
          }
        }
      });
      setMyAssignedTasks(tasks);
    });

    let unsubEvs: () => void;

    if (isAdmin) {
      const qAllEvs = query(collection(db, 'personalEvents'));
      unsubEvs = onSnapshot(qAllEvs, (s) => {
        setPersonalEvents(
          s.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent))
        );
      });
    } else {
      const qEvs = query(
        collection(db, 'personalEvents'),
        where('ownerId', '==', myUid)
      );
      const qAssignedEvs = query(
        collection(db, 'personalEvents'),
        where('assignedTo', '==', myUid)
      );

      const unsub1 = onSnapshot(qEvs, (s1) => {
        const own = s1.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CalendarEvent)
        );
        const unsub2 = onSnapshot(qAssignedEvs, (s2) => {
          const ass = s2.docs.map(
            (d) => ({ id: d.id, ...d.data() } as CalendarEvent)
          );
          const merged = Array.from(
            new Map([...own, ...ass].map((e) => [e.id, e])).values()
          );
          setPersonalEvents(merged);
        });
        return unsub2;
      });
      unsubEvs = unsub1;
    }

    const qTasks = query(
      collection(db, 'quickTasks'),
      where('ownerId', '==', myUid),
      orderBy('createdAt', 'desc')
    );
    const qAssignedTasks = query(
      collection(db, 'quickTasks'),
      where('assignedTo', '==', myUid),
      orderBy('createdAt', 'desc')
    );

    const unsubTasks = onSnapshot(qTasks, (s1) => {
      const own = s1.docs.map((d) => ({ id: d.id, ...d.data() } as QuickTask));
      onSnapshot(qAssignedTasks, (s2) => {
        const ass = s2.docs.map((d) => ({ id: d.id, ...d.data() } as QuickTask));
        const merged = Array.from(
          new Map([...own, ...ass].map((t) => [t.id, t])).values()
        );
        merged.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setQuickTasks(merged);
      });
    });

    return () => {
      unsubOpps();
      unsubTrackers();
      if (unsubEvs) unsubEvs();
      unsubTasks();
      unsubPages();
    };
  }, [user, isAdmin, userGroup]);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setCurrentDate(clickedDate);
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventLink('');
    setNewEventTime('09:00');
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    setNewEventDate(`${yyyy}-${mm}-${dd}`);
    setSelectedUserForEvent('');
    setIsEventModalOpen(true);
  };

  const openEditModal = (e: CalendarEvent) => {
    setEditingEvent(e);
    setNewEventTitle(e.title);
    setNewEventDesc(e.description || '');
    setNewEventLink(e.link || '');
    setNewEventDate(e.date);
    setNewEventTime(e.time || '');
    setSelectedUserForEvent(e.assignedTo || '');
    setIsEventModalOpen(true);
  };

  const deleteEvent = async (id: string, title: string) => {
    if (
      !window.confirm(
        t.workspace.messages.deletePrompt.replace('{title}', title)
      )
    )
      return;
    try {
      await deleteDoc(doc(db, 'personalEvents', id));
      addToast(t.workspace.messages.eventRemoved, 'info');
      logAction('Deleted Event', title);
    } catch (e) {
      addToast(t.workspace.messages.eventError, 'error');
    }
  };

  const saveEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate || !auth.currentUser) {
      addToast('Título e Data são obrigatórios', 'error');
      return;
    }

    const assignedUser = usersList.find((u) => u.id === selectedUserForEvent);

    const data = {
      title: newEventTitle,
      description: newEventDesc,
      link: newEventLink || '',
      date: newEventDate,
      time: newEventTime,
      assignedTo: selectedUserForEvent || null,
      assignedName: assignedUser?.name || null,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingEvent) {
        await updateDoc(doc(db, 'personalEvents', editingEvent.id), data);
        addToast(t.workspace.messages.eventUpdated, 'success');
      } else {
        await addDoc(collection(db, 'personalEvents'), {
          ...data,
          type: 'personal',
          ownerId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });

        if (selectedUserForEvent && selectedUserForEvent !== auth.currentUser.uid) {
          await sendNotification(
            selectedUserForEvent,
            t.workspace.messages.notificationNewEvent,
            t.workspace.messages.notificationBodyEvent
              .replace('{user}', user?.displayName || '')
              .replace('{title}', newEventTitle),
            'assignment',
            '/workspace'
          );
        }
        addToast(t.workspace.messages.eventScheduled, 'success');
      }
      setIsEventModalOpen(false);
    } catch (e) {
      addToast(t.workspace.messages.eventError, 'error');
    }
  };

  const addFastTask = async () => {
    if (!newTaskInput.trim() || !auth.currentUser) return;
    const assignedUser = usersList.find((u) => u.id === selectedUserForTask);
    try {
      await addDoc(collection(db, 'quickTasks'), {
        text: newTaskInput,
        ownerId: auth.currentUser.uid,
        assignedTo: selectedUserForTask || null,
        assignedName: assignedUser?.name || null,
        createdAt: serverTimestamp(),
      });
      if (selectedUserForTask && selectedUserForTask !== auth.currentUser.uid) {
        await sendNotification(
          selectedUserForTask,
          t.workspace.messages.notificationNewTask,
          t.workspace.messages.notificationBodyTask
            .replace('{user}', user?.displayName || '')
            .replace('{task}', newTaskInput),
          'assignment',
          '/workspace'
        );
      }
      setNewTaskInput('');
      setSelectedUserForTask('');
      addToast(t.workspace.messages.taskAdded, 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFastTask = async (id: string) => {
    await deleteDoc(doc(db, 'quickTasks', id));
    addToast(t.workspace.messages.taskCompleted, 'success');
  };

  const { blanks, days, year, month } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    return {
      blanks: Array.from({ length: first }, (_, i) => i),
      days: Array.from({ length: total }, (_, i) => i + 1),
      year: y,
      month: m,
    };
  }, [currentDate]);

  const getEventsForDay = (d: number) => {
    const dateStr = new Date(year, month, d).toISOString().split('T')[0];
    const pEvs = personalEvents.filter((e) => e.date === dateStr);
    const tEvs: CalendarEvent[] = [];
    myTrackers.forEach((t) =>
      t.tasks?.forEach((tk) => {
        if (tk.plannedEndDate === dateStr) {
          tEvs.push({
            id: tk.id,
            title: tk.task,
            date: dateStr,
            type: 'tracker',
            ownerId: t.ownerId,
          });
        }
      })
    );
    return [...pEvs, ...tEvs].sort((a, b) =>
      (a.time || '23:59').localeCompare(b.time || '23:59')
    );
  };

  const statusChartData = useMemo(
    () =>
      [
        {
          name: t.workspace.chart.good,
          value: opportunities.filter((o) =>
            o.status?.toLowerCase().includes('good')
          ).length,
        },
        {
          name: t.workspace.chart.attention,
          value: opportunities.filter((o) =>
            o.status?.toLowerCase().includes('attention')
          ).length,
        },
        {
          name: t.workspace.chart.bad,
          value: opportunities.filter((o) =>
            o.status?.toLowerCase().includes('bad')
          ).length,
        },
      ].filter((d) => d.value > 0),
    [opportunities, t]
  );

  const utilityChartData = useMemo(() => {
    const c: Record<string, number> = {};
    opportunities.forEach((o) => {
      if (o.utility) c[o.utility] = (c[o.utility] || 0) + 1;
    });
    return Object.entries(c)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [opportunities]);

  const isToday = (d: number) => {
    const now = new Date();
    return (
      d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
    );
  };

  const nextEvent = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = personalEvents
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '00:00').localeCompare(b.time || '00:00');
      });
    return upcoming[0] || null;
  }, [personalEvents]);

  const metrics = useMemo(
    () => ({
      totalOpps: opportunities.length,
      activeTasks: quickTasks.length,
      assignedBoardTasks: myAssignedTasks.length,
    }),
    [opportunities, quickTasks, myAssignedTasks]
  );

  return {
    user,
    userGroup,
    isAdmin,
    opportunities,
    quickTasks,
    usersList,
    currentDate,
    setCurrentDate,
    isEventModalOpen,
    setIsEventModalOpen,
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
    editingEvent,
    newTaskInput,
    setNewTaskInput,
    selectedUserForTask,
    setSelectedUserForTask,
    statusChartData,
    utilityChartData,
    nextEvent,
    metrics,
    blanks,
    days,
    year,
    month,
    handleDayClick,
    openNewEventModal,
    openEditModal,
    deleteEvent,
    saveEvent,
    addFastTask,
    deleteFastTask,
    getEventsForDay,
    isToday,
    t,
  };
};
