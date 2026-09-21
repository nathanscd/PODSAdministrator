import { useEffect, useState, useRef, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Opportunity, MonthlySnapshot } from '../types';
import { useToast } from '../contexts/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useAMIReport = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('live');
  const [viewMode, setViewMode] = useState<'report' | 'overview'>('report');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const reportRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const COLORS = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#f97316',
  ];
  const STACK_COLORS = [
    '#d97706',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#eab308',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#fcd34d',
    '#14b8a6',
    '#64748b',
    '#a8a29e',
    '#78350f',
    '#c084fc',
    '#fb923c',
    '#22c55e',
    '#f87171',
    '#06b6d4',
  ];
  const WIN_LOSS_COLORS = { Win: '#10b981', Loss: '#ef4444', Open: '#3b82f6' };

  useEffect(() => {
    const q = query(collection(db, 'opportunities'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            businessStages: doc.data().businessStage || doc.data().businessStages || '',
          } as Opportunity)
      );
      setOpportunities(data);
    });

    const sq = query(
      collection(db, 'monthly_reports'),
      orderBy('timestamp', 'desc'),
      limit(12)
    );
    const unsubscribeSnapshots = onSnapshot(sq, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MonthlySnapshot)
      );
      setSnapshots(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeSnapshots();
    };
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const chunkArray = (arr: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const normalizeString = (str?: string) => String(str || '').trim().toLowerCase();

  const isWin = (stage?: string, status?: string) => {
    const s = normalizeString(stage);
    const st = normalizeString(status);
    return ['post sales', 'pós-venda', 'pós venda', 'won', 'ganho', 'bom', 'good'].some(v => s.includes(v) || st.includes(v));
  };

  const isLoss = (stage?: string, status?: string) => {
    const s = normalizeString(stage);
    const st = normalizeString(status);
    return ['archived', 'arquivo', 'lost', 'perdido', 'cancel', 'ruim', 'bad'].some(v => s.includes(v) || st.includes(v));
  };

  const isOpen = (stage?: string, status?: string) => !isWin(stage, status) && !isLoss(stage, status);

  const isActiveTime = (o: Opportunity) => {
    // Show all data in reports unless explicitly excluded by a very old year
    if (!o.yearEnd) return true;
    const year = parseInt(String(o.yearEnd), 10);
    return isNaN(year) || year >= 2024; // broadened filter
  };

  const getAggregatedData = (data: Opportunity[], key: keyof Opportunity) => {
    const counts = data.reduce((acc: Record<string, number>, opp) => {
      const val = String(opp[key] || 'Unknown').trim();
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const currentData = useMemo(() => {
    if (selectedSnapshotId === 'live') return opportunities;
    const snap = snapshots.find((s) => s.id === selectedSnapshotId);
    return snap ? snap.opportunitiesSnapshot : [];
  }, [selectedSnapshotId, opportunities, snapshots]);

  const activeData = useMemo(() => {
    return currentData.filter((o) => isActiveTime(o) && isOpen(o.businessStages, o.status));
  }, [currentData]);

  const winLossData = useMemo(() => {
    return currentData.filter((o) => isActiveTime(o) && !isOpen(o.businessStages, o.status));
  }, [currentData]);

  const allFutureData = useMemo(() => {
    return currentData.filter((o) => isActiveTime(o));
  }, [currentData]);

  const openOpportunities = useMemo(() => {
    return [...activeData].sort((a, b) => {
      const groupA = String(a.technicalSalesGroup || 'ZZZ').trim();
      const groupB = String(b.technicalSalesGroup || 'ZZZ').trim();
      const groupComparison = groupA.localeCompare(groupB);

      if (groupComparison !== 0) return groupComparison;

      return String(a.utility || '').localeCompare(String(b.utility || ''));
    });
  }, [activeData]);

  const openChunks = useMemo(() => {
    if (openOpportunities.length === 0) return [];
    const ITEMS_PER_FIRST_PAGE = 6;
    const ITEMS_PER_SUBSEQUENT_PAGE = 6;
    const chunks = [];
    chunks.push({
      items: openOpportunities.slice(0, ITEMS_PER_FIRST_PAGE),
      isFirstPage: true,
    });
    const remainingItems = openOpportunities.slice(ITEMS_PER_FIRST_PAGE);
    for (let i = 0; i < remainingItems.length; i += ITEMS_PER_SUBSEQUENT_PAGE) {
      chunks.push({
        items: remainingItems.slice(i, i + ITEMS_PER_SUBSEQUENT_PAGE),
        isFirstPage: false,
      });
    }
    return chunks;
  }, [openOpportunities]);

  const businessStageData = useMemo(
    () => getAggregatedData(activeData, 'businessStages'),
    [activeData]
  );
  const ecosystemData = useMemo(
    () => getAggregatedData(activeData, 'ecosystem'),
    [activeData]
  );

  const utilitiesCountData = useMemo(() => {
    const counts = activeData.reduce((acc: Record<string, number>, opp) => {
      const util = String(opp.utility || 'Unknown').trim();
      acc[util] = (acc[util] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeData]);

  const stackedChartData = useMemo(() => {
    const structuredData = activeData.reduce((acc: Record<string, any>, opp) => {
      const eco = String(opp.ecosystem || 'Other').trim();
      const util = String(opp.utility || 'Unknown').trim();

      if (!acc[eco]) {
        acc[eco] = { name: eco, total: 0 };
      }
      acc[eco][util] = (acc[eco][util] || 0) + 1;
      acc[eco].total += 1;

      return acc;
    }, {});

    return Object.values(structuredData).sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );
  }, [activeData]);

  const allUtilities = useMemo(() => {
    return Array.from(
      new Set(activeData.map((o) => String(o.utility || 'Unknown').trim()))
    ).sort();
  }, [activeData]);

  const winLossChunks = useMemo(() => {
    if (winLossData.length === 0) return [];
    const ITEMS_PER_FIRST_PAGE = 14;
    const ITEMS_PER_SUBSEQUENT_PAGE = 14;
    const chunks = [];
    chunks.push({
      items: winLossData.slice(0, ITEMS_PER_FIRST_PAGE),
      isFirstPage: true,
    });
    const remainingItems = winLossData.slice(ITEMS_PER_FIRST_PAGE);
    for (let i = 0; i < remainingItems.length; i += ITEMS_PER_SUBSEQUENT_PAGE) {
      chunks.push({
        items: remainingItems.slice(i, i + ITEMS_PER_SUBSEQUENT_PAGE),
        isFirstPage: false,
      });
    }
    return chunks;
  }, [winLossData]);

  const winLossOnlyTotal = useMemo(
    () => [
      {
        name: 'Win',
        value: winLossData.filter((o) => isWin(o.businessStages, o.status)).length,
      },
      {
        name: 'Loss',
        value: winLossData.filter((o) => isLoss(o.businessStages, o.status)).length,
      },
    ],
    [winLossData]
  );

  const groupStatsData = useMemo(() => {
    const groups = ['1st Group', '2nd Group', '3rd Group'];
    return groups.map((group) => {
      const groupOpps = allFutureData.filter((o) =>
        String(o.technicalSalesGroup || '').includes(group)
      );

      const winLoss = [
        {
          name: 'Win',
          value: groupOpps.filter((o) => isWin(o.businessStages, o.status)).length,
        },
        {
          name: 'Loss',
          value: groupOpps.filter((o) => isLoss(o.businessStages, o.status)).length,
        },
        {
          name: 'Open',
          value: groupOpps.filter((o) => isOpen(o.businessStages, o.status)).length,
        },
      ];

      const closedGroupOpps = groupOpps.filter((o) => !isOpen(o.businessStages, o.status));
      const ITEMS_PER_FIRST_PAGE = 18;
      const ITEMS_PER_SUBSEQUENT_PAGE = 14;
      const chunks = [];

      if (closedGroupOpps.length === 0) {
        chunks.push({ items: [], isFirstPage: true });
      } else {
        chunks.push({
          items: closedGroupOpps.slice(0, ITEMS_PER_FIRST_PAGE),
          isFirstPage: true,
        });
        const remaining = closedGroupOpps.slice(ITEMS_PER_FIRST_PAGE);
        for (let i = 0; i < remaining.length; i += ITEMS_PER_SUBSEQUENT_PAGE) {
          chunks.push({
            items: remaining.slice(i, i + ITEMS_PER_SUBSEQUENT_PAGE),
            isFirstPage: false,
          });
        }
      }

      return { name: group, winLoss, chunks };
    });
  }, [allFutureData]);

  const evolutionData = useMemo(() => {
    return [...snapshots].reverse().map((s) => ({
      name: `${s.month}/${s.year}`,
      Win: s.stats.winCount,
      Loss: s.stats.lossCount,
      Open: s.stats.openCount,
      Total: s.stats.totalOpportunities,
    }));
  }, [snapshots]);

  const handleCreateSnapshot = async () => {
    if (selectedSnapshotId !== 'live') return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const existing = snapshots.find((s) => s.month === month && s.year === year);

    if (
      existing &&
      !window.confirm('Já existe um snapshot para este mês. Deseja sobrescrever?')
    )
      return;

    try {
      const stats = {
        totalOpportunities: opportunities.length,
        winCount: opportunities.filter((o) => isWin(o.businessStages, o.status)).length,
        lossCount: opportunities.filter((o) => isLoss(o.businessStages, o.status)).length,
        openCount: opportunities.filter((o) => isOpen(o.businessStages, o.status)).length,
      };

      await addDoc(collection(db, 'monthly_reports'), {
        month,
        year,
        timestamp: serverTimestamp(),
        stats,
        opportunitiesSnapshot: opportunities,
      });

      addToast('Snapshot criado!', 'success');
    } catch (error) {
      addToast('Erro ao criar snapshot.', 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    addToast('Gerando PDF...', 'info');

    setTimeout(async () => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = reportRef.current?.querySelectorAll('.pdf-page');

        if (pages) {
          for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i] as HTMLElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 1200,
              onclone: (doc) => {
                doc.querySelectorAll('*').forEach((el: any) => {
                  if (el.style.color?.includes('oklch')) el.style.color = '#000000';
                  if (el.style.backgroundColor?.includes('oklch'))
                    el.style.backgroundColor = '#ffffff';
                });
              },
            });

            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
          }
          pdf.save(`AMI Solutions Technical Pre-Sales and Post-Sales Report.pdf`);
          addToast('Sucesso!', 'success');
        }
      } catch (e) {
        addToast('Erro ao exportar.', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  return {
    opportunities,
    snapshots,
    selectedSnapshotId,
    setSelectedSnapshotId,
    viewMode,
    setViewMode,
    loading,
    isExporting,
    zoomLevel,
    setZoomLevel,
    reportRef,
    COLORS,
    STACK_COLORS,
    WIN_LOSS_COLORS,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    currentData,
    activeData,
    winLossData,
    allFutureData,
    openOpportunities,
    openChunks,
    businessStageData,
    ecosystemData,
    utilitiesCountData,
    stackedChartData,
    allUtilities,
    winLossChunks,
    winLossOnlyTotal,
    groupStatsData,
    evolutionData,
    handleCreateSnapshot,
    handleExportPDF,
    isWin,
    isLoss,
    isOpen,
  };
};
