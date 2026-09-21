import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { logAction } from '../utils/systemLogger';
import { Opportunity } from '../types';
import { useLang } from '../contexts/LangContext';
import { useNavigate } from 'react-router-dom';

export const useOpportunities = () => {
  const { isAdmin, userGroup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { t } = useLang();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [filterUtility, setFilterUtility] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = query(collection(db, 'opportunities'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Opportunity)
        );
        setOpportunities(data);
      },
      (error) => {
        console.error(error);
        addToast('Erro ao carregar oportunidades.', 'error');
      }
    );
    return unsubscribe;
  }, []);

  const uniqueUtilities = useMemo(
    () =>
      Array.from(new Set(opportunities.map((o) => o.utility)))
        .sort()
        .filter(Boolean),
    [opportunities]
  );

  const createOpportunity = async () => {
    if (!auth.currentUser) return alert(t.opp.messages.loginRequired);
    const assignedGroup = isAdmin ? '' : userGroup || t.opp.unassigned;

    const newOppData: Omit<Opportunity, 'id'> = {
      description: t.opp.newOpportunity,
      technicalSalesGroup: assignedGroup,
      utility: '',
      files: '',
      yearStart: new Date().getFullYear(),
      yearEnd: new Date().getFullYear() + 1,
      hqInterface: '',
      kam: '',
      status: 'Draft',
      product: '',
      priority: 'Média',
      businessStages: 'Prospecção',
      reasonWinLoss: '',
      quantity: 0,
      scp: 0,
      remember: '',
      homologated: false,
      reasonHomologated: '',
      country: 'Brasil',
      ecosystem: '',
      progress: 0,
      lastCustomerDiscussion: new Date().toISOString().split('T')[0],
      observation: '',
      competitors: '',
      productTeam: '',
      salesManagement: '',
      ownerId: auth.currentUser.uid,
    };
    try {
      const docRef = await addDoc(collection(db, 'opportunities'), newOppData);
      logAction('Criou Oportunidade', 'Nova Oportunidade');
      addToast(t.opp.messages.createdSuccess, 'success');
      return { id: docRef.id, ...newOppData };
    } catch (error) {
      console.error(error);
      addToast(t.opp.messages.createdError, 'error');
      return null;
    }
  };

  const updateOpp = async (id: string, updates: Partial<Opportunity>) => {
    try {
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
      );
      await updateDoc(doc(db, 'opportunities', id), updates);
      addToast(t.opp.messages.updatedSuccess, 'success');
    } catch (error) {
      addToast(t.opp.messages.updatedError, 'error');
    }
  };

  const deleteOpp = async (id: string) => {
    if (confirm(t.opp.messages.confirmDelete)) {
      try {
        const oppToDelete = opportunities.find((o) => o.id === id);
        await deleteDoc(doc(db, 'opportunities', id));
        logAction('Excluiu Oportunidade', oppToDelete?.description || id);
        addToast(t.opp.messages.deletedSuccess, 'info');
      } catch (error) {
        addToast(t.opp.messages.deletedError, 'error');
      }
    }
  };

  const handleOpenNotes = async (opp: Opportunity) => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'pages'),
      where('linkedOpportunityId', '==', opp.id),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      navigate(`/page/${querySnapshot.docs[0].id}`);
    } else {
      try {
        const newPage = {
          title: `Notes: ${opp.description}`,
          content: `<h1>${opp.description}</h1><p>Notes regarding this opportunity...</p>`,
          ownerId: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
          linkedOpportunityId: opp.id,
        };
        const docRef = await addDoc(collection(db, 'pages'), newPage);
        logAction('Criou Nota de Oportunidade', opp.description);
        addToast(t.opp.messages.noteCreated, 'success');
        navigate(`/page/${docRef.id}`);
      } catch (error) {
        addToast(t.opp.messages.noteError, 'error');
      }
    }
  };

  const groupedData = useMemo(() => {
    const filtered = opportunities.filter((opp) => {
      const matchesSearch =
        opp.description?.toLowerCase().includes(search.toLowerCase()) ||
        opp.utility?.toLowerCase().includes(search.toLowerCase());
      const matchesUtility = filterUtility === 'all' || opp.utility === filterUtility;
      const oppGroupLower = (opp.technicalSalesGroup || '').toLowerCase();
      const matchesGroup =
        filterGroup === 'all' || oppGroupLower.includes(filterGroup.toLowerCase());
      return matchesSearch && matchesUtility && matchesGroup;
    });

    const groups: Record<string, Opportunity[]> = {};
    filtered.forEach((opp) => {
      const groupName = opp.technicalSalesGroup || t.opp.noGroup;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(opp);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) =>
        (a.utility || '').localeCompare(b.utility || '')
      );
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [opportunities, search, filterUtility, filterGroup, t.opp.noGroup]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: prev[groupName] === false ? true : false,
    }));
  };

  return {
    opportunities,
    search,
    setSearch,
    filterUtility,
    setFilterUtility,
    filterGroup,
    setFilterGroup,
    expandedGroups,
    uniqueUtilities,
    createOpportunity,
    updateOpp,
    deleteOpp,
    handleOpenNotes,
    groupedData,
    toggleGroup,
    t,
  };
};
