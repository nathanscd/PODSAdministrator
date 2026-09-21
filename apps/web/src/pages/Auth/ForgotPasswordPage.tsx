import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
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
                Password Recovery
              </h1>
            </motion.div>
            
            <motion.p variants={staggerItem} className="text-base text-[var(--primary-text)] opacity-50 font-secondary mt-2 mb-8">
              Digite seu e-mail corporativo para receber as instruções de redefinição.
            </motion.p>

            {status === 'success' ? (
              <motion.div variants={staggerItem} className="bg-green-500/5 border border-green-500/20 rounded-md p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-[var(--primary-text)] font-secondary font-bold text-xl mb-2">
                  E-mail Enviado!
                </h3>
                <p className="text-sm text-[var(--primary-text)] opacity-70 font-secondary mb-8">
                  {message}
                </p>
                <Link to="/login" className="w-full">
                  <Button variant="secondary" className="w-full h-12 text-base font-secondary">
                    Voltar ao Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleReset}>
                {status === 'error' && (
                  <motion.div variants={staggerItem} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md mb-6 text-sm font-secondary flex items-center gap-3">
                    <AlertCircle size={16} />
                    {message}
                  </motion.div>
                )}

                <motion.div variants={staggerItem}>
                  <p className="text-sm font-secondary text-[var(--primary-text)] opacity-70">Email Corporativo</p>
                  <div className="relative mt-1.5 group">
                    <Mail className="absolute h-5 w-5 left-3 top-1/2 -translate-y-1/2 text-[var(--primary-text)] opacity-30 transition-opacity duration-300 group-focus-within:opacity-70" />
                    <Input
                      type="email"
                      placeholder="seu@email.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-11 font-secondary transition-all duration-300 focus:ring-2 focus:ring-[var(--secondary-text)]/40 focus:border-[var(--secondary-text)]"
                    />
                  </div>
                </motion.div>

                <motion.div variants={staggerItem} className="mt-7">
                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 cursor-pointer text-base font-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                    variant="secondary"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2 font-secondary">
                        <Spinner />
                        Enviando...
                      </span>
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </Button>
                </motion.div>
              </form>
            )}

            {status !== 'success' && (
              <motion.p variants={staggerItem} className="text-center text-sm font-secondary opacity-50 mt-8 flex justify-center items-center gap-2">
                <ArrowLeft size={14} className="opacity-70" />
                <Link
                  to="/login"
                  className="font-secondary text-[var(--primary-text)] hover:text-[var(--secondary-text)] transition-colors duration-300"
                >
                  Voltar para Login
                </Link>
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}