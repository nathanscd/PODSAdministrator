import { useState, useEffect, useMemo, memo } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Opportunity } from "../types";
import { Plus, Search, ExternalLink, CheckCircle2, X, Filter, ChevronDown, ChevronRight, Edit3, BookOpen, MoreHorizontal, Trash2, ListTodo } from "lucide-react";
import PageTransition from "../components/PageTransition";
import OpportunityForm from "../components/OpportunityForm";
import CsvImporter from "../components/CsvImporter";

// --- TIPO PARA O MENU FLUTUANTE ---
interface DropdownConfig {
  x: number;
  y: number;
  opp: Opportunity;
}

// --- LINHA OTIMIZADA ---
const OpportunityRow = memo(({ opp, onOpenMenu }: { opp: Opportunity, onOpenMenu: (e: React.MouseEvent, opp: Opportunity) => void }) => {
  
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("bad") || s.includes("ruim") || s.includes("lost") || s.includes("cancel")) 
      return "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 text-red-400";
    if (s.includes("attention") || s.includes("atenção") || s.includes("hold")) 
      return "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-400";
    if (s.includes("good") || s.includes("bom") || s.includes("won")) 
      return "bg-green-500/5 border-green-500/20 hover:bg-green-500/10 text-green-400";
    return "bg-[var(--card-bg)] hover:bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)]"; 
  };

  const styleClass = getStatusColor(opp.status);

  return (
    <tr className={`transition-all group border-y ${styleClass}`}>
      <td className={`px-4 py-4 sticky left-0 z-20 w-[50px] text-center ${styleClass.replace('hover:', '')} group-hover:bg-[#1a1a1a]`}>
        <button 
          onClick={(e) => onOpenMenu(e, opp)}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-primary)] transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </td>

      <td className={`px-8 py-4 sticky left-[50px] z-10 font-bold text-sm w-[350px] truncate shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${styleClass.replace('hover:', '')} group-hover:bg-[#1a1a1a]`}>
        {opp.description}
      </td>
      <td className="px-6 text-[10px] font-black uppercase opacity-70 truncate max-w-[150px]" title={opp.technicalSalesGroup}>{opp.technicalSalesGroup}</td>
      <td className="px-6 text-xs font-bold">{opp.utility}</td>
      <td className="px-6 text-xs font-bold">{opp.kam}</td>
      <td className="px-6 text-xs font-bold">{opp.product}</td>
      <td className="px-6 text-[9px] font-black uppercase">
         <span className={`px-2 py-1 rounded-md border border-white/10 ${styleClass.replace('bg-', 'bg-opacity-20 ')}`}>{opp.status}</span>
      </td>
      <td className="px-6 text-[9px] font-black uppercase">{opp.businessStages}</td>
      <td className="px-6 text-[9px] font-black uppercase">
        <span className={opp.priority === 'Alta' || opp.priority === 'Crítica' ? 'text-red-500 animate-pulse' : ''}>{opp.priority}</span>
      </td>
      <td className="px-6 text-[11px] font-bold">{opp.progress}%</td>
      <td className="px-6 font-mono text-xs">{opp.quantity}</td>
      <td className="px-6 font-mono text-xs">{opp.scp?.toLocaleString('pt-BR')}</td>
      <td className="px-6">{opp.homologated ? <CheckCircle2 size={16} className="text-green-500"/> : <X size={16} className="opacity-10"/>}</td>
      <td className="px-6 text-xs font-bold">{opp.country}</td>
      <td className="px-6 text-[9px] font-black uppercase">{opp.ecosystem}</td>
      <td className="px-6 text-xs font-bold opacity-60">{opp.yearStart}</td>
      <td className="px-6 text-xs font-bold opacity-60">{opp.yearEnd}</td>
      <td className="px-6 text-xs font-bold">{opp.hqInterface}</td>
      <td className="px-6 text-xs font-bold truncate max-w-[150px]">{opp.reasonWinLoss}</td>
      <td className="px-6 text-xs font-bold truncate max-w-[150px]">{opp.competitors}</td>
      <td className="px-6 text-xs font-bold">{opp.productTeam}</td>
      <td className="px-6 text-xs font-bold">{opp.salesManagement}</td>
      <td className="px-6 text-[10px] font-mono opacity-50">{opp.lastCustomerDiscussion}</td>
      <td className="px-6">
        {opp.files && <ExternalLink size={14} className="text-[var(--accent-color)]" />}
      </td>
    </tr>
  );
});

// --- PÁGINA PRINCIPAL ---

