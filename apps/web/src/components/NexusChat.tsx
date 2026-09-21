import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, X, Terminal, AlertTriangle, Check, Loader2, Cpu } from "lucide-react";
import { useAI } from "../contexts/AIContext";

interface NexusMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: any[];
}

export default function NexusChat() {
  const { isOpen, toggleAI } = useAI();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<NexusMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: NexusMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    window.setTimeout(() => {
      const responseMessage: NexusMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: `Sistema NEXUS recebeu: "${userMessage.content}". Esta é uma resposta de demonstração.`,
      };
      setMessages((prev) => [...prev, responseMessage]);
      setIsLoading(false);
    }, 900);
  };

  const addToolResult = (_result?: any) => {
    return;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderToolInvocation = (toolInvocation: any) => {
    const toolCallId = toolInvocation.toolCallId;
    const isWriteAction = ["create_daily_goal", "update_user_permissions"].includes(toolInvocation.toolName);

    if ('result' in toolInvocation) {
      const result = toolInvocation.result;
      if (result === 'cancelled') {
        return (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] flex items-center gap-2 font-mono text-red-400">
             <X size={12} /> OPERAÇÃO CANCELADA PELO USUÁRIO
          </div>
        );
      }
      return (
        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-[10px] flex items-center gap-2 font-mono text-green-400">
          <Check size={12} /> {toolInvocation.toolName.toUpperCase()} EXECUTADO COM SUCESSO
        </div>
      );
    }

    if (isWriteAction) {
      return (
        <div className="mt-3 mb-2 p-4 bg-[var(--warning-color)]/5 border border-[var(--warning-color)] rounded-xl relative overflow-hidden animate-in fade-in zoom-in-95">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--warning-color)]" />
          
          <div className="flex items-center gap-2 mb-3 text-[var(--warning-color)]">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Aprovação Necessária</span>
          </div>
          
          <div className="text-[11px] font-mono text-[var(--text-primary)] mb-4 bg-black/40 p-3 rounded border border-white/5">
            <div className="text-[var(--accent-color)] font-bold mb-1">CMD: {toolInvocation.toolName}</div>
            <pre className="text-[9px] opacity-70 whitespace-pre-wrap font-mono">
              {JSON.stringify(toolInvocation.args, null, 2)}
            </pre>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => addToolResult({ toolCallId, result: 'cancelled' })}
              className="flex-1 py-2 bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] text-[9px] font-black uppercase hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 rounded-lg transition-all"
            >
              Recusar
            </button>
            <button 
              onClick={() => addToolResult({ toolCallId, result: 'confirmed' })} 
              className="flex-1 py-2 bg-[var(--accent-color)] text-black text-[9px] font-black uppercase hover:brightness-110 rounded-lg shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Cpu size={12} /> Autorizar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded text-[10px] font-mono flex items-center gap-2 text-[var(--accent-color)] animate-pulse">
        <Loader2 size={12} className="animate-spin" />
        ACESSANDO DADOS: {toolInvocation.toolName}...
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleAI}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9990]"
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9999] w-[90vw] max-w-[420px] h-[650px] flex flex-col bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--border-color)] bg-black/40 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/10 border border-[var(--accent-color)] flex items-center justify-center shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">
                  <Bot size={18} className="text-[var(--accent-color)]" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-widest text-[var(--text-primary)] leading-none">
                    NEXUS <span className="text-[var(--accent-color)]">OS</span>
                  </h3>
                  <p className="text-[8px] font-mono text-[var(--text-secondary)] opacity-70 mt-0.5">SYSTEM ADMINISTRATOR</p>
                </div>
              </div>
              <button onClick={toggleAI} className="p-2 hover:bg-white/5 rounded-full text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer border-none bg-transparent">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[url('/grid-pattern.png')] bg-repeat opacity-95">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-6">
                  <div className="relative">
                    <Terminal size={64} className="text-[var(--accent-color)]" />
                    <div className="absolute inset-0 blur-xl bg-[var(--accent-color)]/30" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
                      Sistema Online
                    </p>
                    <p className="text-[9px] font-mono text-[var(--text-secondary)]">
                      Aguardando instruções de comando...
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m: any) => (
                <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border backdrop-blur-sm ${
                    m.role === 'user' 
                    ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)]' 
                    : 'bg-black/50 text-[var(--accent-color)] border-[var(--border-color)]'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Cpu size={14} />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {m.content && (
                      <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed backdrop-blur-md shadow-lg ${
                        m.role === 'user' 
                          ? 'bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 text-[var(--text-primary)] rounded-tr-sm' 
                          : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-tl-sm'
                      }`}>
                        {m.content}
                      </div>
                    )}
                    
                    {m.toolInvocations?.map((toolInvocation: any) => (
                      <div key={toolInvocation.toolCallId} className="w-full">
                        {renderToolInvocation(toolInvocation)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-1 pl-12 opacity-50">
                   <div className="h-4 w-1 bg-[var(--accent-color)] animate-[pulse_0.6s_infinite]" />
                   <div className="h-6 w-1 bg-[var(--accent-color)] animate-[pulse_0.6s_infinite_0.1s]" />
                   <div className="h-3 w-1 bg-[var(--accent-color)] animate-[pulse_0.6s_infinite_0.2s]" />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-[var(--border-color)] backdrop-blur-xl">
              <div className="relative flex items-center group">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="DIGITE UM COMANDO..."
                  className="w-full bg-[var(--bg-app)]/80 border border-[var(--border-color)] rounded-xl py-4 pl-5 pr-14 text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-color)] focus:shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)] outline-none transition-all placeholder:text-[10px] placeholder:font-black placeholder:tracking-widest placeholder:opacity-30"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input}
                  className="absolute right-2 p-2.5 bg-[var(--accent-color)] text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all cursor-pointer border-none shadow-[0_0_10px_rgba(var(--accent-rgb),0.4)]"
                >
                  <Send size={14} className="stroke-[3px]" />
                </button>
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[8px] font-mono text-[var(--text-secondary)] opacity-50">SECURE CONNECTION</span>
                <span className="text-[8px] font-mono text-[var(--accent-color)] opacity-50">CTRL + SPACE TO TOGGLE</span>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}