import { ExternalLink, Server, Lock, Cloud } from "lucide-react";

export default function Orcas() {
  const orcaEnvironments = [
    { name: "Celesc QA", url: "http://137.131.187.143:8080/uap-ui/ui/page/index.html", type: "Quality Assurance" },
    { name: "Hybrid NIC", url: "http://168.138.226.103:8080/uap-ui/ui/page/index.html", type: "Production" },
    { name: "Zeus TM", url: "http://150.230.65.107:8080/uap-ui/ui/page/index.html", type: "Production" },
    { name: "ANDE Streetlight", url: "http://163.176.169.192:1443/uap-ui/ui/page/index.html", type: "Production" },
    { name: "Pantheon NG", url: "http://129.148.40.172:8080/uap-ui/ui/page/index.html", type: "Next Generation" }
  ];

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-[var(--bg-app)] font-sans transition-colors duration-400">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-color)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[var(--text-secondary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-[var(--accent-color)] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <header className="relative z-10 mx-auto max-w-[1400px] px-8 pt-20 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-2xl shadow-[0_4px_15px_var(--shadow-color)]">
              <Cloud size={32} strokeWidth={2.5} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Access to ORCA Cloud Environments
            </p>
          </div>
          <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
            Cloud Environments
          </h1>
        </div>
      </header>

      <div className="relative z-10 px-8 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {orcaEnvironments.map((env, idx) => (
            <a 
              key={idx} 
              href={env.url} 
              target="_blank"
              className="group bg-[var(--card-bg)] backdrop-blur-[16px] p-6 rounded-3xl border border-[var(--border-color)] shadow-[0_4px_15px_var(--shadow-color)] hover:shadow-[0_8px_25px_var(--shadow-color)] hover:-translate-y-1 hover:border-[var(--accent-color)] transition-all duration-300 flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="bg-[var(--bg-app)] text-[var(--accent-color)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors duration-300">
                  <Server size={24} strokeWidth={2.5} />
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-color)] group-hover:bg-[var(--accent-color)] group-hover:border-transparent transition-all duration-300">
                  <ExternalLink size={14} className="text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1">
                  {env.type}
                </p>
                <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  {env.name}
                </h2>
              </div>
            </a>
          ))}
        </div>

        <div className="xl:col-span-4 space-y-8 flex flex-col">
          <div className="bg-[var(--text-primary)] p-8 rounded-3xl border border-[var(--border-color)] shadow-[0_4px_20px_var(--shadow-color)] relative overflow-hidden flex-grow transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)] rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4 mb-8">
              <div className="bg-[var(--bg-app)] text-[var(--text-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                <Lock size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[var(--bg-app)]">Credentials</h2>
            </div>
            
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse"></span>
                  ORCA 10+
                </p>
                <div className="bg-[var(--bg-app)]/10 backdrop-blur-sm p-4 rounded-2xl border border-[var(--bg-app)]/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[var(--bg-app)]/70 uppercase tracking-wider">USR</span>
                    <span className="text-sm font-mono font-bold text-[var(--bg-app)]">ORCAAdmin</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[var(--bg-app)]/70 uppercase tracking-wider">PWD</span>
                    <span className="text-sm font-mono font-bold text-[var(--bg-app)]">ORCAAdmin2025--</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]"></span>
                  Legacy (Pre-10)
                </p>
                <div className="bg-[var(--bg-app)]/10 backdrop-blur-sm p-4 rounded-2xl border border-[var(--bg-app)]/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[var(--bg-app)]/70 uppercase tracking-wider">USR</span>
                    <span className="text-sm font-mono font-bold text-[var(--bg-app)]">MDCAdmin</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[var(--bg-app)]/70 uppercase tracking-wider">PWD</span>
                    <span className="text-sm font-mono font-bold text-[var(--bg-app)]">MDCAdmin2019-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}