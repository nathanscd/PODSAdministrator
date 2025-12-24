import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";

interface DashboardData {
  users: number;
  activePods: number;
  monthlyRevenue: string;
  serverStatus: "Online" | "Offline" | "Maintenance";
  recentLogs: Array<{ id: number; action: string; time: string; user: string }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800)); 
      
      setData({
        users: 1420,
        activePods: 85,
        monthlyRevenue: "R$ 24.500,00",
        serverStatus: "Online",
        recentLogs: [
          { id: 1, action: "Novo pod criado", time: "10 min atrás", user: "Admin" },
          { id: 2, action: "Atualização de sistema", time: "1h atrás", user: "System" },
          { id: 3, action: "Novo usuário registrado", time: "3h atrás", user: "Web" },
          { id: 4, action: "Backup realizado", time: "5h atrás", user: "Server" },
        ]
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
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
              <h3 className="text-sm font-medium text-gray-500">Pods Ativos</h3>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-full">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.activePods}</p>
            <span className="text-xs text-gray-400">85/100 slots</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Receita Mensal</h3>
              <span className="p-2 bg-green-50 text-green-600 rounded-full">💰</span>
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
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Analítico de Acesso</h3>
            <div className="h-64 flex items-end justify-between space-x-2 px-4 border-b border-l border-gray-200 pb-2">
              {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                    {h * 10} acessos
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Logs Recentes</h3>
            <div className="space-y-4">
              {data?.recentLogs.map((log) => (
                <div key={log.id} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></div>
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