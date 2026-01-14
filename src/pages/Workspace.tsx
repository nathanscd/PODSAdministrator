import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Opportunity, TaskTracker } from "../types";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, Layout, ListTodo, Calendar as CalendarIcon, 
  ArrowRight, Link as LinkIcon, Plus, Trash2, Clock, MapPin
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'personal' | 'tracker';
  ownerId: string;
}

interface QuickTask {
  id: string;
  text: string;
  done: boolean;
  ownerId: string;
}

export default function Workspace() {
  const { user, userGroup, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myTrackers, setMyTrackers] = useState<TaskTracker[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  
  const [selectedUtility, setSelectedUtility] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newTaskInput, setNewTaskInput] = useState("");

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  useEffect(() => {
    if (!auth.currentUser) return;
    const myUid = auth.currentUser.uid;
    const myGroup = userGroup || "Unassigned";

    // 1. OPORTUNIDADES
    let unsubOppsList: (() => void)[] = [];

    if (isAdmin) {
       // ADMIN: Vê TUDO
       const qAll = query(collection(db, "opportunities"));
       const unsub = onSnapshot(qAll, (s) => {
         setOpportunities(s.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity)));
       });
       unsubOppsList.push(unsub);
    } else {
       // USER: Híbrido (Dono + Grupo)
       let localOwner: Opportunity[] = [];
       let localGroup: Opportunity[] = [];

       const updateMerged = () => {
         const map = new Map();
         [...localOwner, ...localGroup].forEach(o => map.set(o.id, o));
         setOpportunities(Array.from(map.values()));
       };

       const qOwner = query(collection(db, "opportunities"), where("ownerId", "==", myUid));
       unsubOppsList.push(onSnapshot(qOwner, (s) => {
         localOwner = s.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
         updateMerged();
       }));

       const qGroup = query(collection(db, "opportunities"), where("technicalSalesGroup", "==", myGroup));
       unsubOppsList.push(onSnapshot(qGroup, (s) => {
         localGroup = s.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
         updateMerged();
       }));
    }

    // 2. TRACKERS (Para o Calendário)
    let qTrackers;
    if (isAdmin) {
      qTrackers = query(collection(db, "taskTrackers"));
    } else {
      qTrackers = query(collection(db, "taskTrackers"), where("ownerId", "==", myUid));
    }
    const unsubTrackers = onSnapshot(qTrackers, (s) => {
      setMyTrackers(s.docs.map(d => ({ id: d.id, ...d.data() } as TaskTracker)));
    });

    // 3. EVENTOS PESSOAIS & QUICK TASKS (Sempre Privados)
    const qEvents = query(collection(db, "personalEvents"), where("ownerId", "==", myUid));
    const unsubEvents = onSnapshot(qEvents, (s) => {
      setPersonalEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent)));
    });

    const qTasks = query(collection(db, "quickTasks"), where("ownerId", "==", myUid), orderBy("createdAt", "desc"));
    const unsubQuickTasks = onSnapshot(qTasks, (s) => {
      setQuickTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as QuickTask)));
    });

    return () => { 
      unsubOppsList.forEach(u => u());
      unsubTrackers(); 
      unsubEvents(); 
      unsubQuickTasks(); 
    };
  }, [user, userGroup, isAdmin]);

  const utilities = useMemo(() => ["All", ...Array.from(new Set(opportunities.map(o => o.utility))).filter(Boolean).sort()], [opportunities]);

  const filteredOpps = useMemo(() => {
    return selectedUtility === "All" ? opportunities : opportunities.filter(o => o.utility === selectedUtility);
  }, [opportunities, selectedUtility]);

  const statusChartData = useMemo(() => {
    const data = [
      { name: "Good", value: opportunities.filter(o => o.status?.toLowerCase().includes("good")).length },
      { name: "Attention", value: opportunities.filter(o => o.status?.toLowerCase().includes("attention")).length },
      { name: "Bad", value: opportunities.filter(o => o.status?.toLowerCase().includes("bad")).length },
    ];
    return data.filter(d => d.value > 0);
  }, [opportunities]);

  const utilityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => {
      const u = o.utility || "Outros";
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [opportunities]);

  const addEvent = async () => {
    if (!newEventTitle.trim() || !auth.currentUser) return;
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString().split('T')[0];
    await addDoc(collection(db, "personalEvents"), {
      title: newEventTitle,
      date: dateStr,
      type: 'personal',
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewEventTitle("");
    setIsEventModalOpen(false);
  };

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "personalEvents", id));
  };

  const addQuickTask = async () => {
    if (!newTaskInput.trim() || !auth.currentUser) return;
    await addDoc(collection(db, "quickTasks"), {
      text: newTaskInput,
      done: false,
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewTaskInput("");
  };

  const toggleQuickTask = async (task: QuickTask) => {
    await deleteDoc(doc(db, "quickTasks", task.id));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    const pEvents = personalEvents.filter(e => e.date === dateStr);
    const tEvents: CalendarEvent[] = [];
    myTrackers.forEach(t => {
      t.tasks.forEach(task => {
        if (task.plannedEndDate === dateStr) {
          tEvents.push({
            id: task.id,
            title: `[${t.opportunityUtility}] ${task.task}`,
            date: dateStr,
            type: 'tracker',
            ownerId: t.ownerId
          });
        }
      });
    });
    return [...pEvents, ...tEvents];
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setCurrentDate(newDate);
    const events = getEventsForDay(day);
    setSelectedDayEvents(events);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-16 ml-10 -mr-10 -mt-10">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              My Workspace
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              {user?.displayName || "User"} • {isAdmin ? "Administrator Mode" : (userGroup || "General")}
            </p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setIsEventModalOpen(true)} className="flex items-center gap-2 bg-[var(--accent-color)] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:scale-105 transition-transform">
               <Plus size={16}/> Add Event
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 flex flex-col justify-center relative" style={{ height: 300, minHeight: 300 }}>
                <h3 className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Pipeline Status</h3>
                
                {statusChartData.length > 0 ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusChartData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                          {statusChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20 text-xs font-bold uppercase">Sem dados suficientes</div>
                )}
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 flex flex-col justify-center relative" style={{ height: 300, minHeight: 300 }}>
                <h3 className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Top Utilities</h3>
                
                {utilityChartData.length > 0 ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={utilityChartData} layout="vertical" margin={{ left: 0, right: 20, top: 20, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                        <Bar dataKey="value" fill="var(--accent-color)" radius={[0, 4, 4, 0]} barSize={20} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20 text-xs font-bold uppercase">Sem dados suficientes</div>
                )}
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)]">My Opportunities</h3>
                <div className="flex gap-2 overflow-x-auto max-w-[400px] custom-scrollbar pb-2">
                  {utilities.map(u => (
                    <button
                      key={u}
                      onClick={() => setSelectedUtility(u)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                        selectedUtility === u 
                        ? 'bg-[var(--text-primary)] text-[var(--bg-app)] border-[var(--text-primary)]' 
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                      {selectedUtility === "All" && <th className="p-4">Utility</th>}
                      <th className="p-4">Description</th>
                      <th className="p-4">KAM</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4 text-center">Files</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredOpps.slice(0, 10).map(opp => (
                      <tr key={opp.id} className="border-b border-[var(--border-color)] hover:bg-white/5 transition-colors group">
                        {selectedUtility === "All" && (
                          <td className="p-4 font-black uppercase text-[var(--accent-color)]">{opp.utility}</td>
                        )}
                        <td className="p-4 font-bold truncate max-w-[200px]">{opp.description}</td>
                        <td className="p-4 opacity-70">{opp.kam || "-"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--accent-color)]" style={{width: `${opp.progress}%`}} />
                            </div>
                            <span className="text-[9px] font-mono">{opp.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {opp.files ? (
                            <a href={opp.files} target="_blank" rel="noreferrer" className="inline-block p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                              <LinkIcon size={14} />
                            </a>
                          ) : <span className="opacity-20">-</span>}
                        </td>
                      </tr>
                    ))}
                    {filteredOpps.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center opacity-30 text-[10px] uppercase font-bold">Nenhuma oportunidade encontrada.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center">
                <button onClick={() => navigate('/opportunities')} className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">
                  View All Opportunities →
                </button>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8">
               <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)] mb-6">Quick Tasks</h3>
               
               <div className="flex gap-2 mb-6">
                 <input 
                   value={newTaskInput}
                   onChange={(e) => setNewTaskInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
                   placeholder="Add a new task..."
                   className="flex-1 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent-color)]"
                 />
                 <button onClick={addQuickTask} className="bg-[var(--text-primary)] text-[var(--bg-app)] p-3 rounded-xl hover:scale-105 transition-transform">
                   <Plus size={20} />
                 </button>
               </div>

               <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                 {quickTasks.map(task => (
                   <div key={task.id} className="flex items-center gap-3 p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] group hover:border-[var(--accent-color)] transition-colors">
                     <button onClick={() => toggleQuickTask(task)} className="w-5 h-5 rounded border border-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors">
                       <div className="w-full h-full hover:bg-[var(--accent-color)] rounded opacity-0 hover:opacity-100" />
                     </button>
                     <span className="text-sm font-medium flex-1">{task.text}</span>
                   </div>
                 ))}
                 {quickTasks.length === 0 && <p className="text-center opacity-30 text-xs italic">Nenhuma tarefa pendente.</p>}
               </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-black text-white rounded-[2.5rem] p-8 min-h-[600px] border border-white/5 relative overflow-hidden flex flex-col shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><CalendarIcon size={120}/></div>
               
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="hover:opacity-50 text-xl px-2">←</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="hover:opacity-50 text-xl px-2">→</button>
                  </div>
               </div>

               <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black opacity-40 mb-2">
                 <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
               </div>
               <div className="grid grid-cols-7 gap-2 mb-8">
                 {getDaysInMonth(currentDate).map((day) => {
                   const dayEvents = getEventsForDay(day);
                   const hasEvent = dayEvents.length > 0;
                   const isSelected = currentDate.getDate() === day;
                   
                   return (
                     <div 
                       key={day} 
                       onClick={() => handleDayClick(day)}
                       className={`
                         h-10 flex flex-col items-center justify-center rounded-xl text-[10px] font-bold cursor-pointer transition-all relative
                         ${hasEvent ? 'bg-white/20 text-white hover:bg-white/30' : 'hover:bg-white/5 text-white/40'}
                         ${isSelected ? 'ring-2 ring-[var(--accent-color)] bg-[var(--accent-color)]/20' : ''}
                       `}
                     >
                       {day}
                       <div className="flex gap-0.5 mt-1">
                         {dayEvents.some(e => e.type === 'personal') && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                         {dayEvents.some(e => e.type === 'tracker') && <div className="w-1 h-1 rounded-full bg-[var(--accent-color)]" />}
                       </div>
                     </div>
                   );
                 })}
               </div>

               <div className="flex-1 bg-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar border border-white/5">
                 <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent">
                   <h4 className="text-[9px] font-black uppercase tracking-widest opacity-50">
                     Events for {currentDate.getDate()}/{currentDate.getMonth()+1}
                   </h4>
                   <button onClick={() => setIsEventModalOpen(true)} className="p-1 hover:bg-white/10 rounded">
                     <Plus size={14} />
                   </button>
                 </div>

                 {selectedDayEvents.length > 0 || getEventsForDay(currentDate.getDate()).length > 0 ? (
                   <div className="space-y-3">
                     {(selectedDayEvents.length > 0 ? selectedDayEvents : getEventsForDay(currentDate.getDate())).map((e) => (
                       <div key={e.id} className="flex gap-3 items-start border-b border-white/5 pb-2 last:border-0 group">
                         {e.type === 'tracker' ? <Clock size={14} className="text-[var(--accent-color)] shrink-0 mt-0.5"/> : <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5"/>}
                         <div className="flex-1">
                           <p className="text-[10px] font-bold leading-tight">{e.title}</p>
                           <p className="text-[8px] opacity-50 mt-1 uppercase">{e.type === 'tracker' ? 'Tracker Deadline' : 'Personal Event'}</p>
                         </div>
                         {e.type === 'personal' && (
                           <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded">
                             <Trash2 size={12} />
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-30">
                     <p className="text-[9px] uppercase font-bold text-center">No events for this day</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

        </div>

        {isEventModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-black italic uppercase mb-4 text-[var(--text-primary)]">New Event</h3>
                <p className="text-xs mb-4 text-[var(--text-secondary)]">Adding for: {currentDate.toLocaleDateString()}</p>
                <input 
                  autoFocus
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none focus:border-[var(--accent-color)] text-sm mb-6"
                  placeholder="Event title..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                />
                <div className="flex gap-4">
                  <button onClick={() => setIsEventModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] font-bold text-xs uppercase hover:bg-white/5">Cancel</button>
                  <button onClick={addEvent} className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs uppercase hover:scale-105 transition-transform">Add</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}