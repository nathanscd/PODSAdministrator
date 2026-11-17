import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LayoutGrid, Activity, Target, History } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { NotificationsModal, LogsModal } from '../components/Modals';
import WelcomeNotificationModal from '../components/WelcomeNotificationModal';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { DashboardQuickLinks } from '../components/Dashboard/DashboardQuickLinks';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { DashboardGoals } from '../components/Dashboard/DashboardGoals';
import { DashboardLogs } from '../components/Dashboard/DashboardLogs';
import { useTitle } from '../hooks/useTitle';
import { useWorkspace } from '../hooks/useWorkspace';
import { WorkspaceMetrics } from '../components/Workspace/WorkspaceMetrics';
import { WorkspaceCharts } from '../components/Workspace/WorkspaceCharts';
import { PageHero } from '../components/ui/page-hero';
import { DashboardWidget } from '../components/ui/dashboard-widget';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent } from '../components/ui/card';

const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

export default function Initial() {
  useTitle('PODSAdministrator');
  const navigate = useNavigate();
  
  const {
    userDisplayName,
    goals,
    usersList: dashboardUsersList,
    recentLogs,
    statsData,
    addGoal,
    toggleGoal,
    deleteGoal,
    chartDataStats,
    goalsChartData,
    t: dashboardT,
  } = useDashboard();

  const {
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
    t: workspaceT,
    t
  } = useWorkspace();

  const [searchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHero
          badge={`BEM-VINDO, ${userDisplayName?.split(' ')[0] || 'USUÁRIO'}`}
          title={`${greeting}, ${userDisplayName?.split(' ')[0] || ''}`}
          description="Sua central de inteligência operacional para gerenciamento de páginas, tarefas, relatórios e oportunidades."
          icon={<Sparkles className="w-6 h-6" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <DashboardWidget
              title="Resumo Operacional"
              subtitle="Visão geral de métricas e status do sistema"
              icon={<Activity className="w-4 h-4 text-[var(--primary)]" />}
            >
              <DashboardStats statsData={statsData} t={dashboardT} />
            </DashboardWidget>

            <DashboardWidget
              title="Performance & Tarefas Atribuidas"
              subtitle="Desempenho atual dos módulos ativos"
              icon={<Activity className="w-4 h-4 text-[var(--primary)]" />}
            >
              <WorkspaceMetrics
                metrics={metrics}
                onAssignedTasksClick={() => navigate('/todo')}
              />
            </DashboardWidget>

            <DashboardWidget
              title="Ferramentas Rápidas"
              subtitle="Acesso direto aos principais módulos do aplicativo"
              icon={<LayoutGrid className="w-4 h-4 text-[var(--muted-foreground)]" />}
            >
              <DashboardQuickLinks searchQuery={searchQuery} t={dashboardT} />
            </DashboardWidget>

            <DashboardWidget
              title="Gráficos de Desempenho"
              subtitle="Evolução histórica de metas e métricas de sistema"
              icon={<Activity className="w-4 h-4 text-[var(--primary)]" />}
            >
              <DashboardCharts
                chartDataStats={chartDataStats}
                goalsChartData={goalsChartData}
                hasGoals={goals.length > 0}
              />
            </DashboardWidget>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <DashboardWidget
              title={workspaceT.dailyGoals || "Metas Diárias"}
              subtitle="Acompanhamento e tarefas prioritárias"
              icon={<Target className="w-4 h-4 text-[var(--primary)]" />}
            >
              <DashboardGoals 
                goals={goals}
                usersList={dashboardUsersList}
                searchQuery={searchQuery}
                addGoal={addGoal}
                toggleGoal={toggleGoal}
                deleteGoal={deleteGoal}
                t={dashboardT}
              />
            </DashboardWidget>

            <DashboardWidget
              title="Analytics Hub"
              subtitle="Distribuição por status e utilização"
              icon={<Target className="w-4 h-4 text-[var(--muted-foreground)]" />}
            >
              <WorkspaceCharts
                statusChartData={statusChartData}
                utilityChartData={utilityChartData}
                colors={COLORS}
                t={workspaceT} 
              />
            </DashboardWidget>

            <DashboardWidget
              title="Atividades Recentes"
              subtitle="Histórico de ações no sistema"
              icon={<History className="w-4 h-4 text-[var(--muted-foreground)]" />}
            >
              <DashboardLogs
                recentLogs={recentLogs}
                setIsLogsOpen={setIsLogsOpen}
                t={dashboardT}
              />
            </DashboardWidget>
          </div>

          {/*<div className="lg:col-span-12">
            <DashboardWidget
              title="Agenda & Eventos"
              subtitle="Calendário corporativo e datas importantes"
              icon={<History className="w-4 h-4 text-[var(--primary)]" />}
            >
              <Card className="bg-background/60 backdrop-blur-2xl border-border/40 rounded-[32px] p-6 shadow-sm flex flex-col items-center justify-center">
                <CardContent className="p-0 flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-2xl border border-border/40 bg-card/50 p-4 shadow-sm"
                  />
                </CardContent>
              </Card>
            </DashboardWidget>
          </div>*/}
        </div>

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        <LogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
        <WelcomeNotificationModal
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      </div>
    </PageTransition>
  );
}