import { Fiscalizacao } from "../types";

type DataTableProps = {
  data: Fiscalizacao[];
};

export default function DataTable({ data }: DataTableProps) {
  return (
    <table style={{ width: "100%", marginTop: "30px", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ano</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Tipo de Fiscalização</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantidade</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, idx) => (
          <tr key={idx}>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{d.anoReferencia}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{d.nomFiscalizacaoGeracao}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{d.qtdFiscalizacaoGeracao}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
