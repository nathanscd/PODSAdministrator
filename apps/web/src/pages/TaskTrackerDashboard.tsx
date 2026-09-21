import { useState, useEffect, useMemo, useRef } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, where, getDocs, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { logAction } from "../utils/systemLogger";
import { useNavigate } from "react-router-dom";
import { TaskTracker, Opportunity } from "../types";
import { Plus, Search, Folder, Trash2, X, FileText, Loader2, LayoutList, ChevronRight, ChevronDown, Check } from "lucide-react"; 
import PageTransition from "../components/PageTransition";
import { useLang } from "../contexts/LangContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTitle } from "../hooks/useTitle";
import { Input } from "@base-ui/react";

export default function TaskTrackerDashboard() {
  const { user, isAdmin } = useAuth(); 
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { t } = useLang();
  useTitle( `${t.sidebar.taskTrackers} - PODS Administrator`);

  const [trackers, setTrackers] = useState<TaskTracker[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewFolderId, setViewFolderId] = useState<string | null>(null);
  
  const [selectedOppId, setSelectedOppId] = useState("");
  const [trackerTitle, setTrackerTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isOppDropdownOpen, setIsOppDropdownOpen] = useState(false);
  const [oppSearchQuery, setOppSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qTrackers = query(collection(db, "taskTrackers"), orderBy("createdAt", "desc"));
    
    const unsubTrackers = onSnapshot(qTrackers, (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()} as TaskTracker));
      setTrackers(data);
    }, (error) => {
        console.error(error);
        addToast(t?.trackerDashboard?.messages?.loadError || "Error loading trackers", "error");
    });

    const qAllOpps = query(collection(db, "opportunities"));
    const unsubOpps = onSnapshot(qAllOpps, (s) => {
      setOpportunities(s.docs.map(d => ({id: d.id, ...d.data()} as Opportunity)));
    });

    return () => {
      unsubTrackers();
      unsubOpps();
    };
  }, [t, addToast]);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOppDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedTrackers = useMemo(() => {
    const groups: Record<string, TaskTracker[]> = {};
    const filteredTrackers = trackers.filter(t => 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredTrackers.forEach(t => {
      if (!groups[t.opportunityId]) groups[t.opportunityId] = [];
      groups[t.opportunityId].push(t);
    });
    return groups;
  }, [trackers, searchQuery]);

  // Filtro de oportunidades para a pesquisa no modal
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => 
      o.description.toLowerCase().includes(oppSearchQuery.toLowerCase()) ||
      o.utility.toLowerCase().includes(oppSearchQuery.toLowerCase())
    );
  }, [opportunities, oppSearchQuery]);

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
        ownerName: user?.displayName || auth.currentUser.email || "Unknown User",
        title: title,
        tasks: [], 
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "taskTrackers"), newTracker);
      
      logAction("Created Tracker", `${title} in ${opp.utility}`);
      addToast(t?.trackerDashboard?.messages?.createdSuccess || "Tracker created successfully", "success");

      closeModal();
      setViewFolderId(opp.id); 
    } catch (error) {
      console.error(error);
      addToast(t?.trackerDashboard?.messages?.createError || "Error creating tracker", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTracker = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t?.trackerDashboard?.messages?.confirmDelete || "Are you sure you want to delete this tracker?")) {
      try {
        await deleteDoc(doc(db, "taskTrackers", id));
        logAction("Removed Tracker", id);
        addToast(t?.trackerDashboard?.messages?.deleteSuccess || "Tracker deleted", "info");

        const currentFolderTrackers = trackers.filter(t => t.opportunityId === viewFolderId);
        if (currentFolderTrackers.length <= 1) setViewFolderId(null);
      } catch (error) {
        addToast(t?.trackerDashboard?.messages?.deleteError || "Error deleting tracker", "error");
      }
    }
  };

  const deleteFolder = async (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (confirm(t?.trackerDashboard?.messages?.confirmDeleteFolder || "Are you sure you want to delete this entire folder and all its trackers?")) {
      try {
        const batch = writeBatch(db);
        const q = query(collection(db, "taskTrackers"), where("opportunityId", "==", oppId));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        
        logAction("Removed Tracker Folder", oppId);
        addToast(t?.trackerDashboard?.messages?.deleteFolderSuccess || "Folder deleted", "info");
        
        setViewFolderId(null);
      } catch (error) {
        console.error(error);
        addToast(t?.trackerDashboard?.messages?.deleteFolderError || "Error deleting folder", "error");
      }
    }
  };

  const closeModal = () => {
    setShowNewModal(false);
    setTrackerTitle("");
    setSelectedOppId("");
    setOppSearchQuery("");
    setIsOppDropdownOpen(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6 font-sans">
        
        <header className="flex flex-col md:flex-row  justify-between items-start md:items-end gap-6 mb-12 border-b border-[var(--border-color)] pb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              {t?.trackerDashboard?.title || "Task Trackers"}
            </h1>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {t?.trackerDashboard?.subtitle || "Manage your public workspace trackers"}
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative group">
              <Input
                type="text"
                placeholder="Search trackers..."
                className="w-full h-8 pl-2 pr-12 text-xs font-medium bg-[var(--muted)]/60 hover:bg-[var(--muted)]/90 focus:bg-[var(--card)] border border-[var(--border)]/40 rounded-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/40 focus:ring-2 focus:ring-[var(--primary)]/10 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <a 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent h-fit w-fit border-none cursor-pointer hover:bg-[var(--accent-color)]/10 rounded-full transition-colors-duration-300"
                >
                  <X size={15} className="text-[var(--text-secondary)]" />
                </a>
              )}
            </div>

            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setSelectedOppId(""); setShowNewModal(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--accent-color)] text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer border-none shadow-sm hover:shadow-md hover:brightness-110 transition-all"
            >
              <Plus size={18} /> {t?.trackerDashboard?.newTracker || "New Tracker"}
            </motion.button>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedTrackers).map(([oppId, groupTrackers]) => {
            const firstTracker = groupTrackers[0];
            return (
              <div 
                key={oppId} 
                onClick={() => setViewFolderId(oppId)}
                className="group bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-2xl cursor-pointer hover:border-[var(--accent-color)]/50 hover:shadow-sm transition-all flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md">
                    {firstTracker.opportunityUtility || "N/A"}
                  </span>
                  {(isAdmin || groupTrackers.some(t => t.ownerId === auth.currentUser?.uid)) && (
                    <button onClick={(e) => deleteFolder(e, oppId)} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                    {firstTracker.opportunityName || t?.trackerDashboard?.untitled || "Untitled"}
                  </h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <Folder size={14} />
                    {groupTrackers.length} {groupTrackers.length === 1 ? (t?.trackerDashboard?.trackerCountSingular || "Tracker") : (t?.trackerDashboard?.trackerCount || "Trackers")}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:border-[var(--accent-color)] transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}

          {Object.keys(groupedTrackers).length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center mb-4 shadow-sm text-[var(--text-secondary)]">
                <Folder size={24} />
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{t?.trackerDashboard?.noFolders || "No trackers found"}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Create a new tracker to get started.</p>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {viewFolderId && groupedTrackers[viewFolderId] && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewFolderId(null)} />
              
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-3xl w-full max-w-3xl shadow-2xl h-[80vh] flex flex-col relative z-10 overflow-hidden">
                
                <div className="bg-[var(--card-bg)] px-8 py-6 border-b border-[var(--border-color)] flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-[var(--text-primary)]">
                      {groupedTrackers[viewFolderId][0].opportunityName}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                      <Folder size={14} className="text-[var(--accent-color)]" /> {groupedTrackers[viewFolderId][0].opportunityUtility}
                    </p>
                  </div>
                  <button onClick={() => setViewFolderId(null)} className="p-2 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-color)]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                  
                  <button onClick={() => { setSelectedOppId(viewFolderId); setShowNewModal(true); }} className="w-full p-4 border border-dashed border-[var(--border-color)] bg-transparent rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all cursor-pointer">
                    <Plus size={18} /> {t?.trackerDashboard?.add || "Add new tracker"}
                  </button>

                  {groupedTrackers[viewFolderId].map(tracker => (
                    <div key={tracker.id} onClick={() => navigate(`/task-tracker/${tracker.id}`)} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--accent-color)]/50 transition-all gap-4">
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 group-hover:text-[var(--accent-color)] transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{tracker.title || t?.trackerDashboard?.untitled || "Untitled Tracker"}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1.5">
                              <LayoutList size={12} /> {tracker.tasks?.length || 0} tasks
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                            <span className="truncate flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[var(--accent-color)] to-orange-400 flex items-center justify-center text-white text-[8px] font-black shrink-0">
                                {tracker.ownerName ? tracker.ownerName.charAt(0).toUpperCase() : "U"}
                              </span>
                              {tracker.ownerName || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0 gap-2">
                         {(isAdmin || tracker.ownerId === auth.currentUser?.uid) && (
                          <button onClick={(e) => deleteTracker(e, tracker.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="p-2 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-colors">
                           <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNewModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-visible" data-lenis-prevent>
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    {t?.trackerDashboard?.modalTitle || "Create Tracker"}
                  </h3>
                  <button onClick={closeModal} className="p-2 bg-[var(--bg-app)] rounded-lg hover:bg-white/5 border border-transparent hover:border-[var(--border-color)] transition-colors text-[var(--text-secondary)]">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {!viewFolderId && (
                    <div className="space-y-1.5 relative" ref={dropdownRef}>
                      <label className="text-xs font-bold text-[var(--text-secondary)]">{t?.trackerDashboard?.opportunityLabel || "Opportunity"}</label>
                      
                      <div 
                        onClick={() => setIsOppDropdownOpen(!isOppDropdownOpen)}
                        className={`w-full bg-[var(--bg-app)] border px-4 py-3 rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                          isOppDropdownOpen ? 'border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/50'
                        }`}
                      >
                        <span className={`text-sm font-semibold truncate pr-4 ${selectedOppId ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/50'}`}>
                          {selectedOppId 
                            ? `${opportunities.find(o => o.id === selectedOppId)?.utility} - ${opportunities.find(o => o.id === selectedOppId)?.description}`
                            : (t?.trackerDashboard?.selectPlaceholder || "Select an opportunity...")}
                        </span>
                        <ChevronDown size={16} className={`text-[var(--text-secondary)] transition-transform duration-200 shrink-0 ${isOppDropdownOpen ? 'rotate-180 text-[var(--accent-color)]' : ''}`} />
                      </div>

                      {/* Menu Suspenso (Dropdown) */}
                      {isOppDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl shadow-2xl max-h-[280px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-app)] sticky top-0">
                            <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                              <Search size={14} className="text-[var(--text-secondary)] shrink-0" />
                              <input 
                                autoFocus
                                type="text"
                                placeholder="Search by name or utility..."
                                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 font-medium"
                                value={oppSearchQuery}
                                onChange={(e) => setOppSearchQuery(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="overflow-y-auto custom-scrollbar p-1">
                            {filteredOpportunities.length === 0 ? (
                              <div className="p-4 text-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                No results found
                              </div>
                            ) : (
                              filteredOpportunities.map(opp => (
                                <div 
                                  key={opp.id}
                                  onClick={() => {
                                    setSelectedOppId(opp.id);
                                    setIsOppDropdownOpen(false);
                                  }}
                                  className={`px-3 py-3 hover:bg-[var(--bg-app)] rounded-lg cursor-pointer transition-colors flex items-center justify-between group/item ${selectedOppId === opp.id ? 'bg-[var(--accent-color)]/5' : ''}`}
                                >
                                  <div className="flex flex-col min-w-0 pr-2">
                                    <span className={`text-sm font-bold truncate ${selectedOppId === opp.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>
                                      {opp.description}
                                    </span>
                                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                                      {opp.utility}
                                    </span>
                                  </div>
                                  {selectedOppId === opp.id && <Check size={16} className="text-[var(--accent-color)] shrink-0" />}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">{t?.trackerDashboard?.nameLabel || "Tracker Name"}</label>
                      <input type="text" placeholder={t?.trackerDashboard?.namePlaceholder || "E.g., Implementation Phase 1"} className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] px-4 py-3 rounded-xl outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 transition-all" value={trackerTitle} onChange={(e) => setTrackerTitle(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-app)] font-bold text-sm text-[var(--text-primary)] transition-all" disabled={isCreating}>{t?.trackerDashboard?.cancel || "Cancel"}</button>
                  <button onClick={handleCreate} disabled={!selectedOppId || isCreating} className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all border-none">
                    {isCreating ? <Loader2 className="animate-spin" size={16} /> : null}
                    {isCreating ? (t?.trackerDashboard?.create || "Creating...") : (t?.trackerDashboard?.save || "Create")}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}