import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Settings, Palette, Globe, Bell, Shield, 
  Cpu, Zap, Database, Lock, Eye, 
  Check, ChevronRight, Sparkles, Save
} from "lucide-react"; 
import { useLang } from "../contexts/LangContext"; 
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";
import { useTitle } from "../hooks/useTitle";
import { motion } from "framer-motion";

const themes = [
  { id: "orange", name: "Laranja", color: "#ff6a00" },
  { id: "rosa", name: "Rosa", color: "#ff0080" },
  { id: "roxo", name: "Roxo", color: "#8a2be2" },
  { id: "vermelho", name: "Vermelho", color: "#dc2626" },
  { id: "azul", name: "Azul", color: "#2651dc" },
];

export default function SettingsPage() {
  const { user, changeTheme, loading, setLanguage } = useAuth();
  const { t, lang } = useLang(); 
  useTitle(`${t.sidebar.settings || 'Settings'} - PODS Administrator`);
  
  const [isDark, setIsDark] = useState(false);
  const [selectedColor, setSelectedColor] = useState("orange");

  useEffect(() => {
    if (user) {
      const themeStr = user.theme || "light-orange";
      setIsDark(themeStr.startsWith("dark"));
      setSelectedColor(themeStr.split("-")[1] || "orange");
    }
  }, [user]);

  const handleThemeChange = (mode: "light" | "dark", color: string) => {
    const newTheme = `${mode}-${color}` as any;
    changeTheme(newTheme);
    setIsDark(mode === "dark");
    setSelectedColor(color);
  };

  const handleSave = async () => {
    try {
      await setLanguage(lang);
      alert((t as any).successMessage || "Settings updated successfully!");
    } catch (error) {
      console.error(error);
      alert((t as any).errorMessage || "Failed to update settings.");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-color)]"></div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden pb-24">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-color)] rounded-full blur-[250px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--accent-color)] rounded-full blur-[200px] opacity-5 pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto p-6 md:p-12 relative z-10">
          
          <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
                {t.sidebar.settings || 'System Settings'}
              </h1>
              <p className="text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-[0.4em] mt-2 opacity-60">
                Configure your command center preferences
              </p>
            </div>
            <button 
              onClick={handleSave}
              className="px-8 py-4 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-[0_10px_30px_rgba(255,106,0,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
            >
              <Save size={16} /> {(t as any).save || "Commit Changes"}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Core Configs */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Appearance Section */}
              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Palette size={180} />
                </div>
                
                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-10 text-[var(--text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                    <Palette size={18} />
                  </div>
                  {t.appearance || 'Visual Experience'}
                </h2>

                <div className="space-y-10 relative z-10">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-[var(--text-secondary)] mb-4 tracking-widest">Interface Mode</label>
                    <div className="flex p-1.5 w-full max-w-md gap-2 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)]">
                      <button 
                        onClick={() => handleThemeChange("light", selectedColor)} 
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${!isDark ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-md' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Light Mode
                      </button>
                      <button 
                        onClick={() => handleThemeChange("dark", selectedColor)} 
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${isDark ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-md' : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Dark Obsidian
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-[var(--text-secondary)] mb-6 tracking-widest flex items-center gap-2">
                      Accent Color <Sparkles size={14} className="text-[var(--accent-color)]" />
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      
                    </div>
                  </div>
                </div>
              </section>

              {/* Localization Section */}
              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl relative group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Globe size={180} />
                </div>
                
                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-10 text-[var(--text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                    <Globe size={18} />
                  </div>
                  System Language
                </h2>

                <div className="max-w-md">
                  <label className="block text-[10px] uppercase font-black text-[var(--text-secondary)] mb-4 tracking-widest">Select Language</label>
                  <LanguageSwitcher className="w-full z-20000" />
                </div>
              </section>

              {/* Security Section (Placeholder) */}
              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-10 text-[var(--text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <Lock size={18} />
                  </div>
                  Security & Privacy
                </h2>
                
                <div className="space-y-4">
                  {[
                    { label: 'Two-Factor Authentication', status: 'Disabled', icon: <Shield size={16}/> },
                    { label: 'Active Sessions', status: '3 Devices', icon: <Cpu size={16}/> },
                    { label: 'Data Encryption', status: 'Enabled (AES-256)', icon: <Lock size={16}/> }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-[var(--bg-app)]/50 rounded-2xl border border-[var(--border-color)] group cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="text-[var(--text-secondary)]">{item.icon}</div>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.status}</span>
                        <ChevronRight size={14} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - System Modules */}
            <aside className="lg:col-span-4 space-y-8">
              
              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-[var(--text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                    <Bell size={18} />
                  </div>
                  Alerts
                </h2>
                
                <div className="space-y-6">
                  {['Push Notifications', 'Email Digests', 'Slack Integration'].map((label, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)] opacity-80">{label}</span>
                      <div className="w-10 h-5 bg-[var(--accent-color)]/20 rounded-full relative cursor-not-allowed">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-[var(--accent-color)] rounded-full shadow-[0_0_8px_var(--accent-color)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 to-transparent pointer-events-none" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-[var(--text-primary)] flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                    <Zap size={18} />
                  </div>
                  System Performance
                </h2>
                
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-color)]">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Memory Usage</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">Optimal</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                      <div className="h-full w-[24%] bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]" />
                    </div>
                  </div>
                  
                  <button className="w-full py-4 rounded-xl border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-color)] hover:text-white transition-all cursor-not-allowed">
                    Purge Cache Storage
                  </button>
                </div>
              </section>

              <section className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[var(--accent-color)]">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Advanced Console</h4>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Build v4.2.0-STABLE</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[9px] text-green-500/70 space-y-1">
                  <p> SYSTEM_READY</p>
                  <p> KERNEL_ACTIVE: 0x823F</p>
                  <p> ENCRYPTION: SECURE</p>
                  <p className="animate-pulse"> WAITING_FOR_INPUT_</p>
                </div>
              </section>

            </aside>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
