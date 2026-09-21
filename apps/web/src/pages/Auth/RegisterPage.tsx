import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
                New Member
              </h1>
            </motion.div>
            
            <motion.p variants={staggerItem} className="text-base text-[var(--primary-text)] opacity-50 font-secondary mt-2 mb-8">
              Join the Strategic Pipeline Control.
            </motion.p>

            {error && (
              <motion.div variants={staggerItem} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md mb-6 text-sm font-secondary flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister}>
              <motion.div variants={staggerItem}>
                <p className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Nome Completo</p>
                <div className="relative mt-1.5 group">
                  <User className="absolute h-5 w-5 left-3 top-1/2 -translate-y-1/2 text-[var(--primary-text)] opacity-30 transition-opacity duration-300 group-focus-within:opacity-70" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 pl-11 font-secondary transition-all duration-300 focus:ring-2 focus:ring-[var(--secondary-text)]/40 focus:border-[var(--secondary-text)]"
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-5">
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
                      Criando Conta...
                    </span>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.p variants={staggerItem} className="text-center text-sm font-secondary opacity-40 mt-8">
              Já possui acesso?{" "}
              <Link
                to="/login"
                className="font-secondary text-[var(--secondary-text)] opacity-80 hover:opacity-100 transition-opacity duration-300"
              >
                Fazer Login
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}