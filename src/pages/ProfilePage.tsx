import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Palette, ShieldCheck, Sparkles, LogOut } from "lucide-react"; // Adicionado LogOut
import { signOut } from "firebase/auth"; // Adicionado signOut
import { auth } from "../firebase"; // Adicionado auth
import { useNavigate } from "react-router-dom"; // Adicionado useNavigate

const themes = [
  { id: "orange", name: "Laranja", color: "#ff6a00" },
  { id: "rosa", name: "Rosa", color: "#ff0080" },
  { id: "roxo", name: "Roxo", color: "#8a2be2" },
  { id: "vermelho", name: "Vermelho", color: "#dc2626" },
];

export default function ProfilePage() {
  const { user, updateUserProfile, changeTheme, loading } = useAuth();
  const navigate = useNavigate(); // Hook de navegação
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [selectedColor, setSelectedColor] = useState("orange");

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setRole(user.role || "");
      setBio(user.bio || "");
      const themeStr = user.theme || "light-orange";
      setIsDark(themeStr.startsWith("dark"));
      setSelectedColor(themeStr.split("-")[1] || "orange");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile({ displayName: name, role, bio });
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  // --- LÓGICA DE LOGOUT ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleThemeChange = (mode: "light" | "dark", color: string) => {
    const newTheme = `${mode}-${color}` as any;
    changeTheme(newTheme);
    setIsDark(mode === "dark");
    setSelectedColor(color);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-color)]"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center text-gray-400 font-medium">
      Acesse sua conta para gerenciar o perfil.
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--accent-color)] to-[#ff9d00] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[var(--accent-color)]/20">
            {name.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              {name || "Usuário"}
            </h1>
            <p className="text-[var(--text-secondary)] opacity-50 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-[var(--accent-color)]" /> Membro Verificado
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* BOTÃO DE SAIR */}
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-transparent border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 m-0"
          >
            <LogOut size={14} /> Sair
          </button>

          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--accent-color)]/20 border-none m-0"
          >
            Salvar Alterações
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <User size={120} />
            </div>
            
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-[var(--accent-color)] flex items-center gap-2">
              <User size={16} /> Identidade do Usuário
            </h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest group-focus-within:text-[var(--accent-color)] transition-colors">Nome Completo</label>
                  <input 
                    className="w-full bg-[var(--bg-app)]/50 border border-[var(--border-color)] rounded-2xl focus:border-[var(--accent-color)] outline-none px-5 py-4 text-sm text-[var(--text-primary)] transition-all font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>

                <div className="group">
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest group-focus-within:text-[var(--accent-color)] transition-colors">Função / Cargo</label>
                  <input 
                    className="w-full bg-[var(--bg-app)]/50 border border-[var(--border-color)] rounded-2xl focus:border-[var(--accent-color)] outline-none px-5 py-4 text-sm text-[var(--text-primary)] transition-all font-medium"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Desenvolvedor Senior"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest group-focus-within:text-[var(--accent-color)] transition-colors">Descrição</label>
                <textarea 
                  className="w-full bg-[var(--bg-app)]/50 border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded-2xl outline-none p-5 text-sm text-[var(--text-primary)] h-40 resize-none transition-all leading-relaxed font-medium"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl shadow-black/5">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-[var(--accent-color)] flex items-center gap-2">
              <Palette size={16} /> Aparência
            </h2>

            <div className="mb-10">
              <label className="block text-[9px] uppercase font-black text-gray-400 mb-4 tracking-widest">Modo de Interface</label>
              <div className="flex p-1.5 gap-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)]">
                <button 
                  onClick={() => handleThemeChange("light", selectedColor)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border-none m-0 ${!isDark ? 'bg-white dark:bg-zinc-800 text-[var(--text-primary)] shadow-lg' : 'bg-transparent text-gray-500'}`}
                >
                  LIGHT
                </button>
                <button 
                  onClick={() => handleThemeChange("dark", selectedColor)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border-none m-0 ${isDark ? 'bg-white dark:bg-zinc-800 text-[var(--text-primary)] shadow-lg' : 'bg-transparent text-gray-500'}`}
                >
                  DARK
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-black text-gray-400 mb-6 tracking-widest flex items-center gap-2">
                Cor de destaque <Sparkles size={12} className="text-yellow-500" />
              </label>
              <div className="grid grid-cols-1 gap-3">
                {themes.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => handleThemeChange(isDark ? "dark" : "light", t.id)}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border-2 transition-all ml-0 mb-0 group
                      ${selectedColor === t.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'border-transparent bg-[var(--bg-app)]/50 hover:bg-[var(--bg-app)]'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: t.color }}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedColor === t.id ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
                        {t.name}
                        </span>
                    </div>
                    {selectedColor === t.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}