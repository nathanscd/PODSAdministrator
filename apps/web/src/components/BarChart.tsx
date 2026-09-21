import { Bar } from "react-chartjs-2";
import { Fiscalizacao } from "../types";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type BarChartProps = {
  data: Fiscalizacao[];
};

export default function BarChart({ data }: BarChartProps) {
  const tipos = Array.from(new Set(data.map(d => d.nomFiscalizacaoGeracao)));
  const anos = Array.from(new Set(data.map(d => d.anoReferencia))).sort();

  const datasets = tipos.map(tipo => ({
    label: tipo,
    data: anos.map(ano =>
      data
        .filter(d => d.nomFiscalizacaoGeracao === tipo && d.anoReferencia === ano)
        .reduce((sum, d) => sum + d.qtdFiscalizacaoGeracao, 0)
    ),
    backgroundColor: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`,
  }));

  const chartData = { labels: anos, datasets };

  return <Bar data={chartData} />;
}
