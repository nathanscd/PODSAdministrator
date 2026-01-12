import { useEffect, useState, useRef } from "react";
import PageTransition from "../components/PageTransition";
import html2canvas from "html2canvas";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  ArrowUpRight, 
  Activity, 
  Zap, 
  Box, 
  FileDown, 
  Clock, 
  TrendingUp, 
  Users 
} from "lucide-react";

interface DashboardData {
  users: number;
  activePods: number;
  Opportunities: string;
  serverStatus: "Online" | "Offline" | "Maintenance";
  recentLogs: Array<{ id: number; action: string; time: string; user: string }>;
}

const chartData = [
  { name: "Seg", Oportunidades: 40 },
  { name: "Ter", Oportunidades: 65 },
  { name: "Qua", Oportunidades: 30 },
  { name: "Qui", Oportunidades: 80 },
  { name: "Sex", Oportunidades: 55 },
  { name: "Sab", Oportunidades: 90 },
  { name: "Dom", Oportunidades: 70 },
];

const StockifyCard = ({ icon: Icon, title, value, badge, variant = "default" }: any) => {
  const isFilled = variant === "filled";
  return (
    <div className={`relative h-[180px] w-full group rounded-[2.5rem] p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1
      ${isFilled ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)]'}`}>
      
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl border ${isFilled ? 'bg-white/20 border-white/10' : 'bg-[var(--bg-app)] border-[var(--border-color)]'}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isFilled ? 'bg-white/20 border-white/10' : 'bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
              {badge}
            </span>
          )}
          <div className={`p-2 rounded-full border ${isFilled ? 'border-white/20 bg-white/10' : 'border-[var(--border-color)] bg-[var(--bg-app)]'} transition-transform group-hover:rotate-45`}>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <h3 className="text-4xl font-bold tracking-tight leading-none mb-1">{value}</h3>
        <span className="text-xs font-medium uppercase tracking-widest opacity-70">{title}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData({
        users: 1250,
        activePods: 24,
        Opportunities: "360",
        serverStatus: "Online",
        recentLogs: [
          { id: 1, action: "Nova oportunidade criada", time: "10m", user: "Admin" },
          { id: 2, action: "Backup do sistema finalizado", time: "1h", user: "System" },
          { id: 3, action: "Novo projeto iniciado", time: "3h", user: "Nathanael" },
        ],
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `report-pods-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]"><Zap className="animate-pulse text-[var(--accent-color)]" /></div>;

  return (
    <PageTransition>
      <div ref={printRef} className="p-6 md:p-10 max-w-[1600px] mx-auto text-[var(--text-primary)]">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Overview</h1>
            <p className="text-[var(--text-secondary)] text-sm font-medium tracking-widest uppercase opacity-60">Analytics Dashboard</p>
          </div>
          <button 
            onClick={handleExport}
            className="group flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-app)] px-6 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <FileDown size={20} />
            Export Report
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <div className="xl:col-span-3 flex flex-col gap-8">
            <div className="relative h-[450px] rounded-[3rem] overflow-hidden border border-[var(--border-color)] shadow-2xl group bg-black">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-110 blur-[4px] group-hover:scale-115 rotation-x-5 transition-transform duration-[2s]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1721020390853-28f20fdc9f06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold italic uppercase tracking-tighter">overview opportunities</h2>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl"><TrendingUp /></div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px' }} />
                      <Area type="monotone" dataKey="Oportunidades" stroke="var(--accent-color)" strokeWidth={4} fill="url(#colorAcc)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="text-[var(--accent-color)]" size={20} />
                        <h3 className="font-bold uppercase tracking-widest text-sm">LOGS</h3>
                    </div>
                    <div className="space-y-6">
                        {data?.recentLogs.map((log) => (
                            <div key={log.id} className="relative pl-6 border-l-2 border-[var(--border-color)] group hover:border-[var(--accent-color)] transition-colors">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] group-hover:bg-[var(--accent-color)] group-hover:border-[var(--accent-color)] transition-all" />
                                <p className="text-sm font-bold leading-none">{log.action}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{log.user}</span>
                                    <span className="text-[10px] font-mono opacity-50">{log.time} ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-[var(--accent-color)] rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <h3 className="text-xl font-bold italic uppercase leading-none">opportunities won</h3>
                    <div className="mt-8">
                        <p className="text-5xl font-black">63,9%</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StockifyCard icon={Activity} title="opportunities registred" value={data?.Opportunities} badge="+12%" />
            <StockifyCard icon={Box} title="Available SIM cards" value={data?.activePods} variant="filled" />
            <StockifyCard icon={Zap} title="Server Status" value={data?.serverStatus} badge="Online" />
            <StockifyCard icon={Users} title="Active Users" value={data?.users}  variant="filled" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}