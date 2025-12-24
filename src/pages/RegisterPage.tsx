import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate("/");
    } catch (err) {
      alert("Erro ao criar conta.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)] w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">Criar Conta</h1>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nome Completo"
            className="p-3 rounded bg-transparent border border-gray-300 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Cadastrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta? <Link to="/login" className="text-[var(--text-secondary)]">Faça login</Link>
        </p>
      </div>
    </div>
  );
}