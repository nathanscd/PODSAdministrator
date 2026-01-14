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
      <div className="flex h-screen w-full bg-black overflow-hidden font-sans items-center justify-center relative">
        
        {/* Background Sutil */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

        <div className="w-full max-w-md p-8 relative z-10">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl">
            
            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-white mb-8 transition-colors">
              <ArrowLeft size={14} /> Voltar para Login
            </Link>

            <div className="mb-8">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                Recovery
              </h1>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Digite seu e-mail corporativo. Enviaremos um link seguro para você redefinir sua senha.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center animate-in zoom-in-95">
                <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
                <h3 className="text-white font-bold text-sm mb-1">E-mail Enviado!</h3>
                <p className="text-xs text-green-200 opacity-80">{message}</p>
                <Link to="/login" className="mt-6 block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Voltar ao Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-6">
                
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {message}
                  </div>
                )}

                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-white transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[var(--accent-color)] transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : "Enviar Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}