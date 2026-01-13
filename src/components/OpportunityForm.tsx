import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, AlertCircle, Lock, Plus, ChevronDown, Trash2, Edit2, Check } from "lucide-react";
import { Opportunity } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useOptions } from "../hooks/useOptions"; 

// --- SMART COMBOBOX (NOTION STYLE) ---
interface ComboboxProps {
  fieldKey: string; 
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onAddOption: (val: string) => void;
  onRemoveOption: (val: string) => void;
  onRenameOption: (oldVal: string, newVal: string) => void;
  disabled?: boolean;
}

function SmartCombobox({ 
  fieldKey, label, value, options, onChange, 
  onAddOption, onRemoveOption, onRenameOption, disabled 
}: ComboboxProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTempText, setEditTempText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingItem(null);
        if (query !== value && !editingItem) onChange(query); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef, query, value, onChange, editingItem]);

  const filteredOptions = Array.from(new Set(options)).filter(opt => 
    opt.toLowerCase().includes(query.toLowerCase())
  ).sort();

  return (
    <div className="space-y-2 group" ref={containerRef}>
      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)] transition-all group-focus-within:text-[var(--accent-color)] group-focus-within:opacity-100">
        {label}
      </label>
      
      <div className="relative">
        <div 
          className={`flex items-center w-full bg-white/5 border rounded-xl px-4 py-3 transition-all cursor-text ${isOpen ? 'border-[var(--accent-color)] bg-white/10' : 'border-white/5 hover:border-white/10'}`}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <input
            className="w-full bg-transparent border-none outline-none text-sm font-bold text-[var(--text-primary)] placeholder-white/20"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            placeholder="Empty"
            disabled={disabled}
            onFocus={() => setIsOpen(true)}
          />
          {!disabled && (
            <ChevronDown size={14} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-[300] top-full mt-2 left-0 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar">
            
            <div className="p-1">
              {filteredOptions.length === 0 && query === "" && (
                 <div className="p-3 text-[10px] text-white/30 uppercase text-center">No tags yet</div>
              )}

              {filteredOptions.map((opt) => (
                <div key={opt} className="group/item flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg transition-colors">
                  
                  {editingItem === opt ? (
                    <div className="flex items-center w-full gap-2 px-1">
                      <input 
                        autoFocus
                        className="flex-1 bg-black/50 border border-[var(--accent-color)] rounded px-2 py-1 text-xs text-white outline-none"
                        value={editTempText}
                        onChange={(e) => setEditTempText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onRenameOption(opt, editTempText);
                            setEditingItem(null);
                          }
                        }}
                      />
                      <button onClick={() => { onRenameOption(opt, editTempText); setEditingItem(null); }} className="text-green-500 hover:text-green-400"><Check size={14}/></button>
                      <button onClick={() => setEditingItem(null)} className="text-red-500 hover:text-red-400"><X size={14}/></button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setQuery(opt);
                          onChange(opt);
                          setIsOpen(false);
                        }}
                        className="flex-1 text-left text-sm text-[var(--text-primary)] py-1.5 truncate font-medium"
                      >
                         {opt}
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setEditTempText(opt); setEditingItem(opt); }}
                           className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-blue-400"
                           title="Rename tag"
                         >
                           <Edit2 size={12} />
                         </button>
                         <button 
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             if(confirm(`Delete tag "${opt}" from list?`)) onRemoveOption(opt); 
                           }}
                           className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-red-400"
                           title="Delete tag permanently"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                      
                      {opt === value && <Check size={14} className="text-[var(--accent-color)] ml-2" />}
                    </>
                  )}
                </div>
              ))}
            </div>

            {query && !filteredOptions.includes(query) && (
              <div className="p-1 border-t border-white/10">
                 <button
                    onClick={() => {
                      onAddOption(query); 
                      onChange(query);    
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-[var(--accent-color)]/20 hover:text-[var(--accent-color)] rounded-lg text-sm text-[var(--text-primary)] transition-colors"
                  >
                    <Plus size={14} />
                    <span className="truncate">Create <span className="font-bold">"{query}"</span></span>
                  </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// --- FORMULÁRIO PRINCIPAL ---

interface Props {
  opp: Opportunity;
  onUpdate: (id: string, updates: Partial<Opportunity>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  allOpportunities: Opportunity[];
}

export default function OpportunityForm({ opp, onUpdate, onClose, onDelete }: Props) {
  const { isAdmin } = useAuth();
  const { optionsMap, addOption, removeOption, renameOption } = useOptions(); 

  // --- CORREÇÃO: Estado local para campos de texto livre (Performance) ---
  const [localDescription, setLocalDescription] = useState(opp.description || "");
  const [localObservation, setLocalObservation] = useState(opp.observation || "");

  // Atualiza o estado local se a prop mudar externamente (ex: clicou em outra oportunidade)
  useEffect(() => {
    setLocalDescription(opp.description || "");
    setLocalObservation(opp.observation || "");
  }, [opp.description, opp.observation]);

  const smartFields = [
    { label: "Utility (Customer)", key: "utility" },
    { label: "HQ Support & Interface", key: "hqInterface" },
    { label: "KAM", key: "kam" },
    { label: "Status", key: "status" },
    { label: "Product", key: "product" },
    { label: "Business Stages", key: "businessStages" },
    { label: "Country", key: "country" },
    { label: "Ecosystem", key: "ecosystem" },
    { label: "Competitors", key: "competitors" },
    { label: "Product Team", key: "productTeam" },
    { label: "Sales Management", key: "salesManagement" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-3xl bg-[var(--card-bg)] h-full border-l border-[var(--border-color)] flex flex-col shadow-2xl animate-in slide-in-from-right-20 duration-500 ease-out">
        
        {/* HEADER */}
        <div className="flex justify-between items-start p-10 pb-6 shrink-0 border-b border-white/5">
          <div className="w-full pr-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] mb-2 block">Editing Opportunity</span>
            
            {/* INPUT DE DESCRIÇÃO CORRIGIDO */}
            <input 
              className="w-full bg-transparent border-none outline-none text-3xl font-black italic tracking-tight text-[var(--text-primary)] placeholder:opacity-20 hover:placeholder:opacity-40 transition-all" 
              value={localDescription} 
              placeholder="OPPORTUNITY NAME..."
              onChange={(e) => setLocalDescription(e.target.value)} // Atualiza localmente
              onBlur={() => onUpdate(opp.id, { description: localDescription })} // Salva no Firebase ao sair
            />
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full hover:bg-white/10 text-[var(--text-primary)] transition-all hover:rotate-90 active:scale-95"
          >
            <X size={24}/>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-8">
          
          <div className="mb-10">
             <SmartCombobox 
                fieldKey="technicalSalesGroup"
                label="Technical Sales Group"
                value={opp.technicalSalesGroup || ""}
                options={["1st Group", "2nd Group", "3rd Group", ...(optionsMap["technicalSalesGroup"] || [])]}
                onChange={(val) => onUpdate(opp.id, { technicalSalesGroup: val })}
                onAddOption={(val) => addOption("technicalSalesGroup", val)}
                onRemoveOption={(val) => removeOption("technicalSalesGroup", val)}
                onRenameOption={(oldVal, newVal) => renameOption("technicalSalesGroup", oldVal, newVal)}
                disabled={!isAdmin} 
             />
             {!isAdmin && (
               <div className="mt-2 flex items-center gap-2 opacity-50 ml-1">
                 <Lock size={10} className="text-[var(--text-primary)]"/>
                 <span className="text-[10px] uppercase text-[var(--text-primary)]">Locked by Admin</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 pb-10">
            
            {smartFields.map(field => (
              <SmartCombobox
                key={field.key}
                fieldKey={field.key}
                label={field.label}
                value={(opp as any)[field.key] || ""}
                options={optionsMap[field.key] || []}
                onChange={(val) => onUpdate(opp.id, { [field.key]: val })}
                onAddOption={(val) => addOption(field.key, val)}
                onRemoveOption={(val) => removeOption(field.key, val)}
                onRenameOption={(oldVal, newVal) => renameOption(field.key, oldVal, newVal)}
              />
            ))}

            <div className="space-y-2 group">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">Priority</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:bg-white/10 focus:border-[var(--accent-color)] transition-all appearance-none cursor-pointer" 
                  value={opp.priority || "Média"} 
                  onChange={(e) => onUpdate(opp.id, { priority: e.target.value as any })}
                >
                  <option className="bg-[#1a1a1a]" value="Baixa">Baixa</option>
                  <option className="bg-[#1a1a1a]" value="Média">Média</option>
                  <option className="bg-[#1a1a1a]" value="Alta">Alta</option>
                  <option className="bg-[#1a1a1a]" value="Crítica">Crítica</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[var(--text-primary)]">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-1">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">Start</label>
                <input type="number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all" value={opp.yearStart || ""} onChange={(e) => onUpdate(opp.id, { yearStart: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">End</label>
                <input type="number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all" value={opp.yearEnd || ""} onChange={(e) => onUpdate(opp.id, { yearEnd: Number(e.target.value) })} />
              </div>
            </div>

            {[
              { label: "Quantity", key: "quantity" },
              { label: "SCP", key: "scp" },
              { label: "Progress %", key: "progress" },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">{f.label}</label>
                <input type="number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all" value={(opp as any)[f.key] || 0} onChange={(e) => onUpdate(opp.id, { [f.key]: Number(e.target.value) })} />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">Last Discussion</label>
              <input type="date" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all" value={opp.lastCustomerDiscussion || ""} onChange={(e) => onUpdate(opp.id, { lastCustomerDiscussion: e.target.value })} />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">SharePoint Files</label>
              <div className="flex gap-2">
                <input className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all placeholder-white/20" value={opp.files || ""} placeholder="https://..." onChange={(e) => onUpdate(opp.id, { files: e.target.value })} />
                {opp.files && <a href={opp.files} target="_blank" rel="noreferrer" className="px-5 bg-[var(--accent-color)] text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-color)]/20"><ExternalLink size={18} /></a>}
              </div>
            </div>

            <div className="col-span-2 p-6 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-[var(--accent-color)]/30 transition-all">
              <div className="relative">
                <input type="checkbox" checked={opp.homologated || false} onChange={(e) => onUpdate(opp.id, { homologated: e.target.checked })} className="peer w-6 h-6 appearance-none bg-white/10 rounded-md checked:bg-[var(--accent-color)] cursor-pointer transition-all border border-white/10 checked:border-[var(--accent-color)]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 text-white text-xs">✓</div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">Homologated Status</label>
                <input placeholder="Reason / Details..." className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-white/20" value={opp.reasonHomologated || ""} onChange={(e) => onUpdate(opp.id, { reasonHomologated: e.target.value })} />
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">Observation</label>
              
              {/* TEXTAREA CORRIGIDO: Mesma lógica do input de descrição */}
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm font-medium text-[var(--text-primary)] h-32 resize-none outline-none focus:border-[var(--accent-color)] transition-all placeholder-white/20 leading-relaxed custom-scrollbar" 
                value={localObservation} 
                placeholder="Add notes..." 
                onChange={(e) => setLocalObservation(e.target.value)} 
                onBlur={() => onUpdate(opp.id, { observation: localObservation })}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--text-secondary)]">Reason Win/Loss</label>
              <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all" value={opp.reasonWinLoss || ""} onChange={(e) => onUpdate(opp.id, { reasonWinLoss: e.target.value })} />
            </div>

            {(opp.businessStages === "RFI" || opp.businessStages === "RFP") && (
              <div className="col-span-2 p-6 bg-orange-500/5 border border-orange-500/30 rounded-3xl flex items-start gap-5">
                <div className="p-2 bg-orange-500/10 rounded-full text-orange-500"><AlertCircle size={20} /></div>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Critical Process: RFI/RFP</p>
                  <input className="w-full bg-transparent border-none outline-none text-sm font-bold text-[var(--text-primary)] placeholder-orange-500/30" placeholder="Set a reminder..." value={opp.remember || ""} onChange={(e) => onUpdate(opp.id, { remember: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 p-8 pt-4 border-t border-white/5 bg-[var(--card-bg)]/90 backdrop-blur-xl absolute bottom-0 w-full z-10">
          <button onClick={() => onDelete(opp.id)} className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all bg-transparent shadow-none hover:shadow-lg hover:shadow-red-500/20">
            Delete Opportunity
          </button>
        </div>
      </div>
    </div>
  );
}