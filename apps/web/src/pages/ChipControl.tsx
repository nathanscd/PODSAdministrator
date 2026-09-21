import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Signal, Cpu, Box, Hash, Users, Activity, RadioTower, Pencil, Check, X, Wrench, UserCog } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Chips } from "../types";

export default function SimCardControl() {
  const [chips, setChips] = useState<Chips[]>([]);
  const [number, setNumber] = useState("");
  const [carrier, setCarrier] = useState("Vivo");
  const [tech, setTech] = useState("NB-IoT");
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");
  const [responsible, setResponsible] = useState("");
  const [equipment, setEquipment] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Chips>>({});

  useEffect(() => {
    const q = query(collection(db, "chips"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setChips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chips)));
    });
    return unsub;
  }, []);

  const handleAddChip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !project || !client) return;

    try {
      await addDoc(collection(db, "chips"), {
        numero: number,
        operadora: carrier,
        tecnologia: tech,
        projeto: project,
        cliente: client,
        responsavel: responsible,
        equipamento: equipment,
        createdAt: serverTimestamp()
      });
      setNumber("");
      setProject("");
      setClient("");
      setResponsible("");
      setEquipment("");
    } catch (error) {
      console.error(error);
    }
  };

  const removeChip = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chips", id));
    } catch (error) {
      console.error(error);
    }
  };

  const startEditing = (chip: Chips) => {
    setEditingId(chip.id);
    setEditData({ ...chip });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEditing = async (id: string) => {
    try {
      await updateDoc(doc(db, "chips", id), {
        numero: editData.numero ?? "",
        operadora: editData.operadora ?? "Vivo",
        tecnologia: editData.tecnologia ?? "NB-IoT",
        projeto: editData.projeto ?? "",
        cliente: editData.cliente ?? "",
        responsavel: editData.responsavel ?? "",
        equipamento: editData.equipamento ?? "",
      });
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error(error);
    }
  };

  const getCarrierColors = (carrierName: string) => {
    switch (carrierName) {
      case 'Vivo': return 'from-[#660099] to-[#8a2be2] shadow-[#8a2be2]/30';
      case 'Claro': return 'from-[#e32636] to-[#ff4d4d] shadow-[#ff4d4d]/30';
      case 'TIM': return 'from-[#0000FF] to-[#4169e1] shadow-[#4169e1]/30';
      case 'Algar': return 'from-[#008638] to-[#00b34a] shadow-[#00b34a]/30';
      default: return 'from-gray-600 to-gray-400 shadow-gray-500/30';
    }
  };

  const getTechBadgeInfo = (techName: string) => {
    return techName === 'NB-IoT'
      ? { color: 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10', icon: <Cpu size={12} /> }
      : { color: 'text-fuchsia-500 border-fuchsia-500/30 bg-fuchsia-500/10', icon: <Signal size={12} /> };
  };

  const TOTAL_POR_TECNOLOGIA = 10;
  const nbIotUsados = chips.filter(c => c.tecnologia === 'NB-IoT').length;
  const fourGUsados = chips.filter(c => c.tecnologia === '4G').length;
  const nbIotCount = Math.max(TOTAL_POR_TECNOLOGIA - nbIotUsados, 0);
  const fourGCount = Math.max(TOTAL_POR_TECNOLOGIA - fourGUsados, 0);

  const inputClass = "w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all shadow-sm";
  const editInputClass = "w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all";

  return (
    <div className='w-full max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-10 min-h-screen'>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] w-fit shadow-sm backdrop-blur-md">
          <RadioTower size={16} className="text-[var(--accent-color)]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Conectividade</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">Gestão de Chips M2M</h1>
            <p className="text-lg text-[var(--text-secondary)] opacity-80 max-w-2xl leading-relaxed m-0">
              Controle e monitore seus cartões SIM, definindo tecnologias de rede, operadoras, responsáveis e equipamentos.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 w-fit max-w-full backdrop-blur-[16px] text-[var(--text-primary)] shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">Total em Estoque</h2>
            <div className="flex flex-row gap-3">
              <div className="flex flex-col items-center px-5 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-app)]">
                <span className="text-2xl font-black text-cyan-500">{nbIotCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">NB-IoT</span>
              </div>
              <div className="flex flex-col items-center px-5 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-app)]">
                <span className="text-2xl font-black text-fuchsia-500">{fourGCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">4G</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className='bg-gradient-to-br from-[var(--card-bg)] to-transparent border border-[var(--border-color)] rounded-[2rem] p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden'
      >
        <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--accent-color)] rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <form onSubmit={handleAddChip} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-[2] w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Linha / ICCID</label>
              <div className="relative group">
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Ex: 8955..."
                  className={`${inputClass} font-mono tracking-wider group-hover:border-[var(--text-secondary)]/30`}
                />
                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Operadora</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none font-bold hover:border-[var(--text-secondary)]/30`}
              >
                <option value="Vivo">Vivo</option>
                <option value="Claro">Claro</option>
                <option value="TIM">TIM</option>
                <option value="Algar">Algar</option>
              </select>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Tecnologia</label>
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none font-bold hover:border-[var(--text-secondary)]/30`}
              >
                <option value="NB-IoT">NB-IoT</option>
                <option value="4G">4G LTE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Projeto</label>
              <div className="relative group">
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Ex: Medidores Inteligentes"
                  className={`${inputClass} group-hover:border-[var(--text-secondary)]/30`}
                />
                <Box className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Cliente</label>
              <div className="relative group">
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Nome do cliente"
                  className={`${inputClass} group-hover:border-[var(--text-secondary)]/30`}
                />
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-end">
            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Responsável</label>
              <div className="relative group">
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Quem é responsável pelo chip"
                  className={`${inputClass} group-hover:border-[var(--text-secondary)]/30`}
                />
                <UserCog className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Equipamento</label>
              <div className="relative group">
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Onde o chip está instalado"
                  className={`${inputClass} group-hover:border-[var(--text-secondary)]/30`}
                />
                <Wrench className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto bg-[var(--accent-color)] text-white px-10 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_12px_25px_rgba(255,106,0,0.4)] transition-all h-[54px]"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Adicionar Chip</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      <div className='w-full'>
        <AnimatePresence mode="popLayout">
          {chips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-[var(--border-color)] rounded-[2rem] bg-[var(--card-bg)] backdrop-blur-sm"
            >
              <Activity size={56} strokeWidth={1} className="text-[var(--text-secondary)] opacity-20 mb-5" />
              <p className="text-[var(--text-primary)] font-black text-xl mb-2 tracking-tight">Inventário vazio</p>
              <p className="text-[var(--text-secondary)] font-medium opacity-70">Adicione seu primeiro chip M2M utilizando o painel acima.</p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chips.map((chip, index) => {
                const techStyle = getTechBadgeInfo(chip.tecnologia);
                const isEditing = editingId === chip.id;

                return (
                  <motion.div
                    key={chip.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="relative group perspective-1000"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-[var(--border-color)] to-transparent rounded-[2rem] blur-xl transition-opacity duration-500 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                    <motion.div
                      whileHover={isEditing ? {} : { rotateY: -5, rotateX: 5, z: 20 }}
                      className={`bg-[var(--card-bg)] border rounded-[2rem] p-6 flex flex-col gap-5 backdrop-blur-xl shadow-lg transition-all duration-300 relative z-10 h-full transform-style-3d ${isEditing ? 'border-[var(--accent-color)] shadow-2xl' : 'border-[var(--border-color)] hover:shadow-2xl'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-16 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br ${getCarrierColors(chip.operadora)} shadow-lg transform group-hover:scale-105 transition-transform duration-500 relative overflow-hidden shrink-0`}
                          style={{ clipPath: 'polygon(25px 0, 100% 0, 100% 100%, 0 100%, 0 25px)' }}
                        >
                          <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                          <div className="w-10 h-12 bg-gradient-to-b from-[#e6c27a] to-[#c59b40] rounded-sm shadow-inner flex flex-wrap p-[2px] gap-[2px] relative z-10 border border-[#8b6b23]">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="w-[calc(50%-1px)] h-[calc(33.33%-1px)] border border-[#a68028]/60 bg-gradient-to-br from-[#f2d493] to-[#d4aa50]" />
                            ))}
                          </div>
                          <span className="absolute bottom-2 left-2 text-[8px] font-black text-white/70 uppercase tracking-widest">{isEditing ? editData.operadora : chip.operadora}</span>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditing(chip.id)}
                                className="w-14 h-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all duration-300 shadow-sm"
                                title="Salvar"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="w-14 h-12 flex items-center justify-center bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl transition-all duration-300 shadow-sm"
                                title="Cancelar"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => startEditing(chip)}
                                className="w-14 h-12 flex items-center justify-center bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/30 rounded-xl transition-all duration-300 shadow-sm"
                                title="Editar Chip"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => removeChip(chip.id)}
                                className="w-14 h-12 flex items-center justify-center bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl transition-all duration-300 shadow-sm"
                                title="Remover Chip"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}

                          {isEditing ? (
                            <div className="flex gap-1.5">
                              <select
                                value={editData.operadora}
                                onChange={(e) => setEditData({ ...editData, operadora: e.target.value })}
                                className={`${editInputClass} text-[10px] font-bold`}
                              >
                                <option value="Vivo">Vivo</option>
                                <option value="Claro">Claro</option>
                                <option value="TIM">TIM</option>
                                <option value="Algar">Algar</option>
                              </select>
                              <select
                                value={editData.tecnologia}
                                onChange={(e) => setEditData({ ...editData, tecnologia: e.target.value })}
                                className={`${editInputClass} text-[10px] font-bold`}
                              >
                                <option value="NB-IoT">NB-IoT</option>
                                <option value="4G">4G LTE</option>
                              </select>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md ${techStyle.color}`}>
                              {techStyle.icon}
                              <span className="text-[10px] font-black uppercase tracking-widest">{chip.tecnologia}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 mt-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-secondary)] opacity-60 mb-1">Linha / ICCID</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.numero}
                              onChange={(e) => setEditData({ ...editData, numero: e.target.value })}
                              className={`${editInputClass} font-mono tracking-wider`}
                            />
                          ) : (
                            <p className="text-xl font-bold text-[var(--text-primary)] font-mono tracking-wider truncate">{chip.numero}</p>
                          )}
                        </div>

                        <div className="w-full h-[1px] bg-[var(--border-color)] opacity-50" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Box size={10} /> Projeto</span>
                            {isEditing ? (
                              <input type="text" value={editData.projeto} onChange={(e) => setEditData({ ...editData, projeto: e.target.value })} className={editInputClass} />
                            ) : (
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chip.projeto}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Users size={10} /> Cliente</span>
                            {isEditing ? (
                              <input type="text" value={editData.cliente} onChange={(e) => setEditData({ ...editData, cliente: e.target.value })} className={editInputClass} />
                            ) : (
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chip.cliente}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><UserCog size={10} /> Responsável</span>
                            {isEditing ? (
                              <input type="text" value={editData.responsavel} onChange={(e) => setEditData({ ...editData, responsavel: e.target.value })} className={editInputClass} />
                            ) : (
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chip.responsavel || '—'}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Wrench size={10} /> Equipamento</span>
                            {isEditing ? (
                              <input type="text" value={editData.equipamento} onChange={(e) => setEditData({ ...editData, equipamento: e.target.value })} className={editInputClass} />
                            ) : (
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chip.equipamento || '—'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}