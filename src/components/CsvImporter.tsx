import { useState } from "react";
import Papa from "papaparse";
import { writeBatch, doc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { Opportunity } from "../types";

export default function CsvImporter() {
  const [loading, setLoading] = useState(false);

  // Função para converter datas de DD/MM/YYYY para YYYY-MM-DD
  const parseDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 8) return "";
    // Assume formato brasileiro DD/MM/YYYY
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  };

  // Função para limpar números (Brasil: 1.000,00 -> 1000.00)
  const parseNumber = (str: string) => {
    if (!str) return 0;
    // Remove % e espaços
    let clean = str.replace("%", "").trim();
    // Se tiver ponto e vírgula, assume padrão BR (remove ponto de milhar, troca vírgula por ponto)
    if (clean.includes(".") && clean.includes(",")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } 
    // Se tiver apenas ponto e for formato 135.000 (milhar), remove ponto
    else if (clean.match(/^\d{1,3}(\.\d{3})*$/)) {
      clean = clean.replace(/\./g, "");
    }
    // Se for formato decimal simples (3.5), mantém
    return Number(clean) || 0;
  };

  const mapPriority = (p: string) => {
    if (!p) return "Média";
    const lower = p.toLowerCase();
    if (lower.includes("high") || lower.includes("alta")) return "Alta";
    if (lower.includes("crit") || lower.includes("crít")) return "Crítica";
    if (lower.includes("low") || lower.includes("baixa")) return "Baixa";
    return "Média";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("Isso importará os dados do Notion para o banco de dados. Confirmar?")) {
      event.target.value = "";
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8", // Garante acentos corretos
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          console.log("Linhas encontradas:", rows.length);
          console.log("Exemplo de linha:", rows[0]);

          const batchSize = 450; 
          let batch = writeBatch(db);
          let count = 0;
          let totalImported = 0;

          for (const row of rows) {
            // Pula linhas vazias se houver
            if (!row["OPPORTUNITY DESCRIPTION "] && !row["UTILITY"]) continue;

            const newDocRef = doc(collection(db, "opportunities"));
            
            // MAPEAMENTO EXATO BASEADO NOS SEUS CSVS
            const mappedData: Omit<Opportunity, 'id'> = {
              // Note o espaço extra em "DESCRIPTION " que veio no seu CSV
              description: row["OPPORTUNITY DESCRIPTION "] || "Sem Nome",
              technicalSalesGroup: row["Technical Sales Group"] || "Unassigned",
              utility: row["UTILITY"] || "",
              kam: row["KAM"] || "",
              country: row["COUNTRY"] || "Brasil",
              status: row["Status"] || "Draft",
              businessStages: row["Business Stages"] || "Prospecção",
              priority: mapPriority(row["Priority"]),
              product: row["Product"] || "",
              ecosystem: row["Ecosystem"] || "",
              
              // Conversões numéricas
              yearStart: parseNumber(row["Year Start"]) || new Date().getFullYear(),
              yearEnd: parseNumber(row["Year End"]) || new Date().getFullYear() + 1,
              quantity: parseNumber(row["QTY"]),
              scp: parseNumber(row["SCP"]),
              progress: parseNumber(row["Progress"]),

              // Campos de texto e defaults
              files: row["Files"] || "",
              hqInterface: row["HQ-China Support & Interface"] || "",
              reasonWinLoss: row["Reason Win/Loss/Archived"] || "",
              remember: row["Remember"] || "",
              homologated: (row["Homologated?"] === "Yes" || row["Homologated?"] === "Sim"),
              reasonHomologated: row["Reason Homologation"] || "",
              
              // Note o erro de digitação "Costumer" que veio no CSV
              lastCustomerDiscussion: parseDate(row["Last Costumer Discussion"]) || new Date().toISOString().split('T')[0],
              
              // Tenta pegar 'Notes' (CSV 2) ou fallback
              observation: row["Notes about the discussion"] || "",
              
              competitors: row["Competitors"] || "",
              productTeam: row["Product Team"] || "",
              salesManagement: row["Sales Management"] || "",
              
              ownerId: auth.currentUser?.uid || "import_notion"
            };

            batch.set(newDocRef, mappedData);
            count++;
            totalImported++;

            if (count >= batchSize) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
              console.log(`Commit parcial: ${totalImported} registros...`);
            }
          }

          if (count > 0) {
            await batch.commit();
          }

          alert(`Importação concluída! ${totalImported} oportunidades adicionadas.`);
          window.location.reload(); // Recarrega para mostrar os dados
        } catch (error) {
          console.error("Erro na importação:", error);
          alert("Erro ao importar. Verifique o console (F12) para detalhes.");
        } finally {
          setLoading(false);
          if (event.target) event.target.value = "";
        }
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <label className={`flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-4 rounded-2xl cursor-pointer shadow-2xl hover:shadow-green-500/20 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
        <span>{loading ? "Importando..." : "Importar CSV Notion"}</span>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          className="hidden" 
          disabled={loading}
        />
      </label>
    </div>
  );
}