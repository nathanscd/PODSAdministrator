import { useState, useEffect, useCallback } from 'react';
import type { ReportData } from '../types';

type ServerStatus = 'unknown' | 'checking' | 'waking' | 'online' | 'offline';

const PROXY_URL = (import.meta.env.VITE_ETL_API_URL || 'https://podsadministrator.onrender.com').replace(/\/+$/, '');
const HEALTH_URL = `${PROXY_URL}/health`;
const API_URL = `${PROXY_URL}/api/research`;
const LEGACY_API_URL = `${PROXY_URL}/api/claude`;
const WAKE_TIMEOUT_MS = 60_000;
const HEALTH_POLL_MS = 5_000;

export const useETLResearch = () => {
  const [theme, setTheme] = useState('');
  const [sources, setSources] = useState({
    api: true,
    db: true,
    web: false,
    docs: false,
  });
  const [status, setStatus] = useState<
    'idle' | 'extracting' | 'transforming' | 'loading' | 'done' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('unknown');

  const pingServer = async (): Promise<boolean> => {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(8_000) });
      return res.ok;
    } catch {
      return false;
    }
  };

  const wakeServer = async (onStatus: (s: ServerStatus) => void): Promise<boolean> => {
    onStatus('waking');
    const deadline = Date.now() + WAKE_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const ok = await pingServer();
      if (ok) {
        onStatus('online');
        return true;
      }
      await new Promise((r) => setTimeout(r, HEALTH_POLL_MS));
    }
    onStatus('offline');
    return false;
  };

  const fetchRealReport = async (
    theme: string,
    _sources: Record<string, boolean>
  ): Promise<ReportData> => {
    const prompt = `Faça uma pesquisa detalhada e real sobre: "${theme}".
Use web search para buscar dados concretos e atuais. Consulte múltiplas fontes.
Retorne SOMENTE um objeto JSON válido, sem markdown, sem backticks, com esta estrutura:
{
  "summary": "[resumo executivo]",
  "metrics": [{ "label": "[nome]", "value": "[valor]", "unit": "[unidade]", "context": "[contexto]" }],
  "comparisons": [{ "category": "[categoria]", "items": [{ "name": "[nome]", "value": "[valor]", "trend": "[trend]" }] }],
  "insights": [{ "type": "[tipo]", "text": "[texto]" }],
  "sources": ["[fontes]"]
}
Responda em português do Brasil.`;

    const body = JSON.stringify({
      prompt,
      system:
        'Você é um analista de dados sênior especializado em ETL e BI. Retorne APENAS JSON válido.',
    });
    let response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (response.status === 404) {
      response = await fetch(LEGACY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }

    if (!response.ok) throw new Error(`Erro na API de pesquisa: ${response.status}`);

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const rawText: string = data.text ?? '';

    let parsed: any;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Resposta inválida da API. Tente novamente.');
    }

    return {
      theme: theme.toUpperCase(),
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      summary: parsed.summary ?? '',
      metrics: parsed.metrics ?? [],
      comparisons: parsed.comparisons ?? [],
      insights: parsed.insights ?? [],
      sources: parsed.sources ?? [],
    };
  };

  useEffect(() => {
    setServerStatus('checking');
    pingServer().then((ok) => setServerStatus(ok ? 'online' : 'unknown'));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'extracting' || status === 'transforming') {
      interval = setInterval(
        () => setProgress((p) => Math.min(p + Math.floor(Math.random() * 8) + 3, 95)),
        400
      );
    }
    if (status === 'loading') {
      interval = setInterval(
        () => setProgress((p) => Math.min(p + Math.floor(Math.random() * 15) + 5, 98)),
        300
      );
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleStartETL = async () => {
    if (!theme) return;

    if (serverStatus !== 'online') {
      const ok = await wakeServer(setServerStatus);
      if (!ok) {
        setErrorMsg(
          "Servidor proxy offline. Clique em 'Offline — tentar novamente' e aguarde ~30 segundos."
        );
        setStatus('error');
        return;
      }
    }

    setStatus('extracting');
    setProgress(0);
    setReportData(null);
    setErrorMsg('');

    try {
      await new Promise((r) => setTimeout(r, 1800));
      setStatus('transforming');
      setProgress(0);

      const result = await fetchRealReport(theme, sources);

      setStatus('loading');
      setProgress(0);
      await new Promise((r) => setTimeout(r, 800));
      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      setReportData(result);
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erro desconhecido');
      setStatus('error');
    }
  };

  const handleWake = useCallback(async () => {
    const ok = await wakeServer(setServerStatus);
    if (!ok) setServerStatus('offline');
  }, []);

  return {
    theme,
    setTheme,
    sources,
    setSources,
    status,
    progress,
    reportData,
    errorMsg,
    serverStatus,
    handleStartETL,
    handleWake,
  };
};
