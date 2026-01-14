import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('success');
      setMessage("Um link de recuperação foi enviado para o seu e-mail.");
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      let msg = "Erro ao enviar e-mail.";
      if (err.code === 'auth/user-not-found') msg = "E-mail não cadastrado.";
      if (err.code === 'auth/invalid-email') msg = "Formato de e-mail inválido.";
      setMessage(msg);
    }
  };

  return (
    <PageTransition>
      <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-sans">
        
        {/* LADO ESQUERDO - FORMULÁRIO */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] border-r border-white/5 z-10 relative">
          
          <div className="max-w-md w-full mx-auto">
            
            <Link to="/login" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={14} /> Voltar para Login
            </Link>

            <div className="mb-10">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4 leading-[0.8]">
                Password<br/><span className="text-[var(--accent-color)]">Recovery</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-relaxed">
                Digite seu e-mail corporativo para receber as instruções de redefinição.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-white font-black uppercase italic text-xl mb-2">E-mail Enviado!</h3>
                <p className="text-sm text-zinc-400 mb-6">{message}</p>
                <Link to="/login" className="block w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
                  Voltar ao Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-6">
                
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                    <AlertCircle size={16} /> {message}
                  </div>
                )}

                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block group-focus-within:text-[var(--accent-color)] transition-colors">
                    Email Corporativo
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="seu@email.com.br"
                      className="
                        w-full pl-12 pr-4 py-4 rounded-2xl 
                        bg-[#111] border border-zinc-800 text-white 
                        placeholder:text-zinc-700 outline-none 
                        focus:border-[var(--accent-color)] focus:bg-[#151515] focus:ring-1 focus:ring-[var(--accent-color)]/20
                        transition-all text-sm font-medium
                        [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111_inset] 
                        [&:-webkit-autofill]:-webkit-text-fill-color-white
                      "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full bg-[var(--accent-color)] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : "Enviar Link de Recuperação"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* LADO DIREITO - ARTE (Idêntico ao Login) */}
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
          
          <div className="absolute bottom-24 left-24">
             <div className="w-16 h-1 bg-[var(--accent-color)] mb-8"></div>
             <h2 className="text-8xl font-black italic uppercase text-white tracking-tighter leading-none opacity-100 drop-shadow-2xl">
               Secure<br/>Access
             </h2>
             <p className="mt-8 text-sm font-medium text-zinc-400 max-w-md leading-relaxed border-l-2 border-zinc-800 pl-6">
               Recuperação segura de credenciais para garantir a continuidade do controle operacional.
             </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}