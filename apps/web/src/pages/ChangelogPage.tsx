import { motion } from "framer-motion";
import { GitCommit, Star, Zap, FileText, Database, LayoutGrid, CheckCircle2, Server, PieChart, Layers, Cpu } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Changelog() {
  const releases = [
    {
      version: "1.2.6",
      date: "March 09, 2026",
      tag: "Latest",
      highlights: [
        {
          icon: Cpu,
          badge: "Inventory & Tracking",
          title: "ChipControl & SampleControl Modules",
          color: "text-cyan-500",
          bgColor: "bg-cyan-500/10",
          borderColor: "group-hover:border-cyan-500/50",
          description: "Complete overhaul of the ChipControl and SampleControl modules. They are now 100% functional and feature robust real-time database integration.",
          details: [
            "Full real-time synchronization with Firestore database.",
            "End-to-end lifecycle tracking for chips and samples.",
            "Reliable CRUD operations with secure access control.",
            "Automated status updates and seamless data persistence."
          ]
        },
        {
          icon: Database,
          badge: "Integration & Data",
          title: "ETL Research Engine & Database",
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          borderColor: "group-hover:border-purple-500/50",
          description: "Implementation of a complete pipeline that simulates Data Extraction, Transformation, and Loading (ETL). The system now features robust real-time database integration (Firestore).",
          details: [
            "Configurable data collection (APIs, DBs, Web Scraping).",
            "Automatic generation of advanced analytical reports in PDF.",
            "Capture and storage of monthly Historical Snapshots.",
            "Real-time synchronization of opportunities and metrics."
          ]
        },
        {
          icon: PieChart,
          badge: "Business Intelligence",
          title: "Win/Loss Dashboard & Advanced Export",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "group-hover:border-blue-500/50",
          description: "New interactive management dashboard with data segmentation by ecosystem, client, and technical group, equipped with a high-fidelity export engine.",
          details: [
            "HTML/Canvas to multi-page PDF conversion using jsPDF.",
            "Overview mode with timeline evolution charts (Recharts).",
            "Detailed analysis of contract win/loss reasons.",
            "Interactive zoom control in the print layout."
          ]
        },
        {
          icon: LayoutGrid,
          badge: "New Feature",
          title: "Data Compare Tool (Excel & PDF)",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "group-hover:border-emerald-500/50",
          description: "Powerful reconciliation and auditing tool. Developed to analyze large volumes of data and extract discrepancies with surgical precision.",
          details: [
            "Cross-comparison of up to 5 Excel spreadsheets simultaneously.",
            "Fuzzy Match algorithm to identify text similarities.",
            "Reading and text extraction in PDFs paragraph by paragraph.",
            "Automatically generated spreadsheets with visual change tracking."
          ]
        },
        {
          icon: FileText,
          badge: "Documentation",
          title: "Interactive Pantheon V4 Testbook",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "group-hover:border-orange-500/50",
          description: "Complete digitization of technical and test documentation, transforming static PDFs into an immersive and responsive web experience.",
          details: [
            "Optimized side navigation with chapter anchors.",
            "Integrated image viewer with zoom support (Lightbox).",
            "Contextual alerts for preconditions, risks, and usage tips.",
            "Adaptive layout for tablets and ultrawide monitors."
          ]
        }
      ]
    },
    {
      version: "1.2.5",
      date: "February 2026",
      tag: "Stable",
      highlights: [
        {
          icon: Star,
          badge: "UI / UX",
          title: "Global Animation Ecosystem",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "group-hover:border-amber-500/50",
          description: "Complete visual restructuring using Framer Motion to ensure fluidity, tactile responses, and seamless page transitions.",
          details: [
            "Standardized page transitions (Fade and Slide) across all routes.",
            "Micro-interactions on buttons, cards, and modals.",
            "Enhanced glassmorphism (background blur) on panels."
          ]
        },
        {
          icon: Zap,
          badge: "Performance",
          title: "Rendering Optimization",
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          borderColor: "group-hover:border-rose-500/50",
          description: "Deep refactoring of the component tree and global state management, targeting low-performance environments.",
          details: [
            "Extensive use of useMemo and useCallback in heavy dashboards.",
            "30% reduction in initial load time.",
            "Lazy loading implemented for charts and complex modules."
          ]
        }
      ]
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-6 md:p-12 lg:p-20 relative overflow-hidden font-sans">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-color)] rounded-full blur-[200px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[var(--text-primary)] rounded-full blur-[250px] opacity-[0.03] pointer-events-none" />

        <header className="mb-20 relative z-10 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm mb-6"
          >
            <GitCommit size={18} className="text-[var(--accent-color)]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Release History</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6"
          >
            Changelog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Follow the detailed record of improvements, new features, and architectural optimizations of our platform.
          </motion.p>
        </header>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Timeline vertical line */}
          <div className="absolute left-[27px] md:left-[39px] top-4 bottom-10 w-1 bg-gradient-to-b from-[var(--accent-color)] via-[var(--border-color)] to-transparent rounded-full" />

          <div className="space-y-24">
            {releases.map((release, releaseIdx) => (
              <motion.div 
                key={release.version}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: releaseIdx * 0.1 }}
                className="relative pl-16 md:pl-28"
              >
                {/* Timeline Marker */}
                <div className="absolute left-0 top-1.5 w-14 h-14 md:w-20 md:h-20 bg-[var(--bg-app)] rounded-full flex items-center justify-center border-[6px] border-[var(--bg-app)] z-10 shadow-sm">
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xs md:text-sm transition-all duration-300 ${release.tag === 'Latest' ? 'bg-[var(--accent-color)] text-white shadow-[0_0_20px_rgba(255,106,0,0.5)] scale-110' : 'bg-[var(--card-bg)] border-2 border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                    v{release.version.split('.')[2]}
                  </div>
                </div>

                {/* Release Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
                  <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">Version {release.version}</h2>
                  <div className="flex items-center gap-3 mt-1 md:mt-0">
                    <span className="text-sm font-bold text-[var(--text-secondary)] bg-[var(--card-bg)] px-4 py-1.5 rounded-full border border-[var(--border-color)] shadow-sm">
                      {release.date}
                    </span>
                    {release.tag === "Latest" && (
                      <span className="px-4 py-1.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest rounded-full border border-[var(--accent-color)]/20 animate-pulse">
                        Current Version
                      </span>
                    )}
                  </div>
                </div>

                {/* Updates Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {release.highlights.map((item, itemIdx) => {
                    const Icon = item.icon;
                    return (
                      <div key={itemIdx} className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-sm hover:shadow-xl group ${item.borderColor}`}>
                        <div className="flex flex-col md:flex-row items-start gap-6">
                          
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.bgColor} ${item.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
                            <Icon size={28} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.bgColor} ${item.color}`}>
                                {item.badge}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed text-base mb-6">
                              {item.description}
                            </p>

                            {/* Update Details */}
                            {item.details && (
                              <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-5">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                  <Layers size={14} className="text-[var(--accent-color)]" /> What's new:
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {item.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                                      <CheckCircle2 size={16} className={`${item.color} shrink-0 mt-0.5 opacity-80`} />
                                      <span className="leading-snug">{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}