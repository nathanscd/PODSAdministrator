import { useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export function NotificationListener() {
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Define um marco temporal: Só queremos toasters para notificações criadas AGORA em diante.
    // Isso evita que, ao recarregar a página, o usuário receba toasts de notificações antigas.
    const startTime = Timestamp.now();

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      where("createdAt", ">", startTime) // Apenas novas
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data();
          
          // Verifica se quem enviou foi outra pessoa.
          // Se fui eu mesmo que criei a notificação (auto-atribuição), 
          // a interface local já mostrou o feedback, então não precisa duplicar.
          if (notif.senderId !== user.uid) {
             addToast(notif.title || "Nova notificação", "info");
             
             // Opcional: Tocar um som
             // const audio = new Audio('/notification.mp3');
             // audio.play().catch(() => {});
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, addToast]);

  return null;
}