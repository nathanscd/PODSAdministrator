import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { Opportunity } from "../types";
import { useToast } from "../contexts/ToastContext";
import { logAction } from "../utils/systemLogger";
import PageTransition from "../components/PageTransition";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { FileDown, Loader2, ShieldCheck, Clock } from "lucide-react";
import BrazilMap3D from "../components/BrazilMap3D";
import { Map } from "lucide-react"; 

export default function Report() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Cores fixas em HEX para evitar erro "oklch"
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
    setIsExporting(true);
    addToast("Gerando PDF... Isso pode levar alguns segundos.", "info");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const pages = reportRef.current.querySelectorAll(".pdf-page");

      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(pageElement, {
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff", // Força fundo branco HEX
          windowWidth: 1200, // Largura fixa para renderização estável
          onclone: (documentClone) => {
            // Hack extra de segurança: Força cor preta em textos que possam ter escapado
            const elements = documentClone.querySelectorAll('*');
            elements.forEach((el: any) => {
               const style = window.getComputedStyle(el);
               if (style.color.includes('oklch')) {
                   el.style.color = '#000000';
               }
               if (style.backgroundColor.includes('oklch')) {
                   el.style.backgroundColor = '#ffffff';
               }
               if (style.borderColor.includes('oklch')) {
                   el.style.borderColor = '#e5e7eb';
               }
            });
          }
        });

        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      }

      const fileName = `AMI_Technical_Report_${new Date().getFullYear()}.pdf`;
      pdf.save(fileName);

      // Log e Toast de Sucesso
      logAction("Gerou Relatório", `Exportou PDF completo: ${fileName}`);
      addToast("Relatório exportado com sucesso!", "success");

    } catch (error) {
      console.error("Erro na exportação:", error);
      addToast("Erro ao gerar PDF. Verifique o console.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Helpers ---
  const getStatus = (o: Opportunity) => o.status?.toLowerCase() || "";

  // Helper de estilo para Badge de Status (HEX ONLY)
  const getStatusStyle = (status: string) => {
     if (status.includes("good")) return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
     if (status.includes("attention")) return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
     return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
  };

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
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" />
    </div>
  );

  return (
    <PageTransition>
      <div className="bg-gray-200 min-h-screen py-10 font-sans text-black">
        
        {/* Botão de Exportação */}
        <div className="max-w-[210mm] mx-auto mb-6 flex justify-end px-4 print:hidden">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} />}
            {isExporting ? "Gerando PDF..." : "Exportar PDF Completo"}
          </button>
        </div>

        {/* CONTAINER DO RELATÓRIO */}
        <div ref={reportRef} className="flex flex-col gap-10 items-center">
          
          {/* ================= PÁGINA 1: CAPA ================= */}
          <div className="pdf-page bg-white shadow-2xl flex flex-col justify-between" 
               style={{ width: '210mm', height: '297mm', padding: '60px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <div style={{ borderLeft: '16px solid #000000', paddingLeft: '40px', marginTop: '80px' }}>
              <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]" style={{ color: '#000000' }}>AMI<br/>solutions</h1>
              <h2 className="text-2xl font-light uppercase tracking-[0.4em] mt-8 opacity-60" style={{ color: '#000000' }}>Technical Pre-Sales and<br/>Post-Sales Report</h2>
            </div>

            <div className="max-w-md">
              <h3 className="text-xs font-black uppercase tracking-widest pb-3 mb-6" style={{ borderBottom: '2px solid #000000', color: '#000000' }}>Sumário Executivo</h3>
              <ul className="text-[11px] space-y-3 font-bold uppercase tracking-wider opacity-70" style={{ color: '#000000' }}>
                <li className="flex justify-between"><span>01. Technical Groups & PODS</span><span>pg 02</span></li>
                <li className="flex justify-between"><span>02. Opportunities Dashboard</span><span>pg 03</span></li>
                <li className="flex justify-between"><span>03. Win & Loss Analysis</span><span>pg 04</span></li>
                <li className="flex justify-between"><span>04. 1st Group Opportunities</span><span>pg 05</span></li>
                <li className="flex justify-between"><span>05. 2nd Group Opportunities</span><span>pg 06</span></li>
                <li className="flex justify-between"><span>06. 3rd Group Opportunities</span><span>pg 07</span></li>
                <li className="flex justify-between"><span>07. Historical Pipeline</span><span>pg 08</span></li>
              </ul>
            </div>

            <div className="flex justify-between items-end pt-10" style={{ borderTop: '4px solid #000000' }}>
              <div className="text-[10px] uppercase font-black tracking-[0.2em]" style={{ color: '#000000' }}>
                Hexing Brasil <br /> {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div className="text-6xl font-black italic tracking-tighter" style={{ color: '#000000' }}>01/2026</div>
            </div>
          </div>

          {/* ================= PÁGINA 2: MEMBROS ================= */}
          <div className="pdf-page bg-white shadow-2xl" 
               style={{ width: '210mm', height: '297mm', padding: '50px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <h2 className="text-3xl font-black uppercase italic mb-10 pb-4" style={{ borderBottom: '4px solid #000000', color: '#000000' }}>01. Technical PODS Members</h2>
            
            <div className="grid grid-cols-1 gap-4 mb-20">
              {podsMembers.map(m => (
                <div key={m.email} className="flex items-center justify-between p-4 rounded-xl" 
                     style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: '#000000', color: '#ffffff' }}>{m.name[0]}</div>
                    <div>
                      <p className="font-black uppercase text-sm" style={{ color: '#000000' }}>{m.name}</p>
                      <p className="text-[10px] opacity-50 font-mono" style={{ color: '#000000' }}>{m.email}</p>
                    </div>
                  </div>
                  {/* Ícone com cor HEX explícita */}
                  <ShieldCheck size={20} color="#16a34a" /> 
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-black uppercase italic mb-10 pb-4" style={{ borderBottom: '4px solid #000000', color: '#000000' }}>Technical Groups</h2>
            <div className="p-8 rounded-[2rem] text-center" style={{ border: '2px dashed #d1d5db' }}>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl font-black uppercase text-[10px]" style={{ backgroundColor: '#000000', color: '#ffffff' }}>1st Group<br/><span className="font-light opacity-50">Guilherme Nogueira</span></div>
                <div className="p-4 rounded-xl font-black uppercase text-[10px]" style={{ backgroundColor: '#000000', color: '#ffffff' }}>2nd Group<br/><span className="font-light opacity-50">Lígia Taniguchi</span></div>
                <div className="p-4 rounded-xl font-black uppercase text-[10px]" style={{ backgroundColor: '#000000', color: '#ffffff' }}>3rd Group<br/><span className="font-light opacity-50">Nathali Sperança</span></div>
              </div>
            </div>
          </div>

          {/* ================= PÁGINA: MAPA GEOGRÁFICO ================= */}
          <div className="pdf-page bg-white shadow-2xl" 
              style={{ width: '210mm', height: '297mm', padding: '40px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '4px solid #000000' }}>
              <Map size={30} color="#000000" />
              <h2 className="text-2xl font-black uppercase italic" style={{ color: '#000000' }}>03. Geographic Distribution</h2>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <p className="text-xs uppercase font-bold opacity-60" style={{ color: '#000000' }}>
                Distribution of Utilities by Technical Group Responsability
              </p>
            </div>

            {/* O MAPA ENTRA AQUI - Altura aumentada para 650px */}
            <div style={{ width: '100%', height: '650px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <BrazilMap3D opportunities={opportunities} />
            </div>

            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
              <h4 className="text-[10px] font-black uppercase mb-2" style={{ color: '#000000' }}>Regional Insight</h4>
              <p className="text-[9px] opacity-70 leading-relaxed" style={{ color: '#000000' }}>
                This isometric map highlights the operational density across Brazil and Latin America. 
                Use the toggle button above to switch views. Each marker details the responsible Technical Group and Manager upon interaction.
              </p>
            </div>
          </div>

          {/* ================= PÁGINA 3: DASHBOARD ================= */}
          <div className="pdf-page bg-white shadow-2xl" 
               style={{ width: '210mm', height: '297mm', padding: '50px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <h2 className="text-3xl font-black uppercase italic mb-10 pb-4" style={{ borderBottom: '4px solid #000000', color: '#000000' }}>02. Opportunities Dashboard</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="p-4 rounded-r-xl" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
                <p className="text-[10px] font-black uppercase" style={{ color: '#166534' }}>Good Status</p>
                <p className="text-[8px] mt-1 font-medium opacity-70" style={{ color: '#000000' }}>Homologação/Compra em andamento.</p>
              </div>
              <div className="p-4 rounded-r-xl" style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
                <p className="text-[10px] font-black uppercase" style={{ color: '#854d0e' }}>Attention</p>
                <p className="text-[8px] mt-1 font-medium opacity-70" style={{ color: '#000000' }}>Pendências técnicas ou comerciais.</p>
              </div>
              <div className="p-4 rounded-r-xl" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                <p className="text-[10px] font-black uppercase" style={{ color: '#991b1b' }}>Bad Status</p>
                <p className="text-[8px] mt-1 font-medium opacity-70" style={{ color: '#000000' }}>Bloqueio técnico ou sem avanço.</p>
              </div>
            </div>

            {/* Container do gráfico com altura fixa em PIXELS */}
            <div style={{ height: '350px', width: '100%', minWidth: '500px' }}>
              <h4 className="text-xs font-black uppercase mb-4 tracking-widest text-center" style={{ color: '#000000' }}>Opportunities by Ecosystem</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    isAnimationActive={false}
                    data={ecosystemData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" cy="50%" 
                    outerRadius={100} 
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {ecosystemData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ================= PÁGINA 4: WIN & LOSS ================= */}
          <div className="pdf-page bg-white shadow-2xl" 
               style={{ width: '210mm', height: '297mm', padding: '50px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <h2 className="text-3xl font-black uppercase italic mb-10 pb-4" style={{ borderBottom: '4px solid #000000', color: '#000000' }}>03. Win & Loss Analysis</h2>
            
            <div style={{ height: '400px', width: '100%', minWidth: '500px' }}>
              <h4 className="text-xs font-black uppercase mb-8 tracking-widest text-center" style={{ color: '#000000' }}>Performance per Sales Group</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winLossData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" stroke="#000000" />
                  <YAxis fontSize={10} stroke="#000000" />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="Good" stackId="a" fill="#10b981" isAnimationActive={false} />
                  <Bar dataKey="Attention" stackId="a" fill="#f59e0b" isAnimationActive={false} />
                  <Bar dataKey="Bad" stackId="a" fill="#ef4444" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ================= PÁGINAS DE LISTA ================= */}
          {["1st Group", "2nd Group", "3rd Group"].map((groupName, idx) => (
            <div key={groupName} className="pdf-page bg-white shadow-2xl" 
                 style={{ width: '210mm', height: '297mm', padding: '50px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
              
              <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '2px solid #000000' }}>
                <h2 className="text-2xl font-black uppercase italic" style={{ color: '#000000' }}>0{idx + 4}. {groupName}</h2>
                <div className="text-[10px] font-black px-3 py-1 rounded" style={{ backgroundColor: '#000000', color: '#ffffff' }}>OPPORTUNITIES</div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full text-[8px] border-collapse table-fixed">
                  <thead>
                    <tr className="text-left" style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                      <th className="p-2 w-1/5 uppercase font-black" style={{ color: '#000000' }}>Utility</th>
                      <th className="p-2 w-2/5 uppercase font-black" style={{ color: '#000000' }}>Description</th>
                      <th className="p-2 w-1/5 uppercase font-black" style={{ color: '#000000' }}>Status</th>
                      <th className="p-2 w-1/5 uppercase font-black text-right" style={{ color: '#000000' }}>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities
                      .filter(o => o.technicalSalesGroup?.includes(groupName))
                      .sort((a,b) => (a.utility || "").localeCompare(b.utility || ""))
                      .slice(0, 18)
                      .map((opp) => (
                      <tr key={opp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td className="p-2 font-black truncate" style={{ color: '#000000' }}>{opp.utility}</td>
                        <td className="p-2 font-medium truncate" style={{ color: '#000000' }}>{opp.description}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase"
                            style={getStatusStyle(getStatus(opp))}
                          >
                            {opp.status?.substring(0, 12)}
                          </span>
                        </td>
                        <td className="p-2 text-right opacity-60 font-mono" style={{ color: '#000000' }}>{opp.lastCustomerDiscussion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* ================= PÁGINA HISTÓRICO ================= */}
          <div className="pdf-page bg-white shadow-2xl" 
               style={{ width: '210mm', height: '297mm', padding: '50px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#000000' }}>
            
            <div className="flex items-center gap-4 mb-10 pb-4" style={{ borderBottom: '4px solid #000000' }}>
              <Clock size={30} color="#000000" />
              <h2 className="text-2xl font-black uppercase italic" style={{ color: '#000000' }}>07. Historical Pipeline</h2>
            </div>
            
            <table className="w-full text-[8px] border-collapse">
                <thead>
                  <tr className="text-left" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                    <th className="p-2 uppercase w-1/4" style={{ borderColor: '#000000' }}>Utility</th>
                    <th className="p-2 uppercase w-1/2" style={{ borderColor: '#000000' }}>Description</th>
                    <th className="p-2 uppercase w-1/4 text-center" style={{ borderColor: '#000000' }}>Year Start</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities
                    .filter(o => (o.yearStart || 0) < 2025)
                    .slice(0, 20)
                    .map((opp) => (
                    <tr key={opp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td className="p-2 font-black" style={{ color: '#000000' }}>{opp.utility}</td>
                      <td className="p-2 font-medium" style={{ color: '#000000' }}>{opp.description}</td>
                      <td className="p-2 text-center font-bold" style={{ color: '#dc2626' }}>{opp.yearStart}</td>
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