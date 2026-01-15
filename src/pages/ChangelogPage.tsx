import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Rocket, Shield, Wrench, Zap, Users, Bell, Database } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function ChangelogPage() {
  const navigate = useNavigate();
  
  // Initial state includes the current major update manually for display
  const [versions, setVersions] = useState<any[]>([
    {
      id: "v1.2.0-beta",
      version: "1.2.0 Beta",
      title: "The Collaboration & Intelligence Update",
      releaseDate: new Date().toISOString(),
      type: "major",
      description: "This major release transforms the PODS Administrator into a living, breathing ecosystem. We have replaced static placeholders with real-time Firestore data streams, introduced a Global Notification Center, and launched the 'Fast Track' collective task system. Every action—from task assignments to board movements—is now logged, indexed, and actionable in real-time.",
      changes: [
        "Real-time Collective Daily Goals (Fast Track)",
        "Global Notification Center with Deep Links",
        "Automated System & Audit Logs",
        "Dynamic Dashboard Statistics (Live Counts)",
        "User Assignment & Push Alerts in Kanban",
        "Firestore Indexes Optimization & Security Rules"
      ]
    }
  ]);

  useEffect(() => {
    const q = query(collection(db, "app_versions"), orderBy("releaseDate", "desc"));
    const unsub = onSnapshot(q, (s) => {
      const dbVersions = s.docs.map(d => ({ id: d.id, ...d.data() }));
      // Merge DB versions with the hardcoded current version if needed
      setVersions(prev => {
        // Avoid duplicates if v1.2.0 is added to DB later
        const filteredDb = dbVersions.filter((v: any) => v.version !== "1.2.0 Beta");
        return [...prev, ...filteredDb];
      });
    });
    return unsub;
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'major': return <Rocket size={20} className="text-green-400" />;
      case 'security': return <Shield size={20} className="text-amber-400" />;
      case 'feature': return <Zap size={20} className="text-purple-400" />;
      default: return <Wrench size={20} className="text-blue-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'major': return "text-green-400 bg-green-400/10 border-green-400/20";
      case 'security': return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-8 lg:p-20">
        
        <header className="flex items-center gap-6 mb-20">
          <button onClick={() => navigate(-1)} className="p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl hover:border-[var(--accent-color)] transition-all">
            <ArrowLeft size={20} className="text-[var(--text-primary)]" />
          </button>
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              Changelog
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              System Evolution Timeline
            </p>
          </div>
        </header>

        <div className="max-w-5xl relative space-y-20 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-[var(--accent-color)] before:via-[var(--border-color)] before:to-transparent before:opacity-30">
          
          {versions.map((version) => (
            <div key={version.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              
              {/* Central Node */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] shadow-[0_0_20px_rgba(0,0,0,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-[var(--accent-color)] group-hover:scale-110 transition-all duration-500">
                {getIcon(version.type)}
              </div>

              {/* Content Card */}
              <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-1 bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-color)] shadow-xl hover:shadow-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/30 transition-all duration-500">
                <div className="bg-[var(--bg-app)]/50 p-8 rounded-[2.4rem] h-full relative overflow-hidden">
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 blur-3xl rounded-full -mr-10 -mt-10" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-2xl text-[var(--text-primary)] tracking-tight">v{version.version}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeColor(version.type)}`}>
                                {version.type}
                            </span>
                        </div>
                        <time className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 bg-[var(--bg-app)] px-3 py-1 rounded-lg border border-[var(--border-color)]">
                            {new Date(version.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                    </div>
                    
                    <h4 className="font-bold text-base text-[var(--accent-color)] uppercase tracking-wide mb-4 leading-tight">
                        {version.title}
                    </h4>
                    
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium opacity-80 mb-8 border-l-2 border-[var(--border-color)] pl-4">
                        {version.description}
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {version.changes && version.changes.map((change: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_5px_currentColor]" />
                                <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                                    {change}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
              </div>
            </div>
          ))}

          {versions.length === 0 && (
             <div className="text-center py-32 opacity-30">
                <Rocket size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">System timeline initialized</p>
             </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}