import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { Opportunity } from "../types";
import PageTransition from "../components/PageTransition";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { FileDown, Loader2, Users, Briefcase, BarChart3, List, ShieldCheck, Clock } from "lucide-react";

export default function Report() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

  useEffect(() => {
    const q = query(collection(db, "opportunities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
      setOpportunities(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const pages = reportRef.current.querySelectorAll(".pdf-page");
    
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i] as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save(`AMI_Technical_Report_${new Date().getFullYear()}.pdf`);
  };

  // --- LÓGICA DE DADOS ---

  const getStatus = (o: Opportunity) => o.status?.toLowerCase() || "";

  const ecosystemData = Object.entries(
    opportunities.reduce((acc: any, opp) => {
      acc[opp.ecosystem || "Other"] = (acc[opp.ecosystem || "Other"] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const getGroupStats = (groupKeyword: string) => {
    const groupOpps = opportunities.filter(o => o.technicalSalesGroup?.includes(groupKeyword));
    return {
      name: groupKeyword,
      Good: groupOpps.filter(o => getStatus(o).includes("good")).length,
      Attention: groupOpps.filter(o => getStatus(o).includes("attention")).length,
      Bad: groupOpps.filter(o => getStatus(o).includes("bad")).length,
    };
  };

  const winLossData = [
    getGroupStats("1st Group"),
    getGroupStats("2nd Group"),
    getGroupStats("3rd Group"),
  ];

  const podsMembers = [
    { name: "Samuel Mendes", email: "samuel.mendes@hexing.com.br" },
    { name: "Guilherme Nogueira", email: "guilherme.nogueira@hexing.com.br" },
    { name: "Lígia Taniguchi", email: "ligia.taniguchi@hexing.com.br" },
    { name: "Nathali Sperança", email: "nathali.speranca@hexing.com.br" },
    { name: "Wang Hao", email: "hao.wang@hexing.com.br" },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-black">
      <Loader2 className="animate-spin text-black" />
    </div>
  );

  return (
    <PageTransition>
      <div className="bg-gray-200 ml-10 -mr-10 -mt-10 min-h-screen py-10 print:p-0 font-sans">
        
        <div className="max-w-[800px] mx-auto mb-6 flex justify-end px-4">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            <FileDown size={20} /> Exportar PDF Completo
          </button>
        </div>

        <div ref={reportRef} className="flex flex-col gap-10 items-center">
          
          {/* PÁGINA 1: CAPA */}
          <div className="pdf-page w-[210mm] min-h-[297mm] bg-white p-24 shadow-2xl flex flex-col justify-between text-black">
            <div className="border-l-[16px] border-black pl-10 mt-20">
              <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]">AMI<br/>solutions</h1>
              <h2 className="text-2xl font-light uppercase tracking-[0.4em] mt-8 opacity-60">Technical Pre-Sales and<br/>Post-Sales Report</h2>
            </div>

            <div className="max-w-md">
              <h3 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">Sumário Executivo</h3>
              <ul className="text-[11px] space-y-3 font-bold uppercase tracking-wider opacity-70">
                <li className="flex justify-between"><span>01. Technical Groups & PODS</span><span>pg 02</span></li>
                <li className="flex justify-between"><span>02. Opportunities Dashboard</span><span>pg 03</span></li>
                <li className="flex justify-between"><span>03. Win & Loss Analysis</span><span>pg 04</span></li>
                <li className="flex justify-between"><span>04. 1st Group Opportunities</span><span>pg 05</span></li>
                <li className="flex justify-between"><span>05. 2nd Group Opportunities</span><span>pg 06</span></li>
                <li className="flex justify-between"><span>06. 3rd Group Opportunities</span><span>pg 07</span></li>
                <li className="flex justify-between"><span>07. Historical Pipeline</span><span>pg 08</span></li>
              </ul>
            </div>

            <div className="flex justify-between items-end border-t-4 border-black pt-10">
              <div className="text-[10px] uppercase font-black tracking-[0.2em]">
                Hexing Brasil <br /> {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div className="text-6xl font-black italic tracking-tighter">25/26</div>
            </div>
          </div>

          {/* PÁGINA 2: MEMBROS E ESTRUTURA */}
          <div className="pdf-page w-[210mm] min-h-[297mm] bg-white p-20 shadow-2xl text-black">
            <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-4">01. Technical PODS Members</h2>
            
            <div className="grid grid-cols-1 gap-4 mb-20">
              {podsMembers.map(m => (
                <div key={m.email} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black">{m.name[0]}</div>
                    <div>
                      <p className="font-black uppercase text-sm">{m.name}</p>
                      <p className="text-[10px] opacity-50 font-mono">{m.email}</p>
                    </div>
                  </div>
                  <ShieldCheck className="text-green-500" size={20} />
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-4">Technical Groups</h2>
            <div className="p-10 border-2 border-dashed border-gray-200 rounded-[3rem] text-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 bg-black text-white rounded-2xl font-black uppercase text-[10px]">1st Group<br/><span className="font-light opacity-50">Guilherme Nogueira</span></div>
                <div className="p-6 bg-black text-white rounded-2xl font-black uppercase text-[10px]">2nd Group<br/><span className="font-light opacity-50">Lígia Taniguchi</span></div>
                <div className="p-6 bg-black text-white rounded-2xl font-black uppercase text-[10px]">3rd Group<br/><span className="font-light opacity-50">Nathali Sperança</span></div>
              </div>
            </div>
          </div>

          {/* PÁGINA 3: DASHBOARD GERAL */}
          <div className="pdf-page w-[210mm] min-h-[297mm] bg-white p-20 shadow-2xl text-black">
            <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-4">02. Opportunities Dashboard</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-16">
              <div className="p-6 bg-green-50 border-l-8 border-green-500 rounded-r-2xl">
                <p className="text-[10px] font-black uppercase text-green-700">Good Status</p>
                <p className="text-[9px] mt-2 font-medium opacity-70">Interesse real na compra e processo de homologação em andamento.</p>
              </div>
              <div className="p-6 bg-yellow-50 border-l-8 border-yellow-500 rounded-r-2xl">
                <p className="text-[10px] font-black uppercase text-yellow-700">Attention</p>
                <p className="text-[9px] mt-2 font-medium opacity-70">Requisitos técnicos pendentes ou falta de acordo comercial.</p>
              </div>
              <div className="p-6 bg-red-50 border-l-8 border-red-500 rounded-r-2xl">
                <p className="text-[10px] font-black uppercase text-red-700">Bad Status</p>
                <p className="text-[9px] mt-2 font-medium opacity-70">Bloqueio técnico ou preço não atrativo. Sem intenção de avanço.</p>
              </div>
            </div>

            <div className="h-[400px] w-full mb-10">
              <h4 className="text-xs font-black uppercase mb-8 tracking-widest text-center">Opportunities by Ecosystem</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    isAnimationActive={false}
                    data={ecosystemData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" cy="50%" 
                    outerRadius={120} 
                    label={({ name, percent }) => {
                      const val = percent ? (percent * 100).toFixed(0) : "0";
                      return `${name} ${val}%`;
                    }}
                  >
                    {ecosystemData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PÁGINA 4: WIN & LOSS ANALYSIS */}
          <div className="pdf-page w-[210mm] min-h-[297mm] bg-white p-20 shadow-2xl text-black">
            <h2 className="text-3xl font-black uppercase italic mb-10 border-b-4 border-black pb-4">03. Win & Loss Analysis</h2>
            
            <div className="h-[500px] w-full">
              <h4 className="text-xs font-black uppercase mb-10 tracking-widest text-center">Performance per Sales Group</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winLossData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                  <YAxis fontSize={10} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="Good" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Attention" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Bad" stackId="a" fill="#ef4444" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PÁGINAS DE LISTAS (REPETIR PARA CADA GRUPO) */}
          {["1st Group", "2nd Group", "3rd Group"].map((groupName, idx) => (
            <div key={groupName} className="pdf-page w-[210mm] min-h-[297mm] bg-white p-16 shadow-2xl text-black">
              <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black uppercase italic">0{idx + 4}. {groupName} Opportunities</h2>
                <div className="text-[10px] font-black bg-black text-white px-3 py-1 rounded">LIST VIEW</div>
              </div>

              <table className="w-full text-[8px] border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border border-gray-200 uppercase font-black">Utility</th>
                    <th className="p-3 border border-gray-200 uppercase font-black">Description</th>
                    <th className="p-3 border border-gray-200 uppercase font-black">Status</th>
                    <th className="p-3 border border-gray-200 uppercase font-black text-right">QTY</th>
                    <th className="p-3 border border-gray-200 uppercase font-black">Last Discussion</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities
                    .filter(o => o.technicalSalesGroup?.includes(groupName))
                    .sort((a,b) => (a.utility || "").localeCompare(b.utility || ""))
                    .map((opp) => (
                    <tr key={opp.id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-200 font-black">{opp.utility}</td>
                      <td className="p-3 border border-gray-200 font-medium truncate max-w-[180px]">{opp.description}</td>
                      <td className="p-3 border border-gray-200">
                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${
                          getStatus(opp).includes("good") ? 'bg-green-100 text-green-700' : 
                          getStatus(opp).includes("attention") ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200 text-right font-mono font-bold">{(opp.quantity || 0).toLocaleString()}</td>
                      <td className="p-3 border border-gray-200 opacity-50">{opp.lastCustomerDiscussion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* PÁGINA FINAL: HISTÓRICO (START < 2025) */}
          <div className="pdf-page w-[210mm] min-h-[297mm] bg-white p-20 shadow-2xl text-black">
            <div className="flex items-center gap-4 mb-10 border-b-4 border-black pb-4">
              <Clock size={30} />
              <h2 className="text-2xl font-black uppercase italic">07. Historical Pipeline (Before 2025)</h2>
            </div>
            
            <table className="w-full text-[8px] border-collapse">
                <thead>
                  <tr className="bg-black text-white text-left">
                    <th className="p-3 border border-black uppercase">Utility</th>
                    <th className="p-3 border border-black uppercase">Description</th>
                    <th className="p-3 border border-black uppercase text-center">Year Start</th>
                    <th className="p-3 border border-black uppercase">Technical Group</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities
                    .filter(o => (o.yearStart || 0) < 2025)
                    .map((opp) => (
                    <tr key={opp.id} className="border-b border-gray-100">
                      <td className="p-3 font-black">{opp.utility}</td>
                      <td className="p-3 font-medium">{opp.description}</td>
                      <td className="p-3 text-center font-bold text-red-500">{opp.yearStart}</td>
                      <td className="p-3 opacity-60 uppercase tracking-tighter">{opp.technicalSalesGroup}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}