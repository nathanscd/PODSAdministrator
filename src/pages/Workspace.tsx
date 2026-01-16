import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Opportunity, TaskTracker } from "../types";
import { useNavigate } from "react-router-dom";
// CORREÇÃO: Importando PieChart como PieChartIcon para não conflitar com o gráfico
import { 
  Plus, Trash2, Clock, MapPin, User as UserIcon, CheckCircle2, 
  Edit3, Link as LinkIcon, ArrowRight, BarChart3, Globe, Lock,
  ExternalLink, Calendar as CalendarIcon, Filter, Layers, X,
  Briefcase, Zap, BellRing, ChevronLeft, ChevronRight, RotateCcw,
  PieChart as PieChartIcon 
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { logAction } from "../utils/systemLogger";
import { sendNotification } from "../utils/notificationSystem";

/* --- Interfaces --- */
interface CalendarEvent {
  id: string;
  title: string;
  link?: string;
  date: string;
  type: 'personal' | 'tracker';
  ownerId: string;
  assignedTo?: string;
  assignedName?: string;
}

interface QuickTask {
  id: string;
  text: string;
  ownerId: string;
  assignedTo?: string;
  assignedName?: string;
  createdAt: any;
}

export default function Workspace() {
  const { user, userGroup, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myTrackers, setMyTrackers] = useState<TaskTracker[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [usersList, setUsersList] = useState<{id: string, name: string}[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventLink, setNewEventLink] = useState("");
  const [selectedUserForEvent, setSelectedUserForEvent] = useState("");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const [newTaskInput, setNewTaskInput] = useState("");
  const [selectedUserForTask, setSelectedUserForTask] = useState("");

  const COLORS = ["#8b5cf6", "#06b6d4", "#f43f5e", "#f59e0b"];

  /* --- Data Sync --- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (s) => {
      setUsersList(s.docs.map(d => ({ 
        id: d.id, 
        name: d.data().displayName || d.data().name || "Unknown" 
      })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myUid = auth.currentUser.uid;

    // Opportunities
    const qOpps = isAdmin 
      ? query(collection(db, "opportunities")) 
      : query(collection(db, "opportunities"), where("technicalSalesGroup", "==", userGroup || "Unassigned"));
    
    const unsubOpps = onSnapshot(qOpps, (s) => {
      setOpportunities(s.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity)));
    });

    // Trackers
    const unsubTrackers = onSnapshot(collection(db, "taskTrackers"), (s) => {
      setMyTrackers(s.docs.map(d => ({ id: d.id, ...d.data() } as TaskTracker)));
    });

    // Events (Hybrid)
    const qEvs = query(collection(db, "personalEvents"), where("ownerId", "==", myUid));
    const qAssignedEvs = query(collection(db, "personalEvents"), where("assignedTo", "==", myUid));
    
    const unsubEvs = onSnapshot(qEvs, (s1) => {
      const own = s1.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
      const unsubAssigned = onSnapshot(qAssignedEvs, (s2) => {
        const ass = s2.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
        const merged = Array.from(new Map([...own, ...ass].map(e => [e.id, e])).values());
        setPersonalEvents(merged);
      });
      return unsubAssigned;
    });

    // Quick Tasks (Hybrid) - Nota: Se der erro de Index no console, clique no link fornecido pelo Firebase
    const qTasks = query(collection(db, "quickTasks"), where("ownerId", "==", myUid), orderBy("createdAt", "desc"));
    const qAssignedTasks = query(collection(db, "quickTasks"), where("assignedTo", "==", myUid), orderBy("createdAt", "desc"));

    const unsubTasks = onSnapshot(qTasks, (s1) => {
      const own = s1.docs.map(d => ({ id: d.id, ...d.data() } as QuickTask));
      const unsubAssignedT = onSnapshot(qAssignedTasks, (s2) => {
         const ass = s2.docs.map(d => ({ id: d.id, ...d.data() } as QuickTask));
         const merged = Array.from(new Map([...own, ...ass].map(t => [t.id, t])).values());
         merged.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
         setQuickTasks(merged);
      });
      return unsubAssignedT;
    });

    return () => { unsubOpps(); unsubTrackers(); unsubEvs(); unsubTasks(); };
  }, [user, isAdmin, userGroup]);

  /* --- Handlers (CORRIGIDO: Funções Definidas) --- */
  const handleDayClick = (day: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const openEditModal = (e: CalendarEvent) => {
    setEditingEvent(e);
    setNewEventTitle(e.title);
    setNewEventLink(e.link || "");
    setSelectedUserForEvent(e.assignedTo || "");
    setIsEventModalOpen(true);
  };

  const deleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, "personalEvents", id));
      addToast("Event removed", "info");
      logAction("Deleted Event", title);
    } catch (e) { addToast("Error deleting event", "error"); }
  };

  const saveEvent = async () => {
    if (!newEventTitle.trim() || !auth.currentUser) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    const assignedUser = usersList.find(u => u.id === selectedUserForEvent);

    const data = {
      title: newEventTitle,
      link: newEventLink || "",
      date: dateStr,
      assignedTo: selectedUserForEvent || null,
      assignedName: assignedUser?.name || null,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingEvent) {
        await updateDoc(doc(db, "personalEvents", editingEvent.id), data);
        addToast("Event updated", "success");
      } else {
        await addDoc(collection(db, "personalEvents"), { 
          ...data, 
          type: 'personal', 
          ownerId: auth.currentUser.uid, 
          createdAt: serverTimestamp() 
        });
        if (selectedUserForEvent && selectedUserForEvent !== auth.currentUser.uid) {
          await sendNotification(selectedUserForEvent, "New Event Assigned", `${user?.displayName} scheduled: ${newEventTitle}`, "assignment", "/workspace");
        }
        addToast("Event scheduled", "success");
      }
      closeEventModal();
    } catch (e) { addToast("Error saving event", "error"); }
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setNewEventTitle("");
    setNewEventLink("");
    setSelectedUserForEvent("");
  };

  const addFastTask = async () => {
    if (!newTaskInput.trim() || !auth.currentUser) return;
    
    const assignedUser = usersList.find(u => u.id === selectedUserForTask);

    try {
      await addDoc(collection(db, "quickTasks"), { 
        text: newTaskInput, 
        ownerId: auth.currentUser.uid,
        assignedTo: selectedUserForTask || null,
        assignedName: assignedUser?.name || null,
        createdAt: serverTimestamp() 
      });

      if (selectedUserForTask && selectedUserForTask !== auth.currentUser.uid) {
          await sendNotification(selectedUserForTask, "New Task Assigned", `${user?.displayName} assigned you: "${newTaskInput}"`, "assignment", "/workspace");
      }

      setNewTaskInput("");
      setSelectedUserForTask("");
      addToast("Task added", "success");
    } catch(e) { console.error(e); }
  };

  const deleteFastTask = async (id: string) => {
      await deleteDoc(doc(db, "quickTasks", id));
      addToast("Task completed", "success");
  };

  /* --- Logic --- */
  const { blanks, days, year, month } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    return { 
      blanks: Array.from({ length: first }, (_, i) => i), 
      days: Array.from({ length: total }, (_, i) => i + 1),
      year: y, month: m
    };
  }, [currentDate]);

  const getEventsForDay = (d: number) => {
    const dateStr = new Date(year, month, d).toISOString().split('T')[0];
    const pEvs = personalEvents.filter(e => e.date === dateStr);
    const tEvs: CalendarEvent[] = [];
    myTrackers.forEach(t => t.tasks?.forEach(tk => {
      if (tk.plannedEndDate === dateStr) {
        tEvs.push({ id: tk.id, title: tk.task, date: dateStr, type: 'tracker', ownerId: t.ownerId });
      }
    }));
    return [...pEvs, ...tEvs];
  };

  const statusChartData = useMemo(() => [
    { name: "Good", value: opportunities.filter(o => o.status?.toLowerCase().includes("good")).length },
    { name: "Attention", value: opportunities.filter(o => o.status?.toLowerCase().includes("attention")).length },
    { name: "Bad", value: opportunities.filter(o => o.status?.toLowerCase().includes("bad")).length }
  ].filter(d => d.value > 0), [opportunities]);

  const utilityChartData = useMemo(() => {
    const c: Record<string, number> = {};
    opportunities.forEach(o => { if(o.utility) c[o.utility] = (c[o.utility] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value).slice(0, 5);
  }, [opportunities]);

  const isToday = (d: number) => {
    const now = new Date();
    return d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const nextEvent = useMemo(() => {
     const todayStr = new Date().toISOString().split('T')[0];
     const upcoming = personalEvents
        .filter(e => e.date >= todayStr)
        .sort((a,b) => a.date.localeCompare(b.date));
     return upcoming[0] || null;
  }, [personalEvents]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-6 lg:p-12 overflow-x-hidden font-sans">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in slide-in-from-top duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-60">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-color)]">{getGreeting()}, {user?.displayName?.split(' ')[0]}</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
              Workspace
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                {isAdmin ? "Admin Console" : `Group: ${userGroup || "General"}`}
              </span>
              <div className="h-px w-8 bg-[var(--border-color)]" />
              {nextEvent && (
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest animate-pulse">
                     <BellRing size={12} /> Next: {nextEvent.title} ({new Date(nextEvent.date).getDate()}/{new Date(nextEvent.date).getMonth()+1})
                  </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEventModalOpen(true)} 
            className="group flex items-center gap-3 bg-[var(--accent-color)] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-[0_10px_30px_-10px_var(--accent-color)] hover:shadow-[0_20px_40px_-10px_var(--accent-color)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300"/> New Event
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CHART 1 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 h-[360px] relative shadow-sm hover:border-[var(--accent-color)]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <BarChart3 size={14}/> AMI opportunities Status
                    </h3>
                    <div className="p-2 bg-white/5 rounded-full"><PieChartIcon size={14} className="text-white/20"/></div>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={statusChartData} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} stroke="none">
                      {statusChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} itemStyle={{color: '#fff'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* CHART 2 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 h-[360px] relative shadow-sm hover:border-[var(--accent-color)]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Filter size={14}/> Top Utilities
                    </h3>
                    <div className="p-2 bg-white/5 rounded-full"><Briefcase size={14} className="text-white/20"/></div>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={utilityChartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 9, fill: '#666', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" fill="var(--accent-color)" radius={[0, 6, 6, 0]} barSize={16} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', fontSize: '11px' }} itemStyle={{color: '#fff'}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* OPPORTUNITIES */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-sm relative overflow-hidden group/card">
               <div className="absolute top-0 right-0 p-20 bg-[var(--accent-color)]/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex justify-between items-center mb-10 relative z-10">
                  <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter flex items-center gap-4">
                    <Layers size={24} className="text-[var(--accent-color)]"/> {userGroup || "General"} Opportunities
                  </h3>
                  <button onClick={() => navigate('/opportunities')} className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-[var(--accent-color)] transition-colors bg-transparent border-none cursor-pointer flex items-center gap-2">
                    View All <ArrowRight size={10}/>
                  </button>
               </div>
               
               <div className="space-y-3 relative z-10">
                  {opportunities.slice(0, 5).map(opp => (
                    <div key={opp.id} className="flex items-center justify-between p-5 bg-[var(--bg-app)]/40 backdrop-blur-sm rounded-3xl border border-white/5 group hover:border-[var(--accent-color)]/40 hover:bg-[var(--bg-app)]/80 transition-all cursor-default">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest px-2 py-1 bg-[var(--accent-color)]/10 rounded-lg">{opp.utility}</span>
                             <span className="text-[9px] font-bold text-white/30 uppercase">{opp.status}</span>
                          </div>
                          <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{opp.description}</span>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="hidden md:flex flex-col items-end">
                             <span className="text-[10px] font-mono text-white/20 mb-1">{opp.kam || "No KAM"}</span>
                             <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--accent-color)]" style={{width: `${opp.progress}%`}}/></div>
                          </div>
                          <button onClick={() => navigate('/opportunities')} className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white border-none cursor-pointer hover:bg-[var(--accent-color)] shadow-lg">
                             <ArrowRight size={14} />
                          </button>
                       </div>
                    </div>
                  ))}
                  {opportunities.length === 0 && <div className="text-center py-10 opacity-30 text-xs font-bold uppercase">No opportunities found</div>}
               </div>
            </div>

            {/* FAST TASKS */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-end mb-8 relative z-10">
                  <h3 className="text-xl font-black italic text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3">
                     <Zap size={20} className="text-yellow-500 fill-yellow-500"/> Fast Tasks
                  </h3>
               </div>
               
               <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[var(--bg-app)] p-3 rounded-3xl border border-white/5 focus-within:border-[var(--accent-color)] transition-colors relative z-10">
                  <input 
                    className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-white placeholder:opacity-30" 
                    placeholder="What needs to be done?" 
                    value={newTaskInput} 
                    onChange={e => setNewTaskInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && addFastTask()} 
                  />
                  <div className="flex items-center gap-2">
                     <div className="h-6 w-px bg-white/10 mx-2" />
                     <select 
                       value={selectedUserForTask}
                       onChange={(e) => setSelectedUserForTask(e.target.value)}
                       className="bg-transparent text-[10px] font-black uppercase text-[var(--text-secondary)] outline-none cursor-pointer hover:text-[var(--accent-color)] appearance-none pr-4 text-right"
                     >
                        <option value="">For Me</option>
                        {usersList.map(u => <option key={u.id} value={u.id}>For {u.name.split(' ')[0]}</option>)}
                     </select>
                     <button onClick={addFastTask} className="bg-[var(--accent-color)] text-white p-3 rounded-2xl border-none cursor-pointer hover:scale-105 transition-all shadow-lg">
                        <Plus size={18}/>
                     </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {quickTasks.map(tk => (
                    <div key={tk.id} className="flex items-center gap-4 p-5 bg-[var(--bg-app)]/30 rounded-3xl border border-white/5 group hover:bg-[var(--bg-app)]/80 hover:border-white/10 transition-all">
                       <button onClick={() => deleteFastTask(tk.id)} className="w-8 h-8 rounded-xl border-2 border-white/10 flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all bg-transparent cursor-pointer group/btn shadow-inner">
                          <CheckCircle2 size={16} className="opacity-0 group-hover/btn:opacity-100 text-white" />
                       </button>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold opacity-90">{tk.text}</span>
                          {tk.assignedName && (
                             <span className="text-[9px] font-black uppercase text-[var(--accent-color)] flex items-center gap-1 mt-1">
                                <ArrowRight size={8} /> {tk.assignedName.split(' ')[0]}
                             </span>
                          )}
                       </div>
                    </div>
                  ))}
                  {quickTasks.length === 0 && <div className="col-span-2 text-center py-6 opacity-20 text-[10px] font-black uppercase tracking-widest">Everything is done!</div>}
               </div>
            </div>
          </div>

          {/* SIDEBAR - CALENDAR */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#050505] text-white rounded-[3.5rem] p-8 min-h-[800px] border border-white/5 flex flex-col shadow-2xl relative overflow-hidden group">
               {/* Background Ambient Light */}
               <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[var(--accent-color)]/10 blur-[100px] rounded-full pointer-events-none" />

               <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-[var(--accent-color)] tracking-[0.3em] mb-2 flex items-center gap-2">
                       <CalendarIcon size={10} /> Agenda
                    </span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setCurrentDate(new Date())} className="p-3 text-white/50 hover:text-white bg-white/5 rounded-xl border-none cursor-pointer transition-colors" title="Today"><RotateCcw size={14} /></button>
                     <div className="w-px h-8 bg-white/10 mx-1" />
                     <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-3 text-white bg-white/5 rounded-xl border-none cursor-pointer hover:bg-white/10 transition-colors"><ChevronLeft size={14}/></button>
                     <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-3 text-white bg-white/5 rounded-xl border-none cursor-pointer hover:bg-white/10 transition-colors"><ChevronRight size={14}/></button>
                  </div>
               </div>

               <div className="grid grid-cols-7 gap-2 text-[9px] font-black opacity-30 text-center mb-6">
                 {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
               </div>

               <div className="grid grid-cols-7 gap-2 mb-10 relative z-10">
                 {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10" />)}
                 {days.map(d => {
                    const evs = getEventsForDay(d);
                    const selected = currentDate.getDate() === d;
                    const today = isToday(d);
                    return (
                      <div 
                        key={d} 
                        onClick={() => handleDayClick(d)} 
                        className={`h-10 rounded-xl flex flex-col items-center justify-center text-[11px] font-black cursor-pointer transition-all relative
                          ${evs.length ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white hover:bg-white/5'} 
                          ${today ? 'border border-[var(--accent-color)] text-[var(--accent-color)] shadow-[0_0_10px_rgba(6,182,212,0.2)]' : ''} 
                          ${selected ? '!bg-[var(--accent-color)] !text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110 z-20' : ''}`}
                      >
                        {d}
                        {evs.length > 0 && <div className={`w-1 h-1 rounded-full mt-1 ${selected ? 'bg-white' : 'bg-[var(--accent-color)]'}`} />}
                      </div>
                    )
                 })}
               </div>

               <div className="flex-1 bg-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar border border-white/5 relative z-10 shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8 flex items-center gap-2 border-b border-white/10 pb-4">
                    <Clock size={12} className="text-[var(--accent-color)]"/> Schedule: {currentDate.getDate()} {currentDate.toLocaleString('en-US', { month: 'short' })}
                  </h4>
                  <div className="space-y-6">
                    {getEventsForDay(currentDate.getDate()).map(e => (
                      <div key={e.id} className="group flex items-start gap-5 border-b border-white/5 pb-6 last:border-0 relative">
                         {/* Time/Icon Indicator */}
                         <div className={`p-3 rounded-2xl shrink-0 ${e.type === 'tracker' ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            {e.type === 'tracker' ? <Clock size={18}/> : <MapPin size={18}/>}
                         </div>
                         
                         <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-[var(--accent-color)] transition-colors cursor-pointer" onClick={() => e.type === 'personal' && openEditModal(e)}>{e.title}</p>
                            <div className="flex flex-wrap items-center gap-3">
                               {e.assignedName && (
                                 <span className="text-[9px] font-black uppercase text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                   <UserIcon size={10}/> {e.assignedName.split(' ')[0]}
                                 </span>
                               )}
                               {e.link && (
                                 <a href={e.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg hover:bg-[var(--accent-color)] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
                                   Link <ExternalLink size={8}/>
                                 </a>
                               )}
                            </div>
                         </div>

                         {e.type === 'personal' && (
                           <div className="absolute right-0 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all bg-[#050505]/80 p-1 rounded-xl backdrop-blur-md">
                              <button onClick={() => openEditModal(e)} className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white cursor-pointer border-none transition-colors"><Edit3 size={14}/></button>
                              <button onClick={() => deleteEvent(e.id, e.title)} className="p-2 bg-red-500/10 rounded-lg text-red-500 cursor-pointer border-none hover:bg-red-500/20 transition-colors"><Trash2 size={14}/></button>
                           </div>
                         )}
                      </div>
                    ))}
                    {getEventsForDay(currentDate.getDate()).length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                         <div className="w-16 h-1 bg-white/20 rounded-full mb-4" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-center">No events scheduled</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* MODAL EVENTO */}
        {isEventModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
             <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl relative">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />

                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] flex items-center gap-2">
                       <CalendarIcon size={12} /> Management
                    </span>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                      {editingEvent ? 'Edit Event' : 'New Event'}
                    </h3>
                  </div>
                  <button onClick={closeEventModal} className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white border-none cursor-pointer transition-colors hover:bg-white/10 hover:rotate-90 duration-300">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Event Title</label>
                      <input autoFocus className="w-full bg-[#111] border border-white/10 p-6 rounded-[1.5rem] outline-none text-white font-bold text-lg focus:border-[var(--accent-color)] transition-colors placeholder:text-white/10" placeholder="Ex: Client Meeting" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Meeting Link</label>
                      <div className="relative">
                        <LinkIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input className="w-full bg-[#111] border border-white/10 p-6 pl-16 rounded-[1.5rem] outline-none text-white text-sm focus:border-[var(--accent-color)] transition-colors placeholder:text-white/10" placeholder="https://..." value={newEventLink} onChange={e => setNewEventLink(e.target.value)} />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Assign To</label>
                      <div className="relative">
                         <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                         <select className="w-full bg-[#111] border border-white/10 p-6 pl-16 rounded-[1.5rem] outline-none text-white text-xs font-black uppercase tracking-widest cursor-pointer appearance-none hover:bg-white/5 transition-colors" value={selectedUserForEvent} onChange={e => setSelectedUserForEvent(e.target.value)}>
                            <option value="">Personal (Only Me)</option>
                            {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                         </select>
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">▼</div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <button onClick={closeEventModal} className="flex-1 py-6 rounded-[1.5rem] border border-white/10 font-black text-[10px] uppercase tracking-widest text-white cursor-pointer bg-transparent hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={saveEvent} className="flex-2 py-6 rounded-[1.5rem] bg-[var(--accent-color)] text-white font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-[0_10px_40px_-10px_var(--accent-color)] hover:brightness-110 hover:-translate-y-1 transition-all">
                    {editingEvent ? 'Save Changes' : 'Schedule Event'}
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}