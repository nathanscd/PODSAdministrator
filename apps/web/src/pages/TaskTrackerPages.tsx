import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TaskTracker, TaskItem } from "../types";
import { ArrowLeft, Plus, Save, Trash2, AlertTriangle, CheckCircle2, Clock, X, Edit3, Link as LinkIcon, Check, FileDown, Loader2, GripVertical } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useLang } from "../contexts/LangContext";
import { useToast } from "../contexts/ToastContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TaskTrackerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { addToast } = useToast();
  
  const [tracker, setTracker] = useState<TaskTracker | null>(null);
  const [isEditingTask, setIsEditingTask] = useState<TaskItem | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "taskTrackers", id), (d) => {
      if (d.exists()) {
        const data = { id: d.id, ...d.data() } as TaskTracker;
        setTracker(data);
        if (!isEditingTitle) setTitleInput(data.title || ""); 
      }
    });
    return unsub;
  }, [id, isEditingTitle]);

  const saveTitle = async () => {
    if (!tracker || !titleInput.trim()) return;
    await updateDoc(doc(db, "taskTrackers", tracker.id), { title: titleInput });
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(tracker?.title || "");
    }
  };

  const saveTask = async (task: TaskItem) => {
    if (!tracker) return;
    const isNew = !tracker.tasks.find(t => t.id === task.id);
    let updatedTasks = isNew ? [...tracker.tasks, task] : tracker.tasks.map(t => t.id === task.id ? task : t);
    
    await updateDoc(doc(db, "taskTrackers", tracker.id), { tasks: updatedTasks });
    setIsEditingTask(null);
  };

  const deleteTask = async (taskId: string) => {
    if (!tracker || !confirm(t.trackerDetail.deleteConfirm)) return;
    const updatedTasks = tracker.tasks.filter(t => t.id !== taskId);
    await updateDoc(doc(db, "taskTrackers", tracker.id), { tasks: updatedTasks });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    if (tracker) {
        const newTasks = [...tracker.tasks];
        const draggedItem = newTasks[draggedIndex];
        newTasks.splice(draggedIndex, 1);
        newTasks.splice(index, 0, draggedItem);
        setTracker({ ...tracker, tasks: newTasks });
        setDraggedIndex(index);
    }
  };

  const handleDrop = async () => {
    if (tracker && draggedIndex !== null) {
        await updateDoc(doc(db, "taskTrackers", tracker.id), { tasks: tracker.tasks });
        setDraggedIndex(null);
    }
  };

  const getStatus = (progress: number) => progress >= 100 ? "Finished" : "Running";
  
  const getDelay = (planned: string, current: string) => {
    const p = new Date(planned).getTime();
    const c = new Date(current).getTime();
    return (p - c) < 0 ? "Delayed" : "Never Delayed";
  };

  const formatDateUTC = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !tracker) return;
    setIsExporting(true);
    addToast("Gerando PDF...", "info");

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1600,
        ignoreElements: (el) => el.tagName === "SVG" || el.closest("svg") !== null,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
              border-color: rgb(0, 0, 0) !important;
              box-shadow: none !important;
              text-shadow: none !important;
              outline-color: rgb(0, 0, 0) !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

    const imgData = canvas.toDataURL("image/png");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // primeira página
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // páginas extras
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pdfHeight;
    }

      pdf.save(`Tracker - ${tracker.title || 'Report'}.pdf`);
      addToast("Exportado com sucesso!", "success");

    } catch (error) {
      console.error(error);
      addToast("Erro ao exportar PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (!tracker) return <div className="p-20 text-center">{t.trackerDetail.loading}</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-10 flex flex-col">
        
        <header className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--border-color)]">
          <button onClick={() => navigate(-1)} className="p-3 rounded-full hover:bg-white/5 border border-[var(--border-color)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <LinkIcon size={12} />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text-secondary)]">
                {t.trackerDetail.linkedOpportunity}: <span className="text-[var(--accent-color)]">{tracker.opportunityUtility}</span> — {tracker.opportunityName}
              </span>
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  className="bg-transparent border-b-2 border-[var(--accent-color)] text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] outline-none w-full max-w-lg pb-1"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={saveTitle} className="p-2 bg-[var(--accent-color)] text-white rounded-lg">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 group cursor-pointer w-fit" onClick={() => setIsEditingTitle(true)}>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                  {tracker.title || t.trackerDetail.untitled}
                </h1>
                <Edit3 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)]" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
            >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                PDF
            </button>

            <button 
                onClick={() => setIsEditingTask({
                id: crypto.randomUUID(),
                task: "", 
                startDate: new Date().toLocaleDateString('en-CA'),
                plannedEndDate: new Date().toLocaleDateString('en-CA'),
                currentEndDate: new Date().toLocaleDateString('en-CA'),
                priority: "Média", responsible: "", team: "Technical", progress: 0
                })}
                className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
            >
                <Plus size={16} /> {t.trackerDetail.newTask}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] shadow-xl">
          <div ref={reportRef} id="pdf-container" className="p-1 bg-[var(--card-bg)]"> 
            <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 bg-[var(--card-bg)] z-10 shadow-sm">
                <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <th className="p-5 border-b border-[var(--border-color)] w-10 text-center hidden-print">#</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.description}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.startDate}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.plannedEnd}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.currentEnd}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.priority}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.responsible}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.team}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.progress}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.status}</th>
                    <th className="p-5 border-b border-[var(--border-color)]">{t.trackerDetail.table.delayControl}</th>
                    <th className="p-5 border-b border-[var(--border-color)] text-center hidden-print">{t.trackerDetail.table.action}</th>
                </tr>
                </thead>
                <tbody className="text-xs">
                {tracker.tasks.map((task, index) => {
                    const status = getStatus(task.progress);
                    const delay = getDelay(task.plannedEndDate, task.currentEndDate);

                    return (
                    <tr 
                        key={task.id} 
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={handleDrop}
                        className={`border-b text-[var(--text-primary)] border-[var(--border-color)] hover:bg-white/5 transition-colors group cursor-move ${draggedIndex === index ? 'opacity-50 bg-white/10' : ''}`}
                    >
                        <td className="p-5 text-center hidden-print">
                            <GripVertical size={14} className="opacity-30 mx-auto" />
                        </td>
                        <td className="p-5 font-bold">{task.task}</td>
                        <td className="p-5 opacity-60 font-mono">{formatDateUTC(task.startDate)}</td>
                        <td className="p-5 opacity-60 font-mono">{formatDateUTC(task.plannedEndDate)}</td>
                        <td className="p-5 font-mono font-bold">{formatDateUTC(task.currentEndDate)}</td>
                        <td className="p-5">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                            task.priority === 'Crítica' ? 'bg-red-500 text-white' : 
                            task.priority === 'Alta' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                            {task.priority}
                        </span>
                        </td>
                        <td className="p-5 font-bold italic">{task.responsible}</td>
                        <td className="p-5 uppercase font-bold text-[10px] opacity-80 text-[var(--text-primary)]">{task.team}</td>
                        <td className="p-5">
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent-color)]" style={{width: `${task.progress}%`}} />
                            </div>
                            <span className="font-mono">{task.progress}%</span>
                        </div>
                        </td>
                        <td className="p-5">
                        {status === "Running" ? 
                            <span className="text-yellow-500 flex items-center gap-1.5 font-bold text-[10px] uppercase"><Clock size={12}/> {t.trackerDetail.status.running}</span> : 
                            <span className="text-green-500 flex items-center gap-1.5 font-bold text-[10px] uppercase"><CheckCircle2 size={12}/> {t.trackerDetail.status.finished}</span>
                        }
                        </td>
                        <td className="p-5">
                        {delay === "Delayed" ?
                            <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded flex items-center gap-1.5 font-black text-[9px] uppercase w-fit"><AlertTriangle size={10}/> {t.trackerDetail.status.delayed}</span> :
                            <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-black text-[9px] uppercase w-fit">{t.trackerDetail.status.neverDelayed}</span>
                        }
                        </td>
                        <td className="p-5 text-center hidden-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsEditingTask(task)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg"><Edit3 size={14}/></button>
                            <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                        </td>
                    </tr>
                    );
                })}
                {tracker.tasks.length === 0 && (
                    <tr>
                    <td colSpan={12} className="p-10 text-center opacity-30 text-sm font-bold uppercase tracking-widest">
                        {t.trackerDetail.empty}
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

        {isEditingTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase">{t.trackerDetail.manageTask}</h3>
                <button onClick={() => setIsEditingTask(null)}><X className="opacity-50 hover:opacity-100" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.description}</label>
                  <input className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none focus:border-[var(--accent-color)]" 
                    value={isEditingTask.task} onChange={e => setIsEditingTask({...isEditingTask, task: e.target.value})} placeholder={t.trackerDetail.describeTask} autoFocus />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.startDate}</label>
                  <input type="date" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.startDate} onChange={e => setIsEditingTask({...isEditingTask, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.plannedEnd}</label>
                  <input type="date" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.plannedEndDate} onChange={e => setIsEditingTask({...isEditingTask, plannedEndDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.currentEnd}</label>
                  <input type="date" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.currentEndDate} onChange={e => setIsEditingTask({...isEditingTask, currentEndDate: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.priority}</label>
                  <select className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.priority} onChange={e => setIsEditingTask({...isEditingTask, priority: e.target.value as any})}>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.responsible}</label>
                  <input className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.responsible} onChange={e => setIsEditingTask({...isEditingTask, responsible: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.team}</label>
                  <select className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none" 
                    value={isEditingTask.team} onChange={e => setIsEditingTask({...isEditingTask, team: e.target.value as any})}>
                    <option value="Technical">Technical</option>
                    <option value="Pre-Sales">Pre-Sales</option>
                    <option value="Post-Sales">Post-Sales</option>
                    <option value="HQ">HQ</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.trackerDetail.table.progress} ({isEditingTask.progress}%)</label>
                  <input type="range" min="0" max="100" className="w-full accent-[var(--accent-color)]" 
                    value={isEditingTask.progress} onChange={e => setIsEditingTask({...isEditingTask, progress: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsEditingTask(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] font-bold text-xs uppercase hover:bg-white/5">{t.trackerDetail.buttons.cancel}</button>
                <button onClick={() => saveTask(isEditingTask)} className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs uppercase hover:opacity-90 flex justify-center items-center gap-2">
                  <Save size={16} /> {t.trackerDetail.buttons.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}