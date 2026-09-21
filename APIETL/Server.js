import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => res.json({ status: "ok" }));


async function webSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(10_000),
    });

    const html = await res.text();
    const resultBlocks = html.split('class="result ').slice(1, 8);
    const snippets = [];

    for (const block of resultBlocks) {
      const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)<\/a>/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      const urlMatch = block.match(/class="result__url"[^>]*>([\s\S]*?)<\/span>/);

      const title   = titleMatch   ? titleMatch[1].trim() : "";
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
      const url     = urlMatch     ? urlMatch[1].replace(/\s+/g, "").trim() : "";

      if (title && snippet) snippets.push(`[${title}] (${url})\n${snippet}`);
    }

    return snippets.join("\n\n");
  } catch (err) {
    console.error("Search error:", err.message);
    return "";
  }
}

async function callGroq(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Groq error:", JSON.stringify(data));
    throw new Error(data.error?.message || `Groq error ${res.status}`);
  }

  return data.choices?.[0]?.message?.content ?? "";
}

app.post("/api/claude", async (req, res) => {
  const { prompt, system } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt ausente." });

  try {
    const themeMatch = prompt.match(/sobre:\s*"([^"]+)"/);
    const theme = themeMatch ? themeMatch[1] : prompt.slice(0, 80);

    console.log(`[ETL] Tema: "${theme}"`);
    console.log("[ETL] Buscando dados na web...");

    const [r1, r2, r3] = await Promise.all([
      webSearch(`${theme} dados estatísticas 2024 2025`),
      webSearch(`${theme} mercado análise relatório`),
      webSearch(`${theme} comparativo ranking players`),
    ]);

    const searchContext = [r1, r2, r3].filter(Boolean).join("\n\n---\n\n");
    console.log(`[ETL] ${searchContext.length} caracteres coletados`);

    const enrichedPrompt = `${prompt}

=== DADOS COLETADOS VIA WEB SEARCH ===
${searchContext || "Nenhum resultado encontrado — use seu conhecimento base sobre o tema."}
=== FIM DOS DADOS ===

Com base nos dados acima, gere o JSON solicitado.`;

    console.log("[ETL] Enviando para Groq...");
    const text = await callGroq(system || "", enrichedPrompt);
    console.log("[ETL] Resposta recebida.");

    res.json({ text });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));