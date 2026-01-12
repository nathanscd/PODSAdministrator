import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { usePages } from "../hooks/usePages";
import { Opportunity } from "../types";
import { Plus, Search, ExternalLink, X, Trash2, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function OpportunityPage() {
  const { isAdmin } = usePages();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [filterUtility, setFilterUtility] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    const q = query(collection(db, "opportunities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
      setOpportunities(data);
    });
    return unsubscribe;
  }, []);

  const createOpportunity = async () => {
    const newOpp: any = {
      description: "Nova Oportunidade",
      technicalSalesGroup: "", utility: "", files: "", yearStart: 2025, yearEnd: 2026,
      hqInterface: "", kam: "", status: "Draft", product: "", priority: "Média",
      businessStages: "Prospecção", reasonWinLoss: "", quantity: 0, scp: 0,
      remember: "", homologated: false, reasonHomologated: "", country: "Brasil",
      ecosystem: "", progress: 0, lastCustomerDiscussion: new Date().toISOString().split('T')[0],
      observation: "", competitors: "", productTeam: "", salesManagement: "",
      ownerId: auth.currentUser?.uid
    };
    const docRef = await addDoc(collection(db, "opportunities"), newOpp);
    setSelectedOpp({ id: docRef.id, ...newOpp });
  };

  const updateOpp = async (id: string, updates: Partial<Opportunity>) => {
    await updateDoc(doc(db, "opportunities", id), updates);
  };

  const filteredData = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = opp.description?.toLowerCase().includes(search.toLowerCase());
      const matchesUtility = filterUtility === "all" || opp.utility === filterUtility;
      // Regra: Lígia só vê o dela, etc. Admin vê tudo.
      const matchesGroup = isAdmin ? (filterGroup === "all" || opp.technicalSalesGroup === filterGroup) : (opp.technicalSalesGroup === "2nd Group - Ligia Taniguchi"); 
      return matchesSearch && matchesUtility && matchesGroup;
    });
  }, [opportunities, search, filterUtility, filterGroup, isAdmin]);

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 !p-0 bg-[var(--bg-app)] min-h-screen flex flex-col">
        
        <header className="pt-20 pb-10 px-8 lg:px-20 bg-[var(--card-bg)]/50 backdrop-blur-xl shrink-0">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter">Opportunities</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">AMI Operational Pipeline</p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-[var(--bg-app)] px-4 py-2 rounded-2xl border border-[var(--border-color)]">
                <Search size={16} className="opacity-20" />
                <input placeholder="BUSCAR..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={createOpportunity} className="bg-[var(--accent-color)] text-white p-4 rounded-2xl hover:scale-105 transition-all border-none shadow-none"><Plus size={24} /></button>
            </div>
          </div>

          <div className="flex gap-6 mt-8">
            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onChange={(e) => setFilterUtility(e.target.value)}>
              <option value="all">Filtro: Todas Utilities</option>
              {Array.from(new Set(opportunities.map(o => o.utility))).filter(Boolean).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {isAdmin && (
              <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onChange={(e) => setFilterGroup(e.target.value)}>
                <option value="all">Filtro: Todos os Grupos</option>
                <option value="1st Group">1st Group</option>
                <option value="2nd Group">2nd Group</option>
                <option value="3rd Group">3rd Group</option>
              </select>
            )}
          </div>
        </header>

        {/* TABELA COM OVERFLOW HORIZONTAL */}
        <div className="flex-1 overflow-auto custom-scrollbar p-8 lg:p-20">
          <div className="min-w-[3000px]"> {/* Força o scroll horizontal para as 25 colunas */}
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-30">
                  <th className="px-6 sticky left-0 bg-[var(--bg-app)] z-10">Description</th>
                  <th className="px-6">Group</th>
                  <th className="px-6">Utility</th>
                  <th className="px-6">Priority</th>
                  <th className="px-6">Stage</th>
                  <th className="px-6">Status</th>
                  <th className="px-6">Progress</th>
                  <th className="px-6">QTY</th>
                  <th className="px-6">SCP</th>
                  <th className="px-6">Homologated</th>
                  <th className="px-6">Country</th>
                  <th className="px-6">Ecosystem</th>
                  <th className="px-6">Years</th>
                  <th className="px-6">KAM</th>
                  <th className="px-6">Product</th>
                  <th className="px-6">Last Discussion</th>
                  <th className="px-6">Files</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((opp) => (
                  <tr key={opp.id} onClick={() => setSelectedOpp(opp)} className="bg-[var(--card-bg)] hover:bg-[var(--bg-app)] transition-all cursor-pointer group">
                    <td className="px-6 py-6 rounded-l-3xl border-y border-l border-[var(--border-color)] sticky left-0 bg-[var(--card-bg)] group-hover:bg-[var(--bg-app)] z-10 font-bold text-sm w-[300px] truncate">{opp.description}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[10px] font-black">{opp.technicalSalesGroup}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-xs font-bold">{opp.utility}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[9px] font-black uppercase">
                       <span className={opp.priority === 'Alta' || opp.priority === 'Crítica' ? 'text-red-500' : ''}>{opp.priority}</span>
                    </td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[9px] font-black uppercase">{opp.businessStages}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[9px] font-black uppercase">{opp.status}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)]">
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--accent-color)]" style={{ width: `${opp.progress}%` }} /></div>
                    </td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] font-mono text-xs">{opp.quantity}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] font-mono text-xs">{opp.scp}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-center">{opp.homologated ? <CheckCircle2 size={16} className="text-green-500"/> : <X size={16} className="opacity-10"/>}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-xs font-bold">{opp.country}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[9px] font-black uppercase">{opp.ecosystem}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[10px] font-bold">{opp.yearStart} - {opp.yearEnd}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-xs font-bold">{opp.kam}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-xs font-bold">{opp.product}</td>
                    <td className="px-6 py-6 border-y border-[var(--border-color)] text-[10px] font-mono opacity-50">{opp.lastCustomerDiscussion}</td>
                    <td className="px-6 py-6 rounded-r-3xl border-y border-r border-[var(--border-color)]">
                      {opp.files ? <ExternalLink size={14} className="text-[var(--accent-color)]" /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR DE EDIÇÃO COM AS 25 PROPRIEDADES */}
        {selectedOpp && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOpp(null)} />
            <div className="relative w-full max-w-3xl bg-[var(--card-bg)] h-full border-l border-[var(--border-color)] p-12 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-start mb-12">
                <div className="w-full">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Edit Opportunity</h2>
                  <input className="w-full bg-transparent border-none outline-none text-xl font-bold text-[var(--accent-color)] mt-4" value={selectedOpp.description} onChange={(e) => updateOpp(selectedOpp.id, { description: e.target.value })} />
                </div>
                <button onClick={() => setSelectedOpp(null)} className="p-2 border-none bg-transparent shadow-none"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* CAMPOS REQUERIDOS (TOTAL 25) */}
                {[
                  { label: "Technical Sales Group", key: "technicalSalesGroup" },
                  { label: "Utility (Customer)", key: "utility" },
                  { label: "KAM", key: "kam" },
                  { label: "Product", key: "product" },
                  { label: "Ecosystem", key: "ecosystem" },
                  { label: "Status", key: "status" },
                  { label: "Business Stage", key: "businessStages" },
                  { label: "HQ Support & Interface", key: "hqInterface" },
                  { label: "Competitors", key: "competitors" },
                  { label: "Product Team", key: "productTeam" },
                  { label: "Sales Management", key: "salesManagement" },
                  { label: "Country", key: "country" },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[8px] font-black uppercase opacity-40 ml-1">{field.label}</label>
                    <input list={field.key} className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={(selectedOpp as any)[field.key]} onChange={(e) => updateOpp(selectedOpp.id, { [field.key]: e.target.value })} />
                    <datalist id={field.key}>
                      {Array.from(new Set(opportunities.map(o => (o as any)[field.key]))).map(v => <option key={v} value={v}/>)}
                    </datalist>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Priority</label>
                  <select className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none" value={selectedOpp.priority} onChange={(e) => updateOpp(selectedOpp.id, { priority: e.target.value as any })}>
                    <option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Progress %</label>
                  <input type="number" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.progress} onChange={(e) => updateOpp(selectedOpp.id, { progress: Number(e.target.value) })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Year Start</label>
                  <input type="number" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.yearStart} onChange={(e) => updateOpp(selectedOpp.id, { yearStart: Number(e.target.value) })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Year End</label>
                  <input type="number" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.yearEnd} onChange={(e) => updateOpp(selectedOpp.id, { yearEnd: Number(e.target.value) })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Quantity</label>
                  <input type="number" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.quantity} onChange={(e) => updateOpp(selectedOpp.id, { quantity: Number(e.target.value) })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">SCP</label>
                  <input type="number" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.scp} onChange={(e) => updateOpp(selectedOpp.id, { scp: Number(e.target.value) })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Last Customer Discussion</label>
                  <input type="date" className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.lastCustomerDiscussion} onChange={(e) => updateOpp(selectedOpp.id, { lastCustomerDiscussion: e.target.value })} />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">SharePoint Files (Link)</label>
                  <input className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold" value={selectedOpp.files} onChange={(e) => updateOpp(selectedOpp.id, { files: e.target.value })} />
                </div>

                {/* BLOCO DE HOMOLOGAÇÃO */}
                <div className="col-span-2 p-6 bg-[var(--bg-app)] rounded-3xl border border-[var(--border-color)] flex items-center gap-4">
                  <input type="checkbox" checked={selectedOpp.homologated} onChange={(e) => updateOpp(selectedOpp.id, { homologated: e.target.checked })} className="w-5 h-5 accent-[var(--accent-color)]" />
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase">Homologated</label>
                    <input placeholder="Reason..." className="w-full bg-transparent border-none outline-none text-xs mt-1" value={selectedOpp.reasonHomologated} onChange={(e) => updateOpp(selectedOpp.id, { reasonHomologated: e.target.value })} />
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Observation</label>
                  <textarea className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-4 text-xs h-24 resize-none" value={selectedOpp.observation} onChange={(e) => updateOpp(selectedOpp.id, { observation: e.target.value })} />
                </div>

                {/* RFI / RFP REMEMBER */}
                {(selectedOpp.businessStages === "RFI" || selectedOpp.businessStages === "RFP") && (
                  <div className="col-span-2 p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center gap-4">
                    <AlertCircle className="text-orange-500" />
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase text-orange-500">Atenção Processo RFI/RFP</p>
                      <input className="w-full bg-transparent border-none outline-none text-xs font-bold mt-1" placeholder="Lembrete importante..." value={selectedOpp.remember} onChange={(e) => updateOpp(selectedOpp.id, { remember: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { if(confirm("Remover?")) { deleteDoc(doc(db, "opportunities", selectedOpp.id)); setSelectedOpp(null); } }} className="mt-12 w-full py-4 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all bg-transparent shadow-none">Remover Registro</button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}