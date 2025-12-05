import { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "./BarChart";
import Filters from "./Filters"; 
import DataTable from "./DataTable";
import { Fiscalizacao } from "../types";

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

  return (
    <div style={{ width: "90%", margin: "50px auto" }}>
      <h1>Dashboard Nível Inicial</h1>

      <div style={{ marginBottom: "20px" }}>
        <select value={selectedDataset || ""} onChange={(e) => setSelectedDataset(e.target.value)}>
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

      <BarChart data={filteredData} />

      <DataTable data={filteredData} />
    </div>
  );
}
