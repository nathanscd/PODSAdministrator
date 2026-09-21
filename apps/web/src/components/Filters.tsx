import { Fiscalizacao } from "../types";

type FiltersProps = {
  data: Fiscalizacao[];
  filtroAno: number | null;
  setFiltroAno: (ano: number | null) => void;
  filtroTipo: string | null;
  setFiltroTipo: (tipo: string | null) => void;
};

export default function Filters({ data, filtroAno, setFiltroAno, filtroTipo, setFiltroTipo }: FiltersProps) {
  const anos = Array.from(new Set(data.map(d => d.anoReferencia))).sort();
  const tipos = Array.from(new Set(data.map(d => d.nomFiscalizacaoGeracao)));

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      <select onChange={(e) => setFiltroAno(Number(e.target.value) || null)} value={filtroAno || ""}>
        <option value="">Todos os anos</option>
        {anos.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <select onChange={(e) => setFiltroTipo(e.target.value || null)} value={filtroTipo || ""}>
        <option value="">Todos os tipos</option>
        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
