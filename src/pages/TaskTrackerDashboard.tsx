import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, where, getDocs, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { logAction } from "../utils/systemLogger";
import { useNavigate } from "react-router-dom";
import { TaskTracker, Opportunity } from "../types";
import { Plus, ListTodo, Search, Folder, Trash2, X, FileText, Loader2 } from "lucide-react"; 
import PageTransition from "../components/PageTransition";

export default function TaskTrackerDashboard() {
  const { user, userGroup, isAdmin } = useAuth(); 
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [trackers, setTrackers] = useState<TaskTracker[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewFolderId, setViewFolderId] = useState<string | null>(null);
  
  const [selectedOppId, setSelectedOppId] = useState("");
  const [trackerTitle, setTrackerTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    let qTrackers;

    if (isAdmin) {
      qTrackers = query(collection(db, "taskTrackers"), orderBy("createdAt", "desc"));
    } else {
      qTrackers = query(collection(db, "taskTrackers"), where("ownerId", "==", user.uid));
    }

    const unsubTrackers = onSnapshot(qTrackers, (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()} as TaskTracker));
      
      if (!isAdmin) {
        data.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
      }
      setTrackers(data);
    }, (error) => {
        console.error("Erro Trackers:", error);
        addToast("Erro ao carregar trackers.", "error");
    });

    let unsubOppsList: (() => void)[] = [];

    if (isAdmin) {
      const qAllOpps = query(collection(db, "opportunities"));
      const unsub = onSnapshot(qAllOpps, (s) => {
        setOpportunities(s.docs.map(d => ({id: d.id, ...d.data()} as Opportunity)));
      });
      unsubOppsList.push(unsub);

    } else {
      const myUid = user.uid;
      const myGroup = userGroup || "Unassigned";
      
      let localOwnerOpps: Opportunity[] = [];
      let localGroupOpps: Opportunity[] = [];

      const updateMergedOpps = () => {
        const map = new Map();
        [...localOwnerOpps, ...localGroupOpps].forEach(o => map.set(o.id, o));
        setOpportunities(Array.from(map.values()));
      };

      const qOwner = query(collection(db, "opportunities"), where("ownerId", "==", myUid));
      unsubOppsList.push(onSnapshot(qOwner, (s) => {
        localOwnerOpps = s.docs.map(d => ({id: d.id, ...d.data()} as Opportunity));
        updateMergedOpps();
      }));

      const qGroup = query(collection(db, "opportunities"), where("technicalSalesGroup", "==", myGroup));
      unsubOppsList.push(onSnapshot(qGroup, (s) => {
        localGroupOpps = s.docs.map(d => ({id: d.id, ...d.data()} as Opportunity));
        updateMergedOpps();
      }, (e) => console.warn("Erro ao buscar grupo opps:", e)));
    }

    return () => {
      unsubTrackers();
      unsubOppsList.forEach(u => u());
    };
  }, [user, userGroup, isAdmin]);

  const groupedTrackers = useMemo(() => {
    const groups: Record<string, TaskTracker[]> = {};
    trackers.forEach(t => {
      if (!groups[t.opportunityId]) groups[t.opportunityId] = [];
      groups[t.opportunityId].push(t);
    });
    return groups;
  }, [trackers]);

  const handleCreate = async () => {
    if (!selectedOppId || !auth.currentUser) return;
    const opp = opportunities.find(o => o.id === selectedOppId);
    if (!opp) return;

    try {
      setIsCreating(true);
      const title = trackerTitle || `Tracker ${new Date().toLocaleDateString()}`;
      const newTracker = {
        opportunityId: opp.id,
        opportunityName: opp.description,
        opportunityUtility: opp.utility,
        ownerId: auth.currentUser.uid,
        title: title,
        tasks: [], 
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "taskTrackers"), newTracker);
      
      logAction("Criou Tracker", `${title} em ${opp.utility}`);
      addToast("Tracker criado com sucesso!", "success");

      setShowNewModal(false);
      setTrackerTitle("");
      setViewFolderId(opp.id); 
    } catch (error) {
      console.error("Erro ao criar:", error);
      addToast("Erro ao criar tracker.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTracker = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este Tracker?")) {
      try {
        await deleteDoc(doc(db, "taskTrackers", id));
        logAction("Removeu Tracker", id);
        addToast("Tracker removido.", "info");

        const currentFolderTrackers = trackers.filter(t => t.opportunityId === viewFolderId);
        if (currentFolderTrackers.length <= 1) setViewFolderId(null);
      } catch (error) {
        addToast("Erro ao remover tracker.", "error");
      }
    }
  };

  const deleteFolder = async (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (confirm("Isso excluirá TODOS os trackers desta pasta. Continuar?")) {
      try {
        const batch = writeBatch(db);
        const q = query(collection(db, "taskTrackers"), where("opportunityId", "==", oppId));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        
        logAction("Removeu Pasta de Trackers", oppId);
        addToast("Pasta excluída com sucesso.", "info");
        
        setViewFolderId(null);
      } catch (error) {
        console.error("Erro ao deletar pasta:", error);
        addToast("Erro ao excluir pasta.", "error");
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-16">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Trackers</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              Gestão {isAdmin ? "(Modo Admin)" : "Pessoal"}
            </p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[var(--accent-color)] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            <Plus size={18} /> Novo Tracker
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedTrackers).map(([oppId, groupTrackers]) => {
            const firstTracker = groupTrackers[0];
            return (
              <div 
                key={oppId} 
                onClick={() => setViewFolderId(oppId)}
                className="group bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-[2rem] cursor-pointer hover:border-[var(--accent-color)] transition-all hover:-translate-y-1 relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-100 transition-opacity text-[var(--accent-color)]">
                  <Folder size={60} />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-app)] px-2 py-1 rounded text-[var(--text-secondary)]">
                    {firstTracker.opportunityUtility || "N/A"}
                  </span>
                  <button onClick={(e) => deleteFolder(e, oppId)} className="p-2 -mr-2 -mt-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-full">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-2 mb-2 pr-8 leading-tight h-12">
                  {firstTracker.opportunityName || "Sem Nome"}
                </h3>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 mt-4">
                  <ListTodo size={12} />
                  {groupTrackers.length} {groupTrackers.length === 1 ? 'Tracker' : 'Trackers'}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedTrackers).length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <p className="text-sm font-black uppercase tracking-widest">Nenhuma pasta encontrada.</p>
            </div>
          )}
        </div>

        {viewFolderId && groupedTrackers[viewFolderId] && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] w-full max-w-4xl shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)]">
                    {groupedTrackers[viewFolderId][0].opportunityName}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mt-1">
                    {groupedTrackers[viewFolderId][0].opportunityUtility} • Arquivos
                  </p>
                </div>
                <button onClick={() => setViewFolderId(null)} className="p-3 bg-[var(--bg-app)] rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-1">
                {groupedTrackers[viewFolderId].map(tracker => (
                  <div key={tracker.id} onClick={() => navigate(`/task-tracker/${tracker.id}`)} className="p-5 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl cursor-pointer hover:border-[var(--accent-color)] transition-all group flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <FileText size={24} className="text-[var(--accent-color)] opacity-50 group-hover:opacity-100 transition-opacity" />
                      <button onClick={(e) => deleteTracker(e, tracker.id)} className="text-red-500 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{tracker.title || "Sem Título"}</h4>
                      <p className="text-[10px] uppercase font-black opacity-40 mt-1">{tracker.tasks?.length || 0} Tarefas</p>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => { setSelectedOppId(viewFolderId); setShowNewModal(true); }} className="p-5 border border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] transition-all h-32">
                  <Plus size={24} />
                  <span className="text-[10px] font-black uppercase">Adicionar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in zoom-in-95">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-black italic uppercase mb-6 text-[var(--text-primary)]">Novo Tracker</h3>
              <div className="space-y-4">
                {!viewFolderId && (
                  <div>
                    <label className="text-xs font-bold uppercase opacity-70 text-[var(--text-secondary)] mb-1 block">Oportunidade</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 opacity-30 text-[var(--text-primary)]" size={16} />
                      <select className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 pl-10 rounded-xl outline-none focus:border-[var(--accent-color)] text-sm text-[var(--text-primary)] appearance-none cursor-pointer" value={selectedOppId} onChange={(e) => setSelectedOppId(e.target.value)}>
                        <option value="">Selecione...</option>
                        {opportunities.map(o => (
                          <option key={o.id} value={o.id}>{o.utility} - {o.description}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                   <label className="text-xs font-bold uppercase opacity-70 text-[var(--text-secondary)] mb-1 block">Nome do Tracker</label>
                   <input type="text" placeholder="Ex: Instalação Fase 1" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none focus:border-[var(--accent-color)] text-sm text-[var(--text-primary)]" value={trackerTitle} onChange={(e) => setTrackerTitle(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] hover:bg-white/5 font-bold text-xs uppercase text-[var(--text-secondary)] cursor-pointer" disabled={isCreating}>Cancelar</button>
                <button onClick={handleCreate} disabled={!selectedOppId || isCreating} className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs uppercase hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer">
                  {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  {isCreating ? "Criar" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}