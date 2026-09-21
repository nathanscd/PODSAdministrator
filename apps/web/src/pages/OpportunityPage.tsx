import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import OpportunityForm from '../components/OpportunityForm';
import CsvImporter from '../components/CsvImporter';
import { useTitle } from '../hooks/useTitle';
import { useOpportunities } from '../hooks/useOpportunities';
import { OpportunityHeader } from '../components/Opportunities/OpportunityHeader';
import { OpportunityTable } from '../components/Opportunities/OpportunityTable';
import { OpportunityMenu } from '../components/Opportunities/OpportunityMenu';
import { Opportunity } from '../types';
import { LayoutGrid, Percent, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DropdownConfig {
  x: number;
  y: number;
  opp: Opportunity;
}

export default function OpportunityPage() {
  const {
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
  } = useOpportunities();

  useTitle(`${t.sidebar.opportunities} - PODS Administrator`);

  const [dropdownConfig, setDropdownConfig] = useState<DropdownConfig | null>(null);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(debouncedSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownConfig(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenMenu = (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation();
    const rect = (e.target as Element).getBoundingClientRect();
    setDropdownConfig({
      x: rect.left,
      y: Math.min(rect.bottom + 5, window.innerHeight - 200),
      opp,
    });
  };

  const handleCreate = async () => {
    const newOpp = await createOpportunity();
    if (newOpp) setEditingOpp(newOpp as Opportunity);
  };

  const metrics = useMemo(() => {
    const list = groupedData.flatMap(g => g[1]);
    const totalCount = list.length;
    const homologatedCount = list.filter(opp => opp.homologated).length;
    const avgProgress = totalCount
      ? Math.round(list.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0) / totalCount)
      : 0;

    return { totalCount, homologatedCount, avgProgress };
  }, [groupedData]);

  return (
    <PageTransition>
      <div className={`flex flex-col bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-[8000] h-screen' : 'h-screen'}`}>
        
        <div className="fixed bottom-6 right-6 z-[100] flex gap-4">
           <CsvImporter />
        </div>

        <OpportunityHeader
          search={debouncedSearch}
          setSearch={setDebouncedSearch}
          filterUtility={filterUtility}
          setFilterUtility={setFilterUtility}
          filterGroup={filterGroup}
          uniqueGroups={Array.from(new Set(opportunities.map(opp => opp.technicalSalesGroup).filter(Boolean)))} 
          setFilterGroup={setFilterGroup}
          uniqueUtilities={uniqueUtilities}
          createOpportunity={handleCreate}
          t={t}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
        />

        {!isFullScreen && (
          <div className="flex gap-4 px-6 sm:px-10 lg:px-16 py-4 border-b border-border/40 bg-background shrink-0 overflow-x-auto custom-scrollbar">
            <Card className="bg-card border-border/60 shadow-sm rounded-2xl min-w-max">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <LayoutGrid size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Records</span>
                  <span className="text-sm font-bold tracking-tight">{metrics.totalCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 shadow-sm rounded-2xl min-w-max">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Homologated</span>
                  <span className="text-sm font-bold tracking-tight">{metrics.homologatedCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 shadow-sm rounded-2xl min-w-max">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Percent size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg. Progress</span>
                  <span className="text-sm font-bold tracking-tight">{metrics.avgProgress}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <main className={`flex-1 flex flex-col min-h-0 ${isFullScreen ? 'p-0' : 'p-6 sm:px-10 lg:px-16 pb-8'}`}>
          <div className={`flex-1 flex flex-col bg-card overflow-hidden ${isFullScreen ? 'rounded-none border-none' : 'rounded-2xl border border-border/60 shadow-sm'}`}>
            <OpportunityTable
              groupedData={groupedData}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
              handleOpenMenu={handleOpenMenu}
              t={t}
            />
          </div>
        </main>

        {dropdownConfig && (
          <OpportunityMenu
            x={dropdownConfig.x}
            y={dropdownConfig.y}
            opp={dropdownConfig.opp}
            onEdit={setEditingOpp}
            onDelete={deleteOpp}
            onOpenNotes={handleOpenNotes}
            onClose={() => setDropdownConfig(null)}
            t={t}
          />
        )}

        <AnimatePresence>
          {editingOpp && (
            <OpportunityForm
              opp={editingOpp}
              allOpportunities={opportunities}
              onClose={() => setEditingOpp(null)}
              onUpdate={updateOpp}
              onDelete={deleteOpp}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}