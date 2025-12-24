import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Falha ao entrar. Verifique suas credenciais.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)] w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">Entrar</h1>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-transparent border border-gray-300 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-3 rounded bg-transparent border border-gray-300 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-[var(--accent-color)] text-white border-none mt-2 hover:opacity-90">
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem conta? <Link to="/register" className="text-[var(--text-secondary)]">Crie uma aqui</Link>
        </p>
      </div>
    </div>
  );
}