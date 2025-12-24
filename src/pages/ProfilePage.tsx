import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const themes = [
  { id: "orange", name: "Laranja", color: "#ff6a00" },
  { id: "rosa", name: "Rosa", color: "#ff0080" },
  { id: "roxo", name: "Roxo", color: "#8a2be2" },
  { id: "vermelho", name: "Vermelho", color: "#dc2626" },
];

export default function ProfilePage() {
  const { user, updateUserProfile, changeTheme } = useAuth();
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [selectedColor, setSelectedColor] = useState("orange");

  useEffect(() => {
    if (user) {
      setName(user.displayName);
      setRole(user.role);
      setBio(user.bio);
      setIsDark(user.theme.startsWith("dark"));
      setSelectedColor(user.theme.split("-")[1]);
    }
  }, [user]);

  const handleSave = async () => {
    await updateUserProfile({ displayName: name, role, bio });
    alert("Perfil atualizado!");
  };

  const handleThemeChange = (mode: "light" | "dark", color: string) => {
    const newTheme = `${mode}-${color}` as any;
    changeTheme(newTheme);
    setIsDark(mode === "dark");
    setSelectedColor(color);
  };

  if (!user) return <div className="p-10">Faça login para ver seu perfil.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 w-full">
      <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Meu Perfil</h1>
      <p className="text-gray-500 mb-8">Gerencie suas informações e a aparência do app.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Seção de Dados Pessoais */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            👤 Informações Pessoais
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Nome de Exibição</label>
              <input 
                className="w-full bg-transparent border-b border-gray-300 focus:border-[var(--accent-color)] outline-none py-2 text-[var(--text-primary)] transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Cargo / Função</label>
              <input 
                className="w-full bg-transparent border-b border-gray-300 focus:border-[var(--accent-color)] outline-none py-2 text-[var(--text-primary)] transition-colors"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Sobre Mim</label>
              <textarea 
                className="w-full bg-transparent border border-gray-300 focus:border-[var(--accent-color)] rounded-lg outline-none p-3 text-[var(--text-primary)] transition-colors resize-none h-32 mt-2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full mt-4 bg-[var(--accent-color)] text-white hover:opacity-90 border-none"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Seção de Aparência */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🎨 Aparência
          </h2>

          <div className="mb-6">
            <label className="block text-xs uppercase font-bold text-gray-400 mb-3">Modo</label>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
              <button 
                onClick={() => handleThemeChange("light", selectedColor)}
                className={`flex-1 py-2 px-6 rounded-md m-0 border-none shadow-none ${!isDark ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500'}`}
              >
                ☀️ Claro
              </button>
              <button 
                onClick={() => handleThemeChange("dark", selectedColor)}
                className={`flex-1 py-2 px-6 rounded-md m-0 border-none shadow-none ${isDark ? 'bg-gray-700 text-white shadow-sm' : 'bg-transparent text-gray-500'}`}
              >
                🌙 Escuro
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-3">Cor de Destaque</label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleThemeChange(isDark ? "dark" : "light", t.id)}
                  className={`
                    cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3
                    ${selectedColor === t.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white' : 'border-gray-200 hover:border-gray-300 text-gray-500'}
                  `}
                >
                  <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: t.color }}></div>
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}