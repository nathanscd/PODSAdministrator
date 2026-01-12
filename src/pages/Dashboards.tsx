import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  users: number;
  activePods: number;
  monthlyRevenue: string;
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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const bgImage = "https://images.unsplash.com/photo-1721020390853-28f20fdc9f06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setData({
        users: 5,
        activePods: 20,
        monthlyRevenue: "10",
        serverStatus: "Online",
        recentLogs: [
          { id: 1, action: "Nova oportunidade criada", time: "10 min atrás", user: "Admin" },
          { id: 2, action: "Atualização de sistema", time: "1h atrás", user: "System" },
          { id: 3, action: "Novo usuário registrado", time: "3h atrás", user: "Web" },
          { id: 4, action: "Backup realizado", time: "5h atrás", user: "Server" },
        ],
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-8 space-y-4 animate-pulse max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200/50 w-1/4 rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200/50 rounded-xl"></div>
            <div className="h-32 bg-gray-200/50 rounded-xl"></div>
            <div className="h-32 bg-gray-200/50 rounded-xl"></div>
            <div className="h-32 bg-gray-200/50 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="col-span-2 h-80 bg-gray-200/50 rounded-xl"></div>
            <div className="h-80 bg-gray-200/50 rounded-xl"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto text-[var(--text-primary)]">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Visão geral do sistema PODS</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Usuários Totais</h3>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-full">👥</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.users}</p>
            <span className="text-xs text-green-500 font-medium">+12% este mês</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Chips Disponíveis</h3>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-full">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.activePods}</p>
            <span className="text-xs text-gray-400">10 4G | 10 NB-IoT</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Novos projetos</h3>
              <span className="p-2 bg-green-50 text-green-600 rounded-full">🎯</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.monthlyRevenue}</p>
            <span className="text-xs text-green-500 font-medium">+5% vs. anterior</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Status do Sistema</h3>
              <span className={`p-2 rounded-full ${data?.serverStatus === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                🔌
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.serverStatus}</p>
            <span className="text-xs text-gray-400">Uptime: 99.9%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
            <div 
              className="absolute inset-0 bg-cover bg-center z-0" 
              style={{ backgroundImage: `url(${bgImage})` }} 
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] z-0"></div>
            
            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Análise por oportunidade</h3>
                    <p className="text-sm text-gray-300">Monitoramento de tráfego semanal</p>
                </div>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                  <defs>
                    <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#fff" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </svg>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)', 
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Oportunidades" 
                      stroke="#fff" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAcessos)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Logs Recentes</h3>
            <div className="space-y-4">
              {data?.recentLogs.map((log) => (
                <div key={log.id} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-400">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-blue-600 border border-blue-100 rounded hover:bg-blue-50 transition-colors">
              Ver todos os logs
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}