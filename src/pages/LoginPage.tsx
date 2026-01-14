import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O navigate só ocorre após a promise resolver, garantindo o token.
      navigate("/");
    } catch (err: any) {
      console.error(err);
      let msg = "Falha ao entrar. Tente novamente.";
      if (err.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
      if (err.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
      if (err.code === 'auth/wrong-password') msg = "Senha incorreta.";
      if (err.code === 'auth/too-many-requests') msg = "Muitas tentativas. Tente mais tarde.";
      setError(msg);
      setLoading(false); // Só tira o loading se der erro. Se der sucesso, deixa carregando até a página mudar.
    }
  };

  return (
    <PageTransition>
      <div className="flex h-screen w-full bg-black overflow-hidden font-sans">
        
        {/* LADO ESQUERDO - FORMULÁRIO */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[var(--bg-app)] border-r border-[var(--border-color)] z-10 relative">
          
          <div className="max-w-md w-full mx-auto">
            <div className="mb-12">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4 leading-[0.8]">
                Welcome<br/><span className="text-[var(--accent-color)]">Back</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60">
                Acesse o painel de oportunidades AMI
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 block group-focus-within:text-[var(--accent-color)] transition-colors">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-white transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[var(--accent-color)] focus:bg-white/10 transition-all text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors">Senha</label>
                  <Link to="/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-white transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-[var(--accent-color)] focus:bg-white/10 transition-all text-sm font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--accent-color)] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_-5px_var(--accent-color)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-10 text-center text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">
              Não tem acesso? <span className="text-white cursor-pointer hover:underline">Contate o Admin</span>
            </p>
          </div>
        </div>

        {/* LADO DIREITO - IMAGEM/ARTE */}
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
          
          <div className="absolute bottom-20 left-20">
             <div className="w-20 h-1 bg-[var(--accent-color)] mb-6"></div>
             <h2 className="text-7xl font-black italic uppercase text-white tracking-tighter leading-none opacity-90">
               Strategic<br/>Pipeline<br/>Control
             </h2>
             <p className="mt-6 text-sm font-medium text-gray-400 max-w-md leading-relaxed">
               Gerencie oportunidades de AMI, analise win/loss e controle o roadmap técnico em um único ecossistema.
             </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}