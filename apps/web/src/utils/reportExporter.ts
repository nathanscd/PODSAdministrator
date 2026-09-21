import jsPDF from 'jspdf';
import { ReportData } from '../types';

export const downloadETLReport = (reportData: ReportData) => {
  if (!reportData) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  const DARK = [15, 20, 26] as [number, number, number];
  const ACCENT = [99, 220, 165] as [number, number, number];
  const MID = [30, 40, 52] as [number, number, number];
  const LIGHT = [232, 237, 242] as [number, number, number];
  const MUTED = [90, 106, 120] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const RED = [255, 90, 90] as [number, number, number];
  const YELLOW = [245, 158, 71] as [number, number, number];
  const BLUE = [59, 158, 255] as [number, number, number];

  const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);

  const addFooter = (pageNum: number, total: number) => {
    setFill(MID);
    doc.rect(0, H - 12, W, 12, 'F');
    setColor(MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('ETL Research & Reporting', 14, H - 4.5);
    doc.text(`Pág. ${pageNum} / ${total}`, W - 14, H - 4.5, { align: 'right' });
    doc.text(reportData!.date, W / 2, H - 4.5, { align: 'center' });
  };

  const sectionHeader = (title: string, y: number, color = ACCENT): number => {
    setFill(MID);
    doc.roundedRect(14, y, W - 28, 10, 2, 2, 'F');
    setFill(color);
    doc.roundedRect(14, y, 3, 10, 1, 1, 'F');
    setColor(LIGHT);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 22, y + 6.8);
    return y + 16;
  };

  const checkPage = (y: number, needed = 20): number => {
    if (y + needed > H - 18) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  // PÁGINA 1 — CAPA
  setFill(DARK);
  doc.rect(0, 0, W, H, 'F');
  setFill(MID);
  doc.rect(0, 0, W, 60, 'F');
  setFill(ACCENT);
  doc.rect(0, 0, 4, 60, 'F');

  // Tema
  const themeLines = doc.splitTextToSize(reportData!.theme, W - 28);
  setColor(WHITE);
  doc.setFontSize(themeLines.length > 2 ? 22 : 28);
  doc.setFont('helvetica', 'bold');
  let titleY = 90;
  themeLines.forEach((line: string) => {
    doc.text(line, 14, titleY);
    titleY += themeLines.length > 2 ? 10 : 12;
  });

  setFill(ACCENT);
  doc.rect(14, titleY + 4, 40, 1.5, 'F');

  setColor(MUTED);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${reportData!.date}`, 14, titleY + 14);

  // Stats cards on cover
  const cardData = [
    { label: 'Métricas', value: String(reportData!.metrics.length) },
    { label: 'Comparativos', value: String(reportData!.comparisons.length) },
    { label: 'Insights', value: String(reportData!.insights.length) },
    { label: 'Fontes', value: String(reportData!.sources.length) },
  ];
  const cardW = (W - 28 - 9) / 4;
  cardData.forEach((card, i) => {
    const cx = 14 + i * (cardW + 3);
    const cy = H - 80;
    setFill(MID);
    doc.roundedRect(cx, cy, cardW, 22, 3, 3, 'F');
    setFill(ACCENT);
    doc.roundedRect(cx, cy, cardW, 2, 1, 1, 'F');
    setColor(ACCENT);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, cx + cardW / 2, cy + 13, { align: 'center' });
    setColor(MUTED);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label.toUpperCase(), cx + cardW / 2, cy + 19, { align: 'center' });
  });

  setFill(MID);
  doc.rect(0, H - 12, W, 12, 'F');
  setColor(MUTED);
  doc.setFontSize(8);
  doc.text('ETL Research & Reporting — Dados obtidos via Web Search', W / 2, H - 4.5, {
    align: 'center',
  });

  // PÁGINA 2 — SUMMARY + METRICS
  doc.addPage();
  setFill(DARK);
  doc.rect(0, 0, W, H, 'F');
  let y = 20;

  y = sectionHeader('Resumo Executivo', 22);
  setFill([20, 30, 40] as [number, number, number]);
  const summaryLines = doc.splitTextToSize(reportData!.summary, W - 36);
  doc.roundedRect(14, y, W - 28, summaryLines.length * 5.5 + 10, 2, 2, 'F');
  setColor(LIGHT);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(summaryLines, 20, y + 7);
  y += summaryLines.length * 5.5 + 16;

  y = checkPage(y, 50);
  y = sectionHeader('Métricas Principais', y);

  const colW = (W - 28 - 6) / 2;
  reportData!.metrics.forEach((m, i) => {
    if (i % 2 === 0) y = checkPage(y, 28);
    const cx = 14 + (i % 2) * (colW + 6);
    const cy = y;
    setFill(MID);
    doc.roundedRect(cx, cy, colW, 24, 3, 3, 'F');
    setFill(ACCENT);
    doc.roundedRect(cx, cy, colW, 1.5, 1, 1, 'F');
    setColor(MUTED);
    doc.setFontSize(7);
    doc.text(m.label.toUpperCase(), cx + 5, cy + 6);
    setColor(WHITE);
    doc.setFontSize(16);
    doc.text(`${m.value}${m.unit ? ' ' + m.unit : ''}`, cx + 5, cy + 16);
    if (i % 2 === 1 || i === reportData!.metrics.length - 1) y += 28;
  });

  // PÁGINAS 3+ — COMPARISON
  if (reportData.comparisons.length > 0) {
    doc.addPage();
    setFill(DARK);
    doc.rect(0, 0, W, H, 'F');
    y = 22;
    reportData.comparisons.forEach((comp) => {
      y = checkPage(y, 40);
      y = sectionHeader(comp.category, y, BLUE);
      setFill([20, 35, 50] as [number, number, number]);
      doc.roundedRect(14, y, W - 28, 8, 1, 1, 'F');
      setColor(ACCENT);
      doc.setFontSize(7.5);
      doc.text('ITEM', 19, y + 5.5);
      doc.text('VALOR', 114, y + 5.5);
      doc.text('TENDÊNCIA', 158, y + 5.5);
      y += 9;
      comp.items?.forEach((item, ii) => {
        y = checkPage(y, 10);
        setFill(ii % 2 === 0 ? MID : ([22, 32, 43] as [number, number, number]));
        doc.rect(14, y, W - 28, 8, 'F');
        setColor(LIGHT);
        doc.setFontSize(8);
        doc.text(item.name, 19, y + 5.2);
        setColor(WHITE);
        doc.text(item.value, 114, y + 5.2);
        const trendUp =
          item.trend?.includes('↑') || item.trend?.toLowerCase().includes('alta');
        const trendDown =
          item.trend?.includes('↓') || item.trend?.toLowerCase().includes('queda');
        setColor(trendUp ? ACCENT : trendDown ? RED : YELLOW);
        doc.text(item.trend || '—', 158, y + 5.2);
        y += 8;
      });
      y += 10;
    });
  }

  // LAST PAGE — INSIGHTS + SOURCES
  doc.addPage();
  setFill(DARK);
  doc.rect(0, 0, W, H, 'F');
  y = 22;
  if (reportData.insights.length > 0) {
    y = sectionHeader('Insights Estratégicos', y);
    reportData.insights.forEach((ins) => {
      const insLines = doc.splitTextToSize(ins.text, W - 50);
      const boxH = Math.max(14, insLines.length * 5.2 + 10);
      y = checkPage(y, boxH + 4);
      setFill(MID);
      doc.roundedRect(14, y, W - 28, boxH, 2, 2, 'F');
      setColor(LIGHT);
      doc.setFontSize(8.5);
      doc.text(insLines, 20, y + 12);
      y += boxH + 5;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  doc.save(`Report_ETL_${reportData.theme.replace(/\s+/g, '_')}.pdf`);
};
