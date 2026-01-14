import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Users, Shield, Search, MoreHorizontal, Edit3, Trash2, CheckCircle2, X } from "lucide-react";
import PageTransition from "../components/PageTransition";

// Definição dos Grupos baseados no seu PDF/Contexto
const TECHNICAL_GROUPS = [
  "Unassigned",
  "1st Group",
  "2nd Group",
  "3rd Group",
  "HQ Interface",
  "Sales Management"
];

interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  role?: string; // 'admin' | 'user'
  technicalSalesGroup?: string; // O campo que define o Workspace
  photoURL?: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth(); // Para garantir que quem acessa é admin (verificação visual)
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  
  // States do Modal de Edição
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Valores temporários para edição
  const [tempRole, setTempRole] = useState("");
  const [tempGroup, setTempGroup] = useState("");

  // 1. Busca usuários em tempo real
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserData)));
    });
    return unsub;
  }, []);

  // 2. Filtra usuários
  const filteredUsers = users.filter(u => 
    (u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  // 3. Abrir Modal
  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setTempRole(user.role || "user");
    setTempGroup(user.technicalSalesGroup || "Unassigned");
    setIsModalOpen(true);
  };

  // 4. Salvar Alterações no Firestore
  const handleSave = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        role: tempRole,
        technicalSalesGroup: tempGroup
      });
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar permissões.");
    }
  };

  // 5. Opcional: Deletar usuário (apenas do banco, não do Auth, a menos que use Cloud Functions)
  const handleDelete = async (id: string) => {
    if (confirm("Isso removerá os dados do usuário do banco de dados. Confirmar?")) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-16 ml-10 -mr-10 -mt-10">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              Admin Console
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              User Management & Access Control
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-3 rounded-2xl border border-[var(--border-color)]">
            <Search size={16} className="opacity-20 text-[var(--text-primary)]" />
            <input 
              placeholder="SEARCH USERS..." 
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-48 text-[var(--text-primary)]" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </header>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                  <th className="p-6">User Identity</th>
                  <th className="p-6">Role (Access)</th>
                  <th className="p-6">Assigned Group</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-[var(--border-color)] hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-bold uppercase shadow-lg">
                          {u.displayName?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{u.displayName || "Sem Nome"}</p>
                          <p className="opacity-50 text-[10px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                        u.role === 'admin' 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                        : 'bg-white/5 border-white/10 text-[var(--text-secondary)]'
                      }`}>
                        {u.role || 'User'}
                      </span>
                    </td>

                    <td className="p-6">
                      {/* ONDE A MÁGICA ACONTECE: Mostra o grupo atual */}
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-2 w-fit ${
                        u.technicalSalesGroup && u.technicalSalesGroup !== 'Unassigned'
                        ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20 text-[var(--accent-color)]'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {u.technicalSalesGroup || "Unassigned"}
                      </span>
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="p-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-color)] text-[var(--text-primary)] transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg hover:border-red-500 text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE EDIÇÃO */}
        {isModalOpen && editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)]">Edit Access</h3>
                  <p className="text-[10px] uppercase font-bold opacity-50">{editingUser.email}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}><X className="text-[var(--text-secondary)] hover:text-white" /></button>
              </div>

              <div className="space-y-6">
                {/* SELETOR DE ROLE (ADMIN/USER) */}
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">System Role</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTempRole("user")}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${tempRole === 'user' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700'}`}
                    >
                      USER
                    </button>
                    <button 
                      onClick={() => setTempRole("admin")}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${tempRole === 'admin' ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]' : 'bg-transparent text-gray-500 border-gray-700'}`}
                    >
                      ADMIN
                    </button>
                  </div>
                </div>

                {/* SELETOR DE GRUPO (PARA O WORKSPACE) */}
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
                    Technical Sales Group
                  </label>
                  <p className="text-[9px] opacity-40 mb-3">Isso define o que o usuário vê no "My Workspace".</p>
                  
                  <select 
                    value={tempGroup}
                    onChange={(e) => setTempGroup(e.target.value)}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-[var(--accent-color)] text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer"
                  >
                    {TECHNICAL_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs uppercase hover:bg-white/5">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs uppercase hover:scale-105 transition-transform flex justify-center items-center gap-2">
                  <CheckCircle2 size={16} /> Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}