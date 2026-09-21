import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BellRing, Bell, Search, X, Sparkles, LayoutGrid, Activity, Target, History } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useWorkspace } from '../hooks/useWorkspace';
import { WorkspaceMetrics } from '../components/Workspace/WorkspaceMetrics';
import { WorkspaceCharts } from '../components/Workspace/WorkspaceCharts';
import { WorkspaceOpportunities } from '../components/Workspace/WorkspaceOpportunities';
import { WorkspaceQuickTasks } from '../components/Workspace/WorkspaceQuickTasks';
import { WorkspaceCalendar } from '../components/Workspace/WorkspaceCalendar';
import { WorkspaceEventModal } from '../components/Workspace/WorkspaceEventModal';
import { NotificationsModal, LogsModal } from '../components/Modals';

export default function Workspace() {
  const navigate = useNavigate();
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
    t,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-app)] selection:bg-[var(--accent-color)] selection:text-white">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-gradient-from)] via-[var(--bg-app)] to-[var(--bg-gradient-to)] opacity-70" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] w-[600px] h-[600px] rounded-full bg-[var(--accent-color)]/10 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[var(--text-secondary)]/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] left-[10%] w-[700px] h-[700px] rounded-full bg-[var(--accent-hover)]/5 blur-[100px]" 
          />
        </div>

        {/* Floating Island Navbar */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-[1400px] px-2 sm:px-0">
          <div className="flex h-16 items-center justify-between gap-4 px-3 sm:px-6 rounded-2xl border border-[var(--border-color)]/50 bg-[var(--bg-app)]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-500">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: "anticipate" }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] font-black text-white shadow-lg shadow-[var(--accent-color)]/20 "
              >
                W
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="m-0 text-sm font-black tracking-tighter text-[var(--text-primary)] leading-none uppercase">
                  Workspace
                </h1>
                <span className="mt-0.5 block text-[9px] font-bold tracking-widest text-[var(--text-secondary)] uppercase opacity-60">
                  {isAdmin ? 'Management' : userGroup || 'Operations'}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50 group-focus-within:opacity-100 transition-opacity" size={16} />
                <input
                  type="text"
                  placeholder="Search opportunities, tasks, events..."
                  className="w-full h-10 pl-11 pr-10 rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-app)]/40 backdrop-blur-md outline-none focus:border-[var(--accent-color)]/50 focus:bg-[var(--bg-app)]/80 transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-px h-6 bg-[var(--border-color)]/50 mx-1" />

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={openNewEventModal}
                className="h-10 px-4 flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--accent-color)]/20"
              >
                <Plus size={14} />
                <span className="hidden md:inline">{t.workspace.buttons.newEvent}</span>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="relative z-10 pt-32 pb-20 px-4 sm:px-10 lg:px-16 max-w-[1800px] mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-12"
          >
            {/* Hero Section */}
            <motion.section variants={itemVariants} className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5 backdrop-blur-md">
                  <Sparkles size={14} className="text-[var(--accent-color)] animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[var(--accent-color)] uppercase">
                    {isAdmin ? t.workspace.admin : `${t.workspace.group}: ${userGroup || t.workspace.status.general}`}
                  </span>
                </div>
                {nextEvent && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-color)]/50 bg-[var(--bg-app)]/40 backdrop-blur-md">
                    <BellRing size={14} className="text-[var(--accent-color)] animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase">
                      {t.workspace.labels.next}: {nextEvent.title}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-[clamp(40px,6vw,84px)] font-black leading-[0.9] tracking-tighter text-[var(--text-primary)] mb-6 uppercase italic">
                {greeting}.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] via-[var(--text-secondary)] to-[var(--accent-color)] bg-[length:200%_auto] animate-gradient-x">
                  {t.workspace.labels.workspace || 'Workspace'}
                </span>
              </h2>
              <p className="max-w-xl text-lg font-medium text-[var(--text-primary)] opacity-60 leading-relaxed">
                {t.workspace.hero_desc || 'Manage your daily operations, track opportunities, and stay on top of your schedule.'}
              </p>
            </motion.section>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column - Metrics & Charts */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* Metrics Section */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-[var(--accent-color)]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Key Performance</h3>
                  </div>
                  <WorkspaceMetrics
                    metrics={metrics}
                    onAssignedTasksClick={() => navigate('/todo')}
                  />
                </motion.div>

                {/* Charts Section */}
                <motion.div 
                  variants={itemVariants}
                  className="rounded-[32px] border border-[var(--border-color)]/50 bg-[var(--bg-app)] backdrop-blur-xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Target size={18} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Analytics Hub</h3>
                  </div>
                  <WorkspaceCharts
                    statusChartData={statusChartData}
                    utilityChartData={utilityChartData}
                    colors={COLORS}
                    t={t}
                  />
                </motion.div>

                {/* Opportunities & Tasks Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div 
                    variants={itemVariants}
                    className="rounded-[32px] border border-[var(--border-color)]/50 bg-[var(--bg-app)] backdrop-blur-xl p-8 shadow-xl"
                  >
                    <WorkspaceOpportunities
                      opportunities={opportunities}
                      userGroup={userGroup ?? null}
                      t={t}
                      onNavigateToOpportunities={() => navigate('/opportunities')}
                    />
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="rounded-[32px] border border-[var(--border-color)]/50 bg-[var(--bg-app)]/40 backdrop-blur-xl p-8 shadow-xl"
                  >
                    <WorkspaceQuickTasks
                      quickTasks={quickTasks}
                      newTaskInput={newTaskInput}
                      setNewTaskInput={setNewTaskInput}
                      selectedUserForTask={selectedUserForTask}
                      setSelectedUserForTask={setSelectedUserForTask}
                      usersList={usersList}
                      onAddTask={addFastTask}
                      onDeleteTask={deleteFastTask}
                      t={t}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Right Column - Calendar */}
              <div className="lg:col-span-4 h-full">
                <motion.div 
                  variants={itemVariants}
                  className="h-full rounded-[32px] border border-[var(--border-color)]/50 bg-gradient-to-br from-[var(--bg-app)]/60 to-[var(--accent-color)]/5 backdrop-blur-xl p-8 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <History size={18} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Schedule & Events</h3>
                  </div>
                  <WorkspaceCalendar
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    year={year}
                    month={month}
                    blanks={blanks}
                    days={days}
                    getEventsForDay={getEventsForDay}
                    isToday={isToday}
                    onDayClick={handleDayClick}
                    onNewEvent={openNewEventModal}
                    onEditEvent={openEditModal}
                    onDeleteEvent={deleteEvent}
                    isAdmin={isAdmin}
                    currentUserUid={user?.uid}
                    t={t}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        <LogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />

        <WorkspaceEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          editingEvent={editingEvent}
          newEventTitle={newEventTitle}
          setNewEventTitle={setNewEventTitle}
          newEventDesc={newEventDesc}
          setNewEventDesc={setNewEventDesc}
          newEventLink={newEventLink}
          setNewEventLink={setNewEventLink}
          newEventDate={newEventDate}
          setNewEventDate={setNewEventDate}
          newEventTime={newEventTime}
          setNewEventTime={setNewEventTime}
          selectedUserForEvent={selectedUserForEvent}
          setSelectedUserForEvent={setSelectedUserForEvent}
          usersList={usersList}
          onSave={saveEvent}
          t={t}
        />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 15s ease infinite;
          }
        `}} />
      </div>
    </PageTransition>
  );
}