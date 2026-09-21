import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// Função para registrar logs automaticamente
export const logAction = async (action: string, target: string, type: 'user' | 'system' = 'user') => {
  try {
    const user = auth.currentUser;
    
    await addDoc(collection(db, "system_logs"), {
      action,
      target,
      type,
      user: type === 'system' ? 'Sistema' : (user?.displayName || "Usuário"),
      userId: type === 'system' ? 'system' : (user?.uid || "anon"),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erro ao gerar log:", error);
  }
};

// Função auxiliar para formatar tempo (ex: "há 2 horas")
export const timeAgo = (date: any) => {
  if (!date) return "Agora";
  const seconds = Math.floor((new Date().getTime() - date.toDate().getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos atrás";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses atrás";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias atrás";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h atrás";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m atrás";
  return "Agora mesmo";
};