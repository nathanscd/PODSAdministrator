'use client';

import { FileSpreadsheet, LayoutGrid, File as FileIcon } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useTitle } from '../hooks/useTitle';
import { useLang } from '../contexts/LangContext';
import { useComparison } from '../hooks/useComparison';
import { ComparisonExcelConfig } from '../components/Comparison/ComparisonExcelConfig';
import { ComparisonExcelMapping } from '../components/Comparison/ComparisonExcelMapping';
import { ComparisonPdfUpload } from '../components/Comparison/ComparisonPdfUpload';
import { ComparisonProcessing } from '../components/Comparison/ComparisonProcessing';
import { ComparisonResult } from '../components/Comparison/ComparisonResult';

export default function Comparacao() {
  const { t } = useLang();
  useTitle(`${t.sidebar.compareSheets} - PODS Administrator`);

  const {
    mode,
    setMode,
    step,
    setStep,
    globalConfig,
    setGlobalConfig,
    configs,
    progress,
    pdf1,
    setPdf1,
    pdf2,
    setPdf2,
    handleConfigSubmit,
    handleFileUpload,
    handleSheetChange,
    handleColChange,
    runExcelComparison,
    runPdfComparison,
    downloadExcel,
    downloadPdf,
  } = useComparison();

  const isExcelReady =
    configs.length > 0 &&
    configs.every(
      (c) => c.file !== null && c.selectedCols.every((col) => col !== '')
    );
  const isPdfReady = pdf1 !== null && pdf2 !== null;

  const reset = () => {
    if (mode === 'excel') {
      setStep(1);
    } else {
      setStep(2);
      setPdf1(null);
      setPdf2(null);
    }
  };

  const steps =
    mode === 'excel'
      ? [
          { num: 1, title: 'Configuração', desc: 'Regras de negócio' },
          { num: 2, title: 'Mapeamento', desc: 'Upload e colunas' },
          { num: 3, title: 'Processamento', desc: 'Resultados e Exportação' },
        ]
      : [
          { num: 2, title: 'Upload', desc: 'Selecione os PDFs' },
          { num: 3, title: 'Processamento', desc: 'Resultados e Exportação' },
        ];

  return (
    <PageTransition>
      <div className="space-y-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-color)] rounded-full blur-[200px] opacity-10 pointer-events-none" />

        <header className="mb-10 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              Comparador de Dados
            </h1>
            <p className="text-[var(--text-secondary)] mt-4 max-w-xl text-lg leading-relaxed">
              Descubra divergências, encontre similaridades e exporte relatórios precisos.
            </p>
          </div>

          <div className="flex bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => {
                setMode('excel');
                setStep(1);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'excel'
                  ? 'bg-[var(--accent-color)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid size={18} /> Planilhas
            </button>
            <button
              onClick={() => {
                setMode('pdf');
                setStep(2);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'pdf'
                  ? 'bg-[var(--accent-color)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileIcon size={18} /> PDFs
            </button>
          </div>
        </header>

        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  step === s.num
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/20'
                    : step > s.num
                    ? 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-primary)] opacity-60'
                    : 'bg-[var(--bg-app)] border-transparent text-[var(--text-secondary)] opacity-40'
                }`}
              >
                <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">
                  {mode === 'excel' ? `Passo ${s.num}` : 'Etapa'}
                </div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs mt-1 opacity-80">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              {!globalConfig.isProcessing && step === 3 ? (
                <ComparisonResult
                  mode={mode}
                  downloadExcel={downloadExcel}
                  downloadPdf={downloadPdf}
                  reset={reset}
                />
              ) : globalConfig.isProcessing ? (
                <ComparisonProcessing progress={progress} />
              ) : mode === 'excel' && step === 1 ? (
                <ComparisonExcelConfig
                  globalConfig={globalConfig}
                  setGlobalConfig={setGlobalConfig}
                  handleConfigSubmit={handleConfigSubmit}
                />
              ) : mode === 'excel' && step === 2 ? (
                <ComparisonExcelMapping
                  configs={configs}
                  globalConfig={globalConfig}
                  setStep={setStep}
                  handleFileUpload={handleFileUpload}
                  handleSheetChange={handleSheetChange}
                  handleColChange={handleColChange}
                  runExcelComparison={runExcelComparison}
                  isExcelReady={isExcelReady}
                />
              ) : mode === 'pdf' && step === 2 ? (
                <ComparisonPdfUpload
                  pdf1={pdf1}
                  setPdf1={setPdf1}
                  pdf2={pdf2}
                  setPdf2={setPdf2}
                  runPdfComparison={runPdfComparison}
                  isPdfReady={isPdfReady}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}