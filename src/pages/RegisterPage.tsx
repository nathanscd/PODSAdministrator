import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Cria o usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Atualiza o nome de exibição imediatamente
      await updateProfile(userCredential.user, { displayName: name });
      
      // O useEffect vai detectar a mudança de user e redirecionar automaticamente
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao criar conta.";
      if (err.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
      if (err.code === 'auth/weak-password') msg = "A senha deve ter pelo menos 6 caracteres.";
      if (err.code === 'auth/invalid-email') msg = "E-mail inválido.";
      
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-sans">
        
        {/* LADO ESQUERDO - FORMULÁRIO */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] border-r border-white/5 z-10 relative">
          
          <div className="max-w-md w-full mx-auto">
            <div className="mb-12">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4 leading-[0.8]">
                New<br/><span className="text-[var(--accent-color)]">Member</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Join the Strategic Pipeline Control
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              
              {/* INPUT NOME */}
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block group-focus-within:text-[var(--accent-color)] transition-colors">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="
                      w-full pl-12 pr-4 py-4 rounded-2xl 
                      bg-[#111] border border-zinc-800 text-white 
                      placeholder:text-zinc-700 outline-none 
                      focus:border-[var(--accent-color)] focus:bg-[#151515] focus:ring-1 focus:ring-[var(--accent-color)]/20
                      transition-all text-sm font-medium
                      [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111_inset] 
                      [&:-webkit-autofill]:-webkit-text-fill-color-white
                    "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* INPUT EMAIL */}
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
              
              {/* INPUT SENHA */}
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block group-focus-within:text-[var(--accent-color)] transition-colors">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="
                      w-full pl-12 pr-4 py-4 rounded-2xl 
                      bg-[#111] border border-zinc-800 text-white 
                      placeholder:text-zinc-700 outline-none 
                      focus:border-[var(--accent-color)] focus:bg-[#151515] focus:ring-1 focus:ring-[var(--accent-color)]/20
                      transition-all text-sm font-medium
                      [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111_inset] 
                      [&:-webkit-autofill]:-webkit-text-fill-color-white
                    "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-4 w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-[0_4px_20px_-5px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Criar Conta <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="mt-12 text-center text-[10px] uppercase font-bold text-zinc-600 tracking-widest">
              Já possui acesso? <NavLink to="/login" className="text-white hover:text-[var(--accent-color)] transition-colors underline decoration-transparent hover:decoration-[var(--accent-color)] underline-offset-4">Fazer Login</NavLink>
            </p>
          </div>
        </div>

        {/* LADO DIREITO - IMAGEM/ARTE */}
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
          
          <div className="absolute bottom-24 left-24">
             <div className="w-16 h-1 bg-[var(--accent-color)] mb-8"></div>
             <h2 className="text-8xl font-black italic uppercase text-white tracking-tighter leading-none opacity-100 drop-shadow-2xl">
               Future<br/>Ready<br/>Teams
             </h2>
             <p className="mt-8 text-sm font-medium text-zinc-400 max-w-md leading-relaxed border-l-2 border-zinc-800 pl-6">
               Junte-se ao ecossistema de alta performance para gestão de oportunidades e inteligência de mercado.
             </p>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}