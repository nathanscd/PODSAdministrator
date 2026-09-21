import { ExternalLink, FileText, Server, Lock, ChevronRight, LayoutTemplate } from "lucide-react";

export default function Templates() {
  const templateCategories = [
    {
      title: "Commercial Proposals",
      items: ["Pricing Model", "Bidding Solicitations"],
      link: ["about:blank","about:blank" ]
    },
    {
      title: "Technical Documentation",
      items: ["SMC Client Informations", "Zeus-TM Client Informations"],
      link: ["https://hexingbrasil.sharepoint.com/:x:/s/MSSD/TechSales/IQBsu2lWmO8rT5zq30L-0S1iAd6oHUnHCUjs_oGwU2vAlf0?e=HJ0xdY","https://hexingbrasil.sharepoint.com/:x:/s/MSSD/TechSales/IQCq-GA3TOGzQ7HNP-VS6u3hAa0DGabGQlcAaSc5ETYlOdw?e=nOYmsw" ]
    },
    {
      title: "Project Management",
      items: ["Kick-off Presentation", "Weekly Status Report" ],
      link: ["about:blank","about:blank" ]
    },
    {
      title: "Legal & Compliance",
      items: ["NDA Template", "Compliance Checklist", "Contract Standard Clauses"],
      link: ["about:blank","about:blank", "about:blank" ]
    }
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
              <LayoutTemplate size={32} strokeWidth={2.5} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Executive Summary & Resource Hub
            </p>
          </div>
          <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
            Documents
          </h1>
        </div>
      </header>

      <div className="relative z-10 px-8 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {templateCategories.map((category, idx) => (
            <div 
              key={idx} 
              className="bg-[var(--card-bg)] backdrop-blur-[16px] p-8 rounded-3xl border border-[var(--border-color)] shadow-[0_4px_15px_var(--shadow-color)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[var(--bg-app)] text-[var(--text-primary)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">{category.title}</h2>
              </div>
              <div className="space-y-4 flex-grow flex flex-col justify-center">

                  <a 
                    href={category.link[0]} 
                    target="_blank"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--accent-color)] border border-[var(--border-color)] hover:border-transparent shadow-[0_2px_8px_var(--shadow-color)] transition-all duration-300"
                  >
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white transition-colors duration-300">{category.items[0]}</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--card-bg)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-transparent group-hover:bg-white/20 transition-all duration-300">
                      <ExternalLink size={14} className="text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
                    </div>
                  </a>

                  <a 
                    href={category.link[1]} 
                    target="_blank"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--accent-color)] border border-[var(--border-color)] hover:border-transparent shadow-[0_2px_8px_var(--shadow-color)] transition-all duration-300"
                  >
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white transition-colors duration-300">{category.items[1]}</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--card-bg)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-transparent group-hover:bg-white/20 transition-all duration-300">
                      <ExternalLink size={14} className="text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
                    </div>
                  </a>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}