export default function OpportunityPage() {
  const { isAdmin, userGroup } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [filterUtility, setFilterUtility] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  
  // States de Seleção
  const [dropdownConfig, setDropdownConfig] = useState<DropdownConfig | null>(null); // Menu Dropdown
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null); // Form de Edição
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setDropdownConfig(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "opportunities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
      setOpportunities(data);
    });
    return unsubscribe;
  }, []);

  const uniqueUtilities = useMemo(() => Array.from(new Set(opportunities.map(o => o.utility))).sort().filter(Boolean), [opportunities]);

  // Abre o menu na posição do clique
  const handleOpenMenu = (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation(); // Impede que feche imediatamente
    const rect = (e.target as Element).getBoundingClientRect();
    setDropdownConfig({
      x: rect.left,
      y: rect.bottom + 5, // Um pouco abaixo do botão
      opp
    });
  };

  const handleOpenNotes = async (opp: Opportunity) => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "pages"), 
      where("linkedOpportunityId", "==", opp.id),
      where("ownerId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      navigate(`/page/${querySnapshot.docs[0].id}`);
    } else {
      const newPage = {
        title: `Notes: ${opp.description}`,
        content: `<h1>${opp.description}</h1><p>Notes regarding this opportunity...</p>`,
        ownerId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        linkedOpportunityId: opp.id
      };
      const docRef = await addDoc(collection(db, "pages"), newPage);
      navigate(`/page/${docRef.id}`);
    }
  };

  const createOpportunity = async () => {
    if (!auth.currentUser) return alert("Login necessário");
    // Se for admin, não atribui grupo automaticamente, senão atribui o grupo do usuário
    const assignedGroup = isAdmin ? "" : (userGroup || "Unassigned");
    
    const newOppData: Omit<Opportunity, 'id'> = {
      description: "Nova Oportunidade", technicalSalesGroup: assignedGroup, utility: "", files: "", yearStart: new Date().getFullYear(), yearEnd: new Date().getFullYear() + 1,
      hqInterface: "", kam: "", status: "Draft", product: "", priority: "Média",
      businessStages: "Prospecção", reasonWinLoss: "", quantity: 0, scp: 0,
      remember: "", homologated: false, reasonHomologated: "", country: "Brasil",
      ecosystem: "", progress: 0, lastCustomerDiscussion: new Date().toISOString().split('T')[0],
      observation: "", competitors: "", productTeam: "", salesManagement: "",
      ownerId: auth.currentUser.uid
    };
    try {
      const docRef = await addDoc(collection(db, "opportunities"), newOppData);
      setEditingOpp({ id: docRef.id, ...newOppData });
    } catch (error) { console.error(error); }
  };

  const updateOpp = async (id: string, updates: Partial<Opportunity>) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    await updateDoc(doc(db, "opportunities", id), updates);
  };

  const deleteOpp = async (id: string) => {
    if(confirm("Remover permanentemente?")) {
      await deleteDoc(doc(db, "opportunities", id));
      setEditingOpp(null);
    }
  };

  const groupedData = useMemo(() => {
    const filtered = opportunities.filter(opp => {
      const matchesSearch = opp.description?.toLowerCase().includes(search.toLowerCase()) || opp.utility?.toLowerCase().includes(search.toLowerCase());
      const matchesUtility = filterUtility === "all" || opp.utility === filterUtility;
      const oppGroupLower = (opp.technicalSalesGroup || "").toLowerCase();
      
      // ALTERAÇÃO: Removemos a lógica de isAdmin/userGroup para visualização.
      // Agora o filtro funciona apenas se o usuário selecionar algo no dropdown "Group".
      const matchesGroup = filterGroup === "all" || oppGroupLower.includes(filterGroup.toLowerCase());
      
      return matchesSearch && matchesUtility && matchesGroup;
    });

    const groups: Record<string, Opportunity[]> = {};
    filtered.forEach(opp => {
      const groupName = opp.technicalSalesGroup || "Unassigned Group";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(opp);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (a.utility || "").localeCompare(b.utility || ""));
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [opportunities, search, filterUtility, filterGroup]); // Dependências de usuário removidas

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: prev[groupName] === false ? true : false }));
  };

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 !p-0 bg-[var(--bg-app)] min-h-screen flex flex-col">
        
        <div className="fixed bottom-6 right-6 z-[9999] flex gap-4 opacity-0 hover:opacity-100 transition-opacity">
           <CsvImporter />
        </div>

        <header className="z-1000 pt-20 pb-10 px-8 lg:px-20 bg-[var(--card-bg)]/80 backdrop-blur-xl shrink-0 z-20 sticky top-0 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-end index z-1000">
            <div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">AMI Opportunities</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">Opportunities overview</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-[var(--bg-app)] px-4 py-2 rounded-2xl border border-[var(--border-color)]">
                <Search size={16} className="opacity-20 text-[var(--text-primary)]" />
                <input placeholder="SEARCH..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-48 text-[var(--text-primary)]" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={createOpportunity} className="bg-[var(--accent-color)] text-white p-4 rounded-2xl hover:scale-105 transition-all border-none shadow-none cursor-pointer"><Plus size={24} /></button>
            </div>
          </div>
          <div className="flex gap-8 mt-6">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <Filter size={14} className="text-[var(--text-primary)]" />
              <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-[var(--text-primary)]" onChange={(e) => setFilterUtility(e.target.value)}>
                <option value="all" className="bg-[var(--bg-app)]">Filter: All Customers</option>
                {uniqueUtilities.map(u => <option key={u} value={u} className="bg-[var(--bg-app)]">{u}</option>)}
              </select>
            </div>
            {/* Opcional: Você pode querer adicionar o filtro de grupo aqui se ele não existir em outro lugar da UI, 
                já que removemos a filtragem automática por usuário */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
               <Filter size={14} className="text-[var(--text-primary)]" />
               <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-[var(--text-primary)]" onChange={(e) => setFilterGroup(e.target.value)}>
                 <option value="all" className="bg-[var(--bg-app)]">Filter: All Groups</option>
                 <option value="1st Group" className="bg-[var(--bg-app)]">1st Group</option>
                 <option value="2nd Group" className="bg-[var(--bg-app)]">2nd Group</option>
                 <option value="3rd Group" className="bg-[var(--bg-app)]">3rd Group</option>
               </select>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar p-0">
          <div className="min-w-[4000px]">
            <table className="w-full text-left border-separate border-spacing-y-0">
              <thead className="sticky top-0 z-20 bg-[var(--bg-app)] shadow-sm">
                <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  <th className="px-4 py-4 sticky left-0 bg-[var(--bg-app)] z-30 border-b border-[var(--border-color)] w-[50px]">Action</th>
                  <th className="px-8 py-4 sticky left-[50px] bg-[var(--bg-app)] z-30 border-b border-[var(--border-color)]">Description</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Group</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Utility</th>
                  <th className="px-6 border-b border-[var(--border-color)]">KAM</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Product</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Status</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Stage</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Priority</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Progress</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Qty</th>
                  <th className="px-6 border-b border-[var(--border-color)]">SCP (R$)</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Homologated</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Country</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Ecosystem</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Start</th>
                  <th className="px-6 border-b border-[var(--border-color)]">End</th>
                  <th className="px-6 border-b border-[var(--border-color)]">HQ Support</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Reason</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Competitors</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Product Team</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Sales Mgmt</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Last Discussion</th>
                  <th className="px-6 border-b border-[var(--border-color)]">Link</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map(([groupName, groupOpps]) => (
                  <>
                    <tr key={`header-${groupName}`} className="bg-[var(--bg-app)] sticky left-0">
                      <td colSpan={25} className="px-8 py-6 sticky left-0 bg-[var(--bg-app)] z-10 border-b border-[var(--border-color)]">
                        <button onClick={() => toggleGroup(groupName)} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                           <div className="p-1 rounded bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                             {expandedGroups[groupName] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                           </div>
                           <span className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
                             {groupName || "Sem Grupo"} <span className="ml-3 text-xs opacity-40 not-italic font-normal">({groupOpps.length})</span>
                           </span>
                        </button>
                      </td>
                    </tr>
                    {expandedGroups[groupName] !== false && groupOpps.map(opp => (
                       <OpportunityRow key={opp.id} opp={opp} onOpenMenu={handleOpenMenu} />
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MENU DROPDOWN FLUTUANTE (ATUALIZADO) --- */}
        {dropdownConfig && (
          <div 
            className="fixed z-[9999] bg-[#1a1a1a] border border-[var(--border-color)] rounded-xl shadow-2xl py-2 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{ 
              top: Math.min(dropdownConfig.y, window.innerHeight - 150), // Evita sair da tela embaixo
              left: Math.min(dropdownConfig.x, window.innerWidth - 200) // Evita sair da tela na direita
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-white/5 mb-1">
              <p className="text-[9px] uppercase font-black opacity-50 truncate">{dropdownConfig.opp.utility}</p>
            </div>

            <button 
              onClick={() => { setEditingOpp(dropdownConfig.opp); setDropdownConfig(null); }}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm font-bold text-[var(--text-primary)]"
            >
              <Edit3 size={14} className="text-blue-400" /> Edit Opportunity
            </button>

            {/* Link para Task Trackers */}
            <button 
              onClick={() => { navigate('/task-tracker'); setDropdownConfig(null); }}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm font-bold text-[var(--text-primary)]"
            >
              <ListTodo size={14} className="text-orange-400" /> Task Trackers
            </button>

            <button 
              onClick={() => { handleOpenNotes(dropdownConfig.opp); setDropdownConfig(null); }}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-sm font-bold text-[var(--text-primary)]"
            >
              <BookOpen size={14} className="text-purple-400" /> Open Notes
            </button>
            
            <div className="h-px bg-white/5 my-1" />
            
            <button 
               onClick={() => { deleteOpp(dropdownConfig.opp.id); setDropdownConfig(null); }}
               className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 text-red-500 transition-colors text-sm font-bold"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        {/* FORMULÁRIO DE EDIÇÃO */}
        {editingOpp && (
          <OpportunityForm 
            opp={editingOpp} 
            allOpportunities={opportunities}
            onClose={() => setEditingOpp(null)} 
            onUpdate={updateOpp}
            onDelete={deleteOpp}
          />
        )}
      </div>
    </PageTransition>
  );
}