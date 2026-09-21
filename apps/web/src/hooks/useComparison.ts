import { useState } from 'react';
import * as XLSX from 'xlsx';
import * as fuzz from 'fuzzball';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type SheetConfig = {
  file: File | null;
  workbook: XLSX.WorkBook | null;
  sheetNames: string[];
  selectedSheet: string;
  data: any[];
  availableCols: string[];
  selectedCols: string[];
};

export const useComparison = () => {
  const [mode, setMode] = useState<'excel' | 'pdf'>('excel');
  const [step, setStep] = useState(1);
  const [globalConfig, setGlobalConfig] = useState({
    nSheets: 1,
    nCols: 1,
    modo: '1_vs_outras',
    threshold: 60,
    isProcessing: false,
  });

  const [configs, setConfigs] = useState<SheetConfig[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, timeMsg: '' });
  const [finalExcel, setFinalExcel] = useState<any>(null);

  const [pdf1, setPdf1] = useState<File | null>(null);
  const [pdf2, setPdf2] = useState<File | null>(null);
  const [finalPdf, setFinalPdf] = useState<jsPDF | null>(null);

  const handleConfigSubmit = () => {
    setConfigs(
      Array.from({ length: globalConfig.nSheets }, () => ({
        file: null,
        workbook: null,
        sheetNames: [],
        selectedSheet: '',
        data: [],
        availableCols: [],
        selectedCols: Array(globalConfig.nCols).fill(''),
      }))
    );
    setStep(2);
  };

  const extractDataAndCols = (workbook: XLSX.WorkBook, sheetName: string) => {
    const ws = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws);
    const availableCols = data.length > 0 ? Object.keys(data[0] as object) : [];
    return { data, availableCols };
  };

  const handleFileUpload = async (index: number, file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    setConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = {
        ...newConfigs[index],
        file,
        workbook,
        sheetNames,
        selectedSheet: sheetNames[0],
        ...extractDataAndCols(workbook, sheetNames[0]),
      };
      return newConfigs;
    });
  };

  const handleSheetChange = (index: number, sheetName: string) => {
    setConfigs((prev) => {
      const newConfigs = [...prev];
      const workbook = newConfigs[index].workbook!;
      newConfigs[index].selectedSheet = sheetName;
      const { data, availableCols } = extractDataAndCols(workbook, sheetName);
      newConfigs[index].data = data;
      newConfigs[index].availableCols = availableCols;
      newConfigs[index].selectedCols = Array(globalConfig.nCols).fill(
        availableCols[0] || ''
      );
      return newConfigs;
    });
  };

  const handleColChange = (configIndex: number, colIndex: number, colName: string) => {
    setConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[configIndex].selectedCols[colIndex] = colName;
      return newConfigs;
    });
  };

  const isEmptyLike = (x: any) => {
    const s = String(x || '').trim();
    return !s || s === 'undefined' || s === 'null' || s === '0' || s === '0.0' || s === '-';
  };

  const getDiffSummary = (a: any, b: any) => {
    const aTokens = String(a || '').split(/\s+/);
    const bTokens = String(b || '').split(/\s+/);

    const removed: string[] = [];
    const added: string[] = [];
    const replaced: string[] = [];

    let i = 0,
      j = 0;
    while (i < aTokens.length || j < bTokens.length) {
      if (i < aTokens.length && j < bTokens.length && aTokens[i] === bTokens[j]) {
        i++;
        j++;
      } else if (i < aTokens.length && !bTokens.includes(aTokens[i])) {
        removed.push(aTokens[i]);
        i++;
      } else if (j < bTokens.length && !aTokens.includes(bTokens[j])) {
        added.push(bTokens[j]);
        j++;
      } else {
        if (i < aTokens.length && j < bTokens.length) {
          replaced.push(`${aTokens[i]} -> ${bTokens[j]}`);
          i++;
          j++;
        } else {
          if (i < aTokens.length) {
            removed.push(aTokens[i]);
            i++;
          }
          if (j < bTokens.length) {
            added.push(bTokens[j]);
            j++;
          }
        }
      }
    }

    const parts = [];
    if (removed.length > 0) parts.push('Removido: ' + removed.join(' '));
    if (added.length > 0) parts.push('Adicionado: ' + added.join(' '));
    if (replaced.length > 0) parts.push('Substituído: ' + replaced.join(', '));

    if (parts.length === 0) return 'Nenhuma diferença';
    return 'A diferença do primeiro para o segundo é: ' + parts.join('; ');
  };

  const getBestMatchAndDiff = (text: any, pool: string[], threshold: number) => {
    if (isEmptyLike(text)) return ['Nenhuma similaridade encontrada', 'Nada encontrado'];

    const candidates = pool.filter((t) => !isEmptyLike(t));
    if (candidates.length === 0)
      return ['Nenhuma similaridade encontrada', 'Nada encontrado'];

    const matches = fuzz.extract(String(text), candidates, { scorer: fuzz.ratio });
    if (!matches || matches.length === 0)
      return ['Nenhuma similaridade encontrada', 'Nada encontrado'];

    const matchObj = matches[0];
    const match = matchObj[0];
    const score = matchObj[1];

    if (score < threshold) return ['Nenhuma similaridade encontrada', 'Nada encontrado'];
    return [match, getDiffSummary(text, match)];
  };

  const runExcelComparison = async () => {
    setGlobalConfig((prev) => ({ ...prev, isProcessing: true }));
    const startTime = Date.now();
    let totalSteps = 0;

    if (globalConfig.nSheets === 1) {
      totalSteps = configs[0].data.length * globalConfig.nCols;
    } else if (globalConfig.modo === '1_vs_outras') {
      totalSteps =
        configs[0].data.length * globalConfig.nCols * (globalConfig.nSheets - 1);
    } else {
      for (let i = 0; i < globalConfig.nSheets; i++) {
        for (let j = i + 1; j < globalConfig.nSheets; j++) {
          totalSteps += configs[i].data.length * globalConfig.nCols;
        }
      }
    }

    setProgress({ current: 0, total: totalSteps, timeMsg: 'Calculando tempo...' });
    let currentStep = 0;

    const updateProgress = async () => {
      currentStep++;
      if (currentStep % 10 === 0 || currentStep === totalSteps) {
        const elapsed = (Date.now() - startTime) / 1000;
        const estimated = (elapsed / currentStep) * (totalSteps - currentStep);
        const timeStr =
          estimated > 60
            ? `${(estimated / 60).toFixed(1)} min restantes`
            : `${estimated.toFixed(1)} seg restantes`;
        setProgress({ current: currentStep, total: totalSteps, timeMsg: timeStr });
        await new Promise((r) => setTimeout(r, 0));
      }
    };

    const finalResults: { name: string; data: any[] }[] = [];

    if (globalConfig.nSheets === 1) {
      const baseDf = [...configs[0].data.map((r) => ({ ...r }))];
      for (let c = 0; c < globalConfig.nCols; c++) {
        const colName = configs[0].selectedCols[c];
        const pool = baseDf.map((row) => String(row[colName] || ''));

        for (let i = 0; i < baseDf.length; i++) {
          const val = baseDf[i][colName];
          const [similar, diff] = getBestMatchAndDiff(val, pool, globalConfig.threshold);
          baseDf[i][`Similar_${colName}`] = similar;
          baseDf[i][`Diferenças_${colName}`] = diff;
          await updateProgress();
        }
      }
      finalResults.push({ name: 'Planilha Única', data: baseDf });
    } else if (globalConfig.modo === '1_vs_outras') {
      const baseDf = [...configs[0].data.map((r) => ({ ...r }))];
      for (let idx = 1; idx < globalConfig.nSheets; idx++) {
        for (let c = 0; c < globalConfig.nCols; c++) {
          const baseCol = configs[0].selectedCols[c];
          const targetCol = configs[idx].selectedCols[c];
          const pool = configs[idx].data.map((row) => String(row[targetCol] || ''));

          for (let i = 0; i < baseDf.length; i++) {
            const val = baseDf[i][baseCol];
            const [similar, diff] = getBestMatchAndDiff(
              val,
              pool,
              globalConfig.threshold
            );
            baseDf[i][`Similar_Planilha${idx + 1}_${baseCol}`] = similar;
            baseDf[i][`Diferenças_Planilha${idx + 1}_${baseCol}`] = diff;
            await updateProgress();
          }
        }
      }
      finalResults.push({ name: 'Planilha 1 vs Outras', data: baseDf });
    } else {
      for (let i = 0; i < globalConfig.nSheets; i++) {
        for (let j = i + 1; j < globalConfig.nSheets; j++) {
          const tempDf = [...configs[i].data.map((r) => ({ ...r }))];
          for (let c = 0; c < globalConfig.nCols; c++) {
            const baseCol = configs[i].selectedCols[c];
            const targetCol = configs[j].selectedCols[c];
            const pool = configs[j].data.map((row) => String(row[targetCol] || ''));

            for (let k = 0; k < tempDf.length; k++) {
              const val = tempDf[k][baseCol];
              const [similar, diff] = getBestMatchAndDiff(
                val,
                pool,
                globalConfig.threshold
              );
              tempDf[k][`Similar_Planilha${j + 1}_${baseCol}`] = similar;
              tempDf[k][`Diferenças_Planilha${j + 1}_${baseCol}`] = diff;
              await updateProgress();
            }
          }
          finalResults.push({ name: `Planilha ${i + 1} vs ${j + 1}`, data: tempDf });
        }
      }
    }

    const wb = XLSX.utils.book_new();
    for (const res of finalResults) {
      const ws = XLSX.utils.json_to_sheet(res.data);
      XLSX.utils.book_append_sheet(wb, ws, res.name.substring(0, 31));
    }

    setFinalExcel(wb);
    setGlobalConfig((prev) => ({ ...prev, isProcessing: false }));
    setStep(3);
  };

  const extractParagraphsFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let lastY = -1;

      content.items.forEach((item: any) => {
        if (lastY !== item.transform[5] && lastY !== -1) fullText += '\n';
        fullText += item.str;
        lastY = item.transform[5];
      });
      fullText += '\n';
    }

    const lines = fullText.split('\n').map((l) => l.trim());
    const paras: string[] = [];
    let buffer: string[] = [];

    lines.forEach((l) => {
      if (!l) {
        if (buffer.length) {
          paras.push(buffer.join(' '));
          buffer = [];
        }
      } else {
        buffer.push(l);
      }
    });
    if (buffer.length) paras.push(buffer.join(' '));

    return paras;
  };

  const compareWordsDiff = (p1: string, p2: string) => {
    const w1 = p1.split(/\s+/).filter(Boolean);
    const w2 = p2.split(/\s+/).filter(Boolean);
    const m = w1.length,
      n = w2.length;
    const dp = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (w1[i - 1] === w2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    let i = m,
      j = n;
    const result = [];
    while (i > 0 && j > 0) {
      if (w1[i - 1] === w2[j - 1]) {
        result.push(w1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        result.push(`[REMOVIDO: ${w1[i - 1]}]`);
        i--;
      } else {
        result.push(`[ADICIONADO: ${w2[j - 1]}]`);
        j--;
      }
    }
    while (i > 0) {
      result.push(`[REMOVIDO: ${w1[i - 1]}]`);
      i--;
    }
    while (j > 0) {
      result.push(`[ADICIONADO: ${w2[j - 1]}]`);
      j--;
    }

    return result.reverse().join(' ');
  };

  const runPdfComparison = async () => {
    if (!pdf1 || !pdf2) return;
    setGlobalConfig((prev) => ({ ...prev, isProcessing: true }));
    const startTime = Date.now();

    const p1s = await extractParagraphsFromPdf(pdf1);
    const p2s = await extractParagraphsFromPdf(pdf2);
    const maxLen = Math.max(p1s.length, p2s.length);

    setProgress({ current: 0, total: maxLen, timeMsg: 'Calculando tempo...' });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (addedHeight: number) => {
      if (y + addedHeight > 280) {
        doc.addPage();
        y = 20;
      }
    };

    const addText = (title: string, content: string, isBold: boolean = false) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      checkPage(10);
      doc.text(title, margin, y);
      y += 5;

      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content, maxWidth);
      checkPage(lines.length * 5);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    };

    for (let i = 0; i < maxLen; i++) {
      const p1 = i < p1s.length ? p1s[i] : '';
      const p2 = i < p2s.length ? p2s[i] : '';
      const diffResult = compareWordsDiff(p1, p2);

      addText('PARÁGRAFO INICIAL:', p1 || '[VAZIO]');
      addText('PARÁGRAFO DE COMPARAÇÃO:', p2 || '[VAZIO]');
      addText('RESULTADO DAS DIFERENÇAS:', diffResult || 'Sem diferenças.');
      y += 5;

      if ((i + 1) % 5 === 0 || i === maxLen - 1) {
        const currentStep = i + 1;
        const elapsed = (Date.now() - startTime) / 1000;
        const estimated = (elapsed / currentStep) * (maxLen - currentStep);
        const timeStr =
          estimated > 60
            ? `${(estimated / 60).toFixed(1)} min restantes`
            : `${estimated.toFixed(1)} seg restantes`;
        setProgress({ current: currentStep, total: maxLen, timeMsg: timeStr });
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setFinalPdf(doc);
    setGlobalConfig((prev) => ({ ...prev, isProcessing: false }));
    setStep(3);
  };

  const downloadExcel = () => {
    if (finalExcel) XLSX.writeFile(finalExcel, 'Resultado_Comparacao.xlsx');
  };

  const downloadPdf = () => {
    if (finalPdf) finalPdf.save('resultado_comparacao.pdf');
  };

  return {
    mode,
    setMode,
    step,
    setStep,
    globalConfig,
    setGlobalConfig,
    configs,
    progress,
    finalExcel,
    pdf1,
    setPdf1,
    pdf2,
    setPdf2,
    finalPdf,
    handleConfigSubmit,
    handleFileUpload,
    handleSheetChange,
    handleColChange,
    runExcelComparison,
    runPdfComparison,
    downloadExcel,
    downloadPdf,
  };
};
