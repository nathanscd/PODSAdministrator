import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Upload, ArrowLeftRight, Download, Settings2, Loader2 } from "lucide-react";
import PageTransition from "../components/PageTransition";
import * as fuzz from "fuzzball";

export default function SpreadsheetPage() {
  const [sheets, setSheets] = useState<{ name: string; data: any[] }[]>([]);
  const [config, setConfig] = useState({
    modo: "primeira_vs_outras",
    threshold: 60,
    isProcessing: false
  });
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const loadedSheets = await Promise.all(Array.from(files).map(async (file) => {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      return {
        name: file.name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
      };
    }));
    setSheets(prev => [...prev, ...loadedSheets].slice(0, 5));
  };

  const getDiffSummary = (a: any, b: any) => {
    const sA = String(a || "");
    const sB = String(b || "");
    if (sA === sB) return "Nenhuma diferença";
    return `De: "${sA}" -> Para: "${sB}"`;
  };

  const runComparison = async () => {
    if (sheets.length < 1) return;
    setConfig(prev => ({ ...prev, isProcessing: true }));
    setProgress(0);

    const results: any[] = [];
    const baseSheet = sheets[0].data;

    for (let i = 0; i < baseSheet.length; i++) {
      const row = { ...baseSheet[i] };
      const mainKey = Object.keys(row)[0];

      if (sheets.length > 1) {
        sheets.slice(1).forEach((otherSheet, sIdx) => {
          Object.keys(row).forEach(col => {
            const pool = otherSheet.data.map(r => String(r[col] || ""));
            const match = fuzz.extract(String(row[col]), pool, { scorer: fuzz.ratio })[0];

            if (match && match[1] >= config.threshold) {
              row[`Match_Planilha${sIdx + 2}_${col}`] = match[0];
              row[`Diff_Planilha${sIdx + 2}_${col}`] = getDiffSummary(row[col], match[0]);
              row[`Score_P${sIdx + 2}_${col}`] = `${match[1]}%`;
            } else {
              row[`Match_Planilha${sIdx + 2}_${col}`] = "Nenhum match confiável";
            }
          });
        });
      }
      
      results.push(row);
      if (i % 10 === 0) {
        setProgress(Math.round((i / baseSheet.length) * 100));
        await new Promise(r => setTimeout(r, 0)); 
      }
    }

    exportToExcel(results);
    setConfig(prev => ({ ...prev, isProcessing: false }));
    setProgress(100);
  };

  const exportToExcel = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        fill: { fgColor: { rgb: "EDEDED" } },
        font: { bold: true },
        alignment: { horizontal: "center" }
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diferenças");
    XLSX.writeFile(wb, "Resultado_Comparacao.xlsx");
  };

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 bg-[var(--bg-app)] min-h-screen p-8 lg:p-24 custom-scrollbar">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-6xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">
              Data <span className="text-[var(--accent-color)]">Compare</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            {sheets.length > 0 && (
              <button onClick={() => setSheets([])} className="p-4 rounded-2xl border border-[var(--border-color)] text-red-500 hover:bg-red-500/10 transition-all">
                Limpar
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-6">
                <Settings2 size={18} className="text-[var(--accent-color)]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Configurações</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase opacity-40 block mb-2">Modo de Comparação</label>
                  <select 
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold text-[var(--text-primary)] outline-none"
                    value={config.modo}
                    onChange={(e) => setConfig({...config, modo: e.target.value})}
                  >
                    <option value="primeira_vs_outras">Planilha 1 vs Outras</option>
                    <option value="cruzada">Cruzada (Todas entre si)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase opacity-40 block mb-2">Similaridade Mínima: {config.threshold}%</label>
                  <input 
                    type="range" min="30" max="95" 
                    value={config.threshold}
                    onChange={(e) => setConfig({...config, threshold: parseInt(e.target.value)})}
                    className="w-full accent-[var(--accent-color)]"
                  />
                </div>
              </div>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] cursor-pointer hover:border-[var(--accent-color)] transition-all group bg-[var(--card-bg)]">
              <Upload className="text-[var(--accent-color)] mb-2" />
              <span className="text-[9px] font-black uppercase tracking-widest">Importar Planilhas</span>
              <input type="file" className="hidden" multiple accept=".xlsx" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Fila de Análise</h2>
                <button 
                  disabled={sheets.length < 1 || config.isProcessing}
                  onClick={runComparison}
                  className="bg-[var(--accent-color)] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 disabled:opacity-20"
                >
                  {config.isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                  Executar Matcher
                </button>
              </div>

              {config.isProcessing && (
                <div className="mb-8">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span>Processando Dados</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-color)] transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {sheets.map((sheet, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--card-bg)] rounded-xl text-green-500">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--text-primary)]">{sheet.name}</p>
                        <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-40 uppercase">{sheet.data.length} Registros Detectados</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1 rounded-full">PLANILHA {i + 1}</span>
                  </div>
                ))}
                {sheets.length === 0 && (
                  <div className="py-20 text-center opacity-20 font-black uppercase tracking-[0.5em] text-xs">Aguardando Arquivos</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}