import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const themes = [
  { id: "orange", name: "Laranja", color: "#ff6a00" },
  { id: "rosa", name: "Rosa", color: "#ff0080" },
  { id: "roxo", name: "Roxo", color: "#8a2be2" },
  { id: "vermelho", name: "Vermelho", color: "#dc2626" },
];

export default function ProfilePage() {
  const { user, updateUserProfile, changeTheme, loading } = useAuth();
  
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
      // Proteção para caso user.theme venha indefinido do banco
      const themeStr = user.theme || "light-orange";
      setIsDark(themeStr.startsWith("dark"));
      setSelectedColor(themeStr.split("-")[1] || "orange");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile({ displayName: name, role, bio });
      alert("Perfil atualizado!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const handleThemeChange = (mode: "light" | "dark", color: string) => {
    const newTheme = `${mode}-${color}` as any;
    changeTheme(newTheme);
    setIsDark(mode === "dark");
    setSelectedColor(color);
  };

  if (loading) return <div className="p-10 text-gray-400">Carregando perfil...</div>;
  if (!user) return <div className="p-10 text-gray-400">Faça login para ver seu perfil.</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">Meu Perfil</h1>
        <p className="text-gray-500">Personalize sua experiência no sistema.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
            👤 Dados
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nome</label>
              <input 
                className="w-full bg-transparent border-b border-gray-200 focus:border-[var(--accent-color)] outline-none py-2 text-[var(--text-primary)] transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cargo</label>
              <input 
                className="w-full bg-transparent border-b border-gray-200 focus:border-[var(--accent-color)] outline-none py-2 text-[var(--text-primary)] transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bio</label>
              <textarea 
                className="w-full bg-transparent border border-gray-200 focus:border-[var(--accent-color)] rounded-xl outline-none p-3 text-[var(--text-primary)] h-28 mt-2 resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-3 bg-[var(--accent-color)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity border-none ml-0"
            >
              Atualizar Perfil
            </button>
          </div>
        </section>

        <section className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
            🎨 Customização
          </h2>

          <div className="mb-8">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-3">Ambiente</label>
            <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-xl w-fit">
              <button 
                onClick={() => handleThemeChange("light", selectedColor)}
                className={`py-2 px-6 rounded-lg text-xs font-bold transition-all border-none m-0 shadow-none ${!isDark ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500'}`}
              >
                CLARO
              </button>
              <button 
                onClick={() => handleThemeChange("dark", selectedColor)}
                className={`py-2 px-6 rounded-lg text-xs font-bold transition-all border-none m-0 shadow-none ${isDark ? 'bg-gray-800 text-white shadow-sm' : 'bg-transparent text-gray-500'}`}
              >
                ESCURO
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-4">Paleta de Destaque</label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => handleThemeChange(isDark ? "dark" : "light", t.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ml-0 mb-0
                    ${selectedColor === t.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-gray-200 hover:border-gray-300 bg-transparent'}
                  `}
                >
                  <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.color }}></div>
                  <span className={`text-xs font-bold ${selectedColor === t.id ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}