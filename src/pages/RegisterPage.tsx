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
    <div className="flex h-screen w-full bg-black">
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-black shadow-2xl z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-500">Preencha os campos abaixo para começar.</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white">Nome Completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full p-3 rounded-lg bg-transparent border border-gray-300 focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] outline-none transition-all text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white">Email</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              className="w-full p-3 rounded-lg bg-transparent border border-gray-300 focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] outline-none transition-all text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-lg bg-transparent border border-gray-300 focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] outline-none transition-all text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition-opacity mt-2"
          >
            Cadastrar
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Já tem conta? <Link to="/login" className="text-[var(--accent-color)] font-semibold hover:underline">Faça login</Link>
        </p>
      </div>

      <div className="hidden lg:block lg:w-2/3 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1721020390853-28f20fdc9f06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>
    </div>
  );
}