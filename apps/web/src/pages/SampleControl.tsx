import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, Package, ArrowRight, Layers, Box, Users } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SampleControl() {
  const [samples, setSamples] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Em Montagem");
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");

  useEffect(() => {
    const q = query(collection(db, "samples"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setSamples(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleAddSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !project || !client) return;

    try {
      await addDoc(collection(db, "samples"), {
        nome: name,
        dataLimite: date,
        status: status,
        projeto: project,
        cliente: client,
        createdAt: serverTimestamp()
      });
      setName("");
      setDate("");
      setProject("");
      setClient("");
      setStatus("Em Montagem");
    } catch (error) {
      console.error(error);
    }
  };

  const removeSample = async (id: string) => {
    try {
      await deleteDoc(doc(db, "samples", id));
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'Em Atraso': return 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      case 'Em Montagem': return 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'Entregue': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className='w-full max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10 min-h-screen'>
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl mt-10 font-black text-[var(--text-primary)] tracking-tight mb-3">Controle de Amostras</h1>
          <p className="text-md text-[var(--text-secondary)] opacity-60">
            Gerencie e monitore suas amostras de forma eficiente, acompanhando prazos e status de montagem em tempo real.
          </p>
        </div>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className='bg-gradient-to-br from-[var(--card-bg)] to-transparent border border-[var(--border-color)] rounded-[2rem] p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden'
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <form onSubmit={handleAddSample} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-[2] w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Nome da Amostra</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Zeus-NG"
                  className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all shadow-sm group-hover:border-[var(--text-secondary)]/30"
                />
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>
            
            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Data Limite</label>
              <div className="relative group">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all appearance-none shadow-sm group-hover:border-[var(--text-secondary)]/30 cursor-pointer"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Status Atual</label>
              <div className="relative group">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all cursor-pointer appearance-none shadow-sm group-hover:border-[var(--text-secondary)]/30 font-semibold"
                >
                  <option value="Em Montagem">Em Montagem</option>
                  <option value="Em Atraso">Em Atraso</option>
                  <option value="Entregue">Entregue</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col gap-1">
                  <div className="w-2 h-0.5 bg-[var(--text-secondary)] opacity-50 rounded-full" />
                  <div className="w-2 h-0.5 bg-[var(--text-secondary)] opacity-50 rounded-full" />
                  <div className="w-2 h-0.5 bg-[var(--text-secondary)] opacity-50 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-end">
            <div className="flex-1 w-full flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Projeto</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Ex: Medidores Inteligentes"
                  className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all shadow-sm group-hover:border-[var(--text-secondary)]/30"
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
                  className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all shadow-sm group-hover:border-[var(--text-secondary)]/30"
                />
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 pointer-events-none transition-opacity group-focus-within:opacity-100 group-focus-within:text-[var(--accent-color)]" size={18} />
              </div>
            </div>

            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto bg-[var(--accent-color)] text-white px-10 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_12px_25px_rgba(255,106,0,0.4)] transition-all h-[54px]"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Adicionar Amostra</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      <div className='flex flex-col gap-4'>
        <AnimatePresence mode="popLayout">
          {samples.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-[var(--border-color)] rounded-[2rem] bg-[var(--card-bg)] backdrop-blur-sm"
            >
              <Box size={48} strokeWidth={1.5} className="text-[var(--text-secondary)] opacity-30 mb-4" />
              <p className="text-[var(--text-primary)] font-bold text-lg mb-1">Nenhuma amostra registrada</p>
              <p className="text-[var(--text-secondary)] text-sm opacity-70">Preencha o formulário acima para começar a rastrear.</p>
            </motion.div>
          ) : (
            samples.map((sample, index) => (
              <motion.div 
                key={sample.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--card-bg)] border border-[var(--border-color)] p-5 md:p-6 rounded-[1.5rem] hover:border-[var(--accent-color)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group gap-4"
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Package size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="text-lg font-black text-[var(--text-primary)] leading-none">{sample.nome}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--text-secondary)] opacity-70 flex items-center gap-1.5 bg-[var(--bg-app)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                          <Calendar size={12} />
                          {String(sample.dataLimite).split('-').reverse().join('/')}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border backdrop-blur-md ${getStatusStyles(sample.status)}`}>
                          {sample.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-[1px] bg-[var(--border-color)] opacity-30 my-0.5" />
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5">
                        <Box size={12} className="text-[var(--text-secondary)] opacity-70" />
                        <span className="text-xs font-bold text-[var(--text-primary)] opacity-90">{sample.projeto}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[var(--text-secondary)] opacity-70" />
                        <span className="text-xs font-bold text-[var(--text-primary)] opacity-90">{sample.cliente}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeSample(sample.id)}
                  className="p-3 bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 self-end sm:self-center shadow-sm shrink-0"
                  title="Remover amostra"
                >
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 flex justify-end"
      >
        <a 
          href="https://forms.office.com/Pages/ResponsePage.aspx?id=2gsX5fB_-UOuae7UH90iZruHk4ox_hFIvypf0zh-7AlUQVE4U0E1MExZMkJRVUJHOFZaRTgyTDM4OC4u&origin=Invitation&channel=0" target='_blank'
          className="inline-flex uppercase items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold text-sm hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
        >
          <span>Solicitar nova amostra</span>
          <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </div>
  )
}