import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { logAction } from "@/utils/systemLogger";
import { motion } from "framer-motion";

import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { IconGoogle, IconGithub, IconMicrosoft } from '@/components/common/ConnectionIcons';
import SidebarAuth from "@/components/common/SidebarAuth";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth(); 

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await logAction("Login realizado", "Acesso ao sistema");
    } catch (err: any) {
      console.error(err);
      let msg = "Falha ao entrar.";
      if (err.code === 'auth/invalid-credential') msg = "Credenciais inválidas.";
      if (err.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
      if (err.code === 'auth/wrong-password') msg = "Senha incorreta.";
      if (err.code === 'auth/too-many-requests') msg = "Muitas tentativas. Aguarde.";
      
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex lg:flex-row flex-col w-full h-[100dvh] items-center justify-center">
          <SidebarAuth children={undefined} />
        <div className="w-full lg:w-[50vw] h-[55dvh] lg:h-[100dvh] bg-card flex justify-center items-center px-4 lg:px-0">
          <motion.div
            className="w-full max-w-md"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <h1 className="text-5xl font-secondary font-bold text-left tracking-tight">
                Welcome back
              </h1>
            </motion.div>
            
            <motion.p variants={staggerItem} className="text-base text-[var(--primary-text)] opacity-50 font-secondary mt-2 mb-8">
              Continue building your automation infrastructure.
            </motion.p>

            {error && (
              <motion.div variants={staggerItem} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md mb-6 text-sm font-secondary flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin}>
              <motion.div variants={staggerItem}>
                <p className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Email</p>
                <div className="relative mt-1.5 group">
                  <Mail className="absolute h-5 w-5 left-3 top-1/2 -translate-y-1/2 text-[var(--primary-text)] opacity-30 transition-opacity duration-300 group-focus-within:opacity-70" />
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-11 font-secondary transition-all duration-300 focus:ring-2 focus:ring-[var(--secondary-text)]/40 focus:border-[var(--secondary-text)]"
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-5">
                <p className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Senha</p>
                <div className="relative mt-1.5 group">
                  <Lock className="absolute h-5 w-5 left-3 top-1/2 -translate-y-1/2 text-[var(--primary-text)] opacity-30 transition-opacity duration-300 group-focus-within:opacity-70" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-11 font-secondary transition-all duration-300 focus:ring-2 focus:ring-[var(--secondary-text)]/40 focus:border-[var(--secondary-text)]"
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-5 flex flex-row items-center justify-between">
                <Field orientation="horizontal" data-invalid className="flex items-center">
                  <Checkbox id="remember-checkbox" name="remember-checkbox" />
                  <FieldLabel htmlFor="remember-checkbox" className="font-secondary text-sm">
                    Lembre-se de mim
                  </FieldLabel>
                </Field>
                <Link
                  to="/forgot-password"
                  className="text-xs w-full text-right font-secondary opacity-50 text-[var(--primary-text)] hover:text-[var(--secondary-text)] hover:opacity-100 transition-all duration-300"
                >
                  Esqueci minha senha
                </Link>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-7">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 cursor-pointer text-base font-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                  variant="secondary"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 font-secondary">
                      <Spinner />
                      Autenticando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={staggerItem} className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--primary-text)] opacity-10" />
                <span className="text-xs font-secondary opacity-30">OR</span>
                <div className="flex-1 h-px bg-[var(--primary-text)] opacity-10" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-5 space-y-2.5">
              <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-3 rounded-md border border-[var(--primary-text)]/10 hover:border-[var(--primary-text)]/20 bg-transparent transition-all duration-300 cursor-pointer group"
              >
                <IconGoogle className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Continue with Google</span>
              </button>
              <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-3 rounded-md border border-[var(--primary-text)]/10 hover:border-[var(--primary-text)]/20 bg-transparent transition-all duration-300 cursor-pointer group"
              >
                <IconMicrosoft className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Continue with Microsoft</span>
              </button>
              <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-3 rounded-md border border-[var(--primary-text)]/10 hover:border-[var(--primary-text)]/20 bg-transparent transition-all duration-300 cursor-pointer group"
              >
                <IconGithub className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Continue with GitHub</span>
              </button>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-sm font-secondary opacity-40 mt-8">
              Ainda não possui uma conta?{" "}
              <Link
                to="/register"
                className="font-secondary text-[var(--secondary-text)] opacity-80 hover:opacity-100 transition-opacity duration-300"
              >
                Registrar-se
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}