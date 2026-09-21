import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePages } from '../hooks/usePages';
import { useLang } from '../contexts/LangContext';
import { logAction } from '../utils/systemLogger';
import { sendNotification } from '../utils/notificationSystem';

export const useDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, userDisplayName } = usePages();
  const { t } = useLang();

  const [hasUnread, setHasUnread] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<{ id: string; name: string }[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    opportunities: '...',
    users: '...',
    pages: '...',
  });

  // Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false),
      limit(1)
    );
    return onSnapshot(q, (snap) => setHasUnread(!snap.empty));
  }, [user]);

  // Users List
  useEffect(() => {
    return onSnapshot(collection(db, 'users'), (s) => {
      setUsersList(
        s.docs.map((d) => ({
          id: d.id,
          name: d.data().displayName || d.data().name || 'Sem nome',
        }))
      );
    });
  }, []);

  // Daily Goals
  useEffect(() => {
    const q = query(collection(db, 'daily_goals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGoals(
        data.sort((a: any, b: any) => Number(a.completed) - Number(b.completed))
      );
    });
  }, []);

  // System Logs
  useEffect(() => {
    const q = query(
      collection(db, 'system_logs'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snap) =>
      setRecentLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // Stats
  useEffect(() => {
    (async () => {
      try {
        const [opp, usr, pg] = await Promise.all([
          getCountFromServer(collection(db, 'opportunities')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'pages')),
        ]);
        setStatsData({
          opportunities: opp.data().count.toString(),
          users: usr.data().count.toString(),
          pages: pg.data().count.toString(),
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const addGoal = async (text: string, userId: string) => {
    if (!text.trim()) return false;
    const assignedUser = usersList.find((u) => u.id === userId);
    try {
      await addDoc(collection(db, 'daily_goals'), {
        text,
        completed: false,
        createdBy: user?.uid,
        createdByName: userDisplayName,
        assignedTo: userId || null,
        assignedName: assignedUser?.name || null,
        createdAt: serverTimestamp(),
      });
      if (userId && userId !== user?.uid) {
        await sendNotification(
          userId,
          'Nova Meta Diária',
          `${userDisplayName} adicionou uma meta rápida para você: "${text}"`,
          'assignment',
          '/'
        );
      }
      await logAction('Criou Meta', text);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleGoal = async (goal: any) => {
    await updateDoc(doc(db, 'daily_goals', goal.id), { completed: !goal.completed });
    if (!goal.completed) await logAction('Concluiu Meta', goal.text);
  };

  const deleteGoal = async (id: string, text: string) => {
    await deleteDoc(doc(db, 'daily_goals', id));
    await logAction('Removeu Meta', text);
  };

  const chartDataStats = useMemo(
    () => [
      { name: t.opportunities || 'Opps', value: Number(statsData.opportunities) || 0 },
      { name: t.pages_initial || 'Pages', value: Number(statsData.pages) || 0 },
      { name: t.totalUsers || 'Users', value: Number(statsData.users) || 0 },
    ],
    [statsData, t]
  );

  const goalsChartData = useMemo(() => {
    const done = goals.filter((g) => g.completed).length;
    return [
      { name: 'Concluídas', value: done },
      { name: 'Pendentes', value: goals.length - done },
    ];
  }, [goals]);

  return {
    isAdmin,
    userDisplayName,
    hasUnread,
    goals,
    usersList,
    recentLogs,
    statsData,
    addGoal,
    toggleGoal,
    deleteGoal,
    chartDataStats,
    goalsChartData,
    t,
  };
};
