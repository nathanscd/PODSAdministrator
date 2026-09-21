import { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "./BarChart";
import Filters from "./Filters"; 
import DataTable from "./DataTable";
import { Fiscalizacao } from "../types";
import { DashboardHeader } from "./blocks/DashboardHeader";
import { MetricsGrid } from "./blocks/MetricsGrid";
import { QuickActions } from "./blocks/QuickActions";
import { Card } from "./ui/card";
import { BarChart3, Database, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [datasets, setDatasets] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [data, setData] = useState<Fiscalizacao[]>([]);
  const [filtroAno, setFiltroAno] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  useEffect(() => {
    axios.get("http://localhost:8000/datasets")
      .then(res => setDatasets(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDataset) return;

    axios.get(`http://localhost:8000/datasets/${selectedDataset}`)
      .then(res => {
        const parsed = res.data.map((row: any) => ({
          nomFiscalizacaoGeracao: row.nomFiscalizacaoGeracao,
          qtdFiscalizacaoGeracao: Number(row.qtdFiscalizacaoGeracao),
          mesReferencia: Number(row.mesReferencia),
          anoReferencia: Number(row.anoReferencia),
        }));
        setData(parsed);
      })
      .catch(err => console.error(err));
  }, [selectedDataset]);

  const filteredData = data.filter(d => 
    (!filtroAno || d.anoReferencia === filtroAno) &&
    (!filtroTipo || d.nomFiscalizacaoGeracao === filtroTipo)
  );

  const metrics = [
    { title: "Total de Registros", value: filteredData.length, icon: <BarChart3 size={20} /> },
    { title: "Datasets Disponíveis", value: datasets.length, icon: <Database size={20} /> },
  ];

  return (
    <div className="w-[90%] mx-auto py-8">
      <DashboardHeader 
        title="Dashboard Nível Inicial" 
        description="Análise e monitoramento de fiscalização de geração de energia"
      />

      <MetricsGrid metrics={metrics} />

      <QuickActions 
        actions={[
          { label: "Atualizar Dados", icon: <RefreshCw size={16} />, onClick: () => window.location.reload() }
        ]}
      />

      <Card className="p-6 mb-6 bg-card border-border shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Selecione um dataset</label>
          <select 
            value={selectedDataset || ""} 
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="flex h-9 w-full rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-color)]"
          >
            <option value="">Selecione um dataset</option>
            {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
          </select>
        </div>

        <Filters 
          data={data} 
          filtroAno={filtroAno} 
          setFiltroAno={setFiltroAno} 
          filtroTipo={filtroTipo} 
          setFiltroTipo={setFiltroTipo} 
        />
      </Card>

      <div className="space-y-6">
        <BarChart data={filteredData} />
        <DataTable data={filteredData} />
      </div>
    </div>
  );
}
