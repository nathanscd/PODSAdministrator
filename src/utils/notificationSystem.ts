import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export const sendNotification = async (
  recipientId: string, 
  title: string, 
  description: string, 
  type: 'assignment' | 'version' | 'alert',
  link: string
) => {
  try {
    const sender = auth.currentUser;
    
    // Evita notificar a si mesmo se atribuir uma tarefa para si mesmo
    if (recipientId === sender?.uid) return;

    await addDoc(collection(db, "notifications"), {
      recipientId,
      senderName: sender?.displayName || "Sistema",
      senderPhoto: sender?.photoURL || null,
      title,
      description,
      type,
      link,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
};