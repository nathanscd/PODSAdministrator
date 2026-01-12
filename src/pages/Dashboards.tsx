import { useEffect, useState, useRef } from "react";
import PageTransition from "../components/PageTransition";
import html2canvas from "html2canvas";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Opportunity {
  id: string;
  utility: string;
  description: string;
  technicalSalesGroup: string;
  yearStart: number;
  yearEnd: number;
  country: string;
  ecosystem: string;
  status: "Good" | "Attention" | "Bad" | "Archived" | "Lost" | "Post Sales";
  businessStages: string;
  qty: number;
  lastCustomerDiscussion: string;
  notes: string;
}

interface DashboardData {
  totalOpportunities: number;
  goodOpportunities: number;
  attentionOpportunities: number;
  badOpportunities: number;
  opportunities: Opportunity[];
}

const StockifyCard = ({ icon: Icon, title, value, badge, variant = "default" }: any) => {
  const isFilled = variant === "filled";
  return (
    <div className={`relative ml-10 -mr-10 h-[180px] w-full group rounded-[2.5rem] p-7 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1
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
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [ecosystemData, setEcosystemData] = useState<any[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const STATUS_COLORS = {
    "Good": "#10b981",
    "Attention": "#f59e0b",
    "Bad": "#ef4444",
    "Archived": "#6b7280",
    "Lost": "#8b5cf6",
    "Post Sales": "#3b82f6"
  };

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const mockOpportunities: Opportunity[] = [
        {
          id: "1",
          utility: "ENEL",
          description: "ELECTRODEPEND IENTES 4500",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "ARGENTINA",
          ecosystem: "Smart Metering",
          status: "Good",
          businessStages: "RFI - Budgetary Quotation",
          qty: 4.5,
          lastCustomerDiscussion: "26/11/2025",
          notes: "Clarification deadline changed"
        },
        {
          id: "2",
          utility: "COPEL",
          description: "SIGFI 2000",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2026,
          country: "BRAZIL",
          ecosystem: "Solar",
          status: "Good",
          businessStages: "RFP - Bidding Process",
          qty: 2.0,
          lastCustomerDiscussion: "17/11/2025",
          notes: "New RFP to be opened in 2026"
        },
        {
          id: "3",
          utility: "ENERGISA",
          description: "Start AMI",
          technicalSalesGroup: "1st Group",
          yearStart: 2024,
          yearEnd: 2025,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Attention",
          businessStages: "Archived",
          qty: 23.0,
          lastCustomerDiscussion: "17/11/2025",
          notes: "Analysis will be concluded until feb 2026"
        },
        {
          id: "4",
          utility: "ENEL",
          description: "AMI - Wi-SUN and/or PLC Meters and More - RJ",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Good",
          businessStages: "Product Codes for Solution",
          qty: 7.81,
          lastCustomerDiscussion: "12/11/2025",
          notes: "Technical and economic evaluations"
        },
        {
          id: "5",
          utility: "ENERGISA",
          description: "MDM Opportunity",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2026,
          country: "BRAZIL",
          ecosystem: "Software",
          status: "Good",
          businessStages: "Market Prospection",
          qty: 1.0,
          lastCustomerDiscussion: "17/11/2025",
          notes: "Architecture revision in progress"
        },
        {
          id: "6",
          utility: "ENEL",
          description: "SMC - 2026",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2026,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Good",
          businessStages: "Market Prospection",
          qty: 1.0,
          lastCustomerDiscussion: "24/11/2025",
          notes: "New investment for next year"
        },
        {
          id: "7",
          utility: "COPEL",
          description: "Isolated meters on Phase 1 Area",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Good",
          businessStages: "RFI - Budgetary Quotation",
          qty: 9.0,
          lastCustomerDiscussion: "27/11/2025",
          notes: "Phase 1 area coverage"
        },
        {
          id: "8",
          utility: "COPEL",
          description: "Smart Meter replacing conventional meter purchases",
          technicalSalesGroup: "1st Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Good",
          businessStages: "Market Prospection",
          qty: 30.0,
          lastCustomerDiscussion: "10/11/2025",
          notes: "New RFP for smart meter replacement"
        },
        {
          id: "9",
          utility: "CEMIG",
          description: "OMB Door Opening Module",
          technicalSalesGroup: "2nd Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "BRAZIL",
          ecosystem: "Smart Metering",
          status: "Post Sales",
          businessStages: "Post Sales",
          qty: 3.2,
          lastCustomerDiscussion: "19/11/2025",
          notes: "Orca functionalities under validation"
        },
        {
          id: "10",
          utility: "ANDE",
          description: "Alumbrado Publico Telegestión",
          technicalSalesGroup: "2nd Group",
          yearStart: 2025,
          yearEnd: 2025,
          country: "PARAGUAY",
          ecosystem: "Street Lighting",
          status: "Good",
          businessStages: "Market Prospection",
          qty: 20.0,
          lastCustomerDiscussion: "12/11/2025",
          notes: "Technical Specification Analysis"
        },
      ];

      const processedData = processOpportunitiesData(mockOpportunities);
      
      setData({
        totalOpportunities: mockOpportunities.length,
        goodOpportunities: mockOpportunities.filter(o => o.status === "Good").length,
        attentionOpportunities: mockOpportunities.filter(o => o.status === "Attention").length,
        badOpportunities: mockOpportunities.filter(o => o.status === "Bad").length,
        opportunities: mockOpportunities
      });

      setChartData(processedData.timelineData);
      setStatusData(processedData.statusData);
      setGroupData(processedData.groupData);
      setCountryData(processedData.countryData);
      setEcosystemData(processedData.ecosystemData);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const processOpportunitiesData = (opportunities: Opportunity[]) => {
    const timelineData = opportunities.reduce((acc: any, opp) => {
      const year = opp.yearStart;
      const existing = acc.find((item: any) => item.name === `${year}`);
      if (existing) {
        existing.Oportunidades += 1;
      } else {
        acc.push({ name: `${year}`, Oportunidades: 1 });
      }
      return acc;
    }, []).sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name));

    const statusData = Object.entries(
      opportunities.reduce((acc: any, opp) => {
        acc[opp.status] = (acc[opp.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const groupData = Object.entries(
      opportunities.reduce((acc: any, opp) => {
        acc[opp.technicalSalesGroup] = (acc[opp.technicalSalesGroup] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const countryData = Object.entries(
      opportunities.reduce((acc: any, opp) => {
        acc[opp.country] = (acc[opp.country] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const ecosystemData = Object.entries(
      opportunities.reduce((acc: any, opp) => {
        acc[opp.ecosystem] = (acc[opp.ecosystem] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return {
      timelineData,
      statusData,
      groupData,
      countryData,
      ecosystemData
    };
  };

  const handleExport = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `report-opportunities-${new Date().getTime()}.png`;
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
            <p className="text-[var(--text-secondary)] text-sm font-medium tracking-widest uppercase opacity-60">AMI Opportunities Dashboard</p>
          </div>
          <button 
            onClick={handleExport}
            className="group flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-app)] px-6 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <FileDown size={20} />
            Export Report
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
          
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
                  <h3 className="font-bold uppercase tracking-widest text-sm">Status Distribution</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-[var(--accent-color)] rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-bold italic uppercase leading-none">opportunities overview</h3>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Opportunities</span>
                    <p className="text-3xl font-black">{data?.totalOpportunities}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Good Status</span>
                    <p className="text-2xl font-black">{data?.goodOpportunities}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Attention</span>
                    <p className="text-2xl font-black">{data?.attentionOpportunities}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="text-[var(--accent-color)]" size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-sm">By Sales Group</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" tick={{fill: 'var(--text-primary)', fontSize: 12}} />
                      <YAxis tick={{fill: 'var(--text-primary)', fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '15px' }} />
                      <Bar dataKey="value" fill="var(--accent-color)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-[var(--accent-color)]" size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-sm">By Country</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis type="number" tick={{fill: 'var(--text-primary)', fontSize: 12}} />
                      <YAxis dataKey="name" type="category" tick={{fill: 'var(--text-primary)', fontSize: 12}} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '15px' }} />
                      <Bar dataKey="value" fill="var(--accent-color)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Box className="text-[var(--accent-color)]" size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">By Ecosystem</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ecosystemData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis type="number" tick={{fill: 'var(--text-primary)', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" tick={{fill: 'var(--text-primary)', fontSize: 12}} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '15px' }} />
                    <Bar dataKey="value" fill="var(--accent-color)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StockifyCard icon={Activity} title="total opportunities" value={data?.totalOpportunities} badge={`+${Math.round((data?.goodOpportunities || 0) / (data?.totalOpportunities || 1) * 100)}%`} />
            <StockifyCard icon={CheckCircle} title="Good Status" value={data?.goodOpportunities} variant="filled" />
            <StockifyCard icon={AlertCircle} title="Attention" value={data?.attentionOpportunities} />
            <StockifyCard icon={XCircle} title="Bad Status" value={data?.badOpportunities} variant="filled" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
