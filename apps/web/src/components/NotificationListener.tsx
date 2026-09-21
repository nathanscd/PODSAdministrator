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
    const startTime = Timestamp.now();

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      where("createdAt", ">", startTime) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notif = change.doc.data();
          
          if (notif.senderId !== user.uid) {
             addToast(notif.title || "Nova notificação", "info");
            
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, addToast]);

  return null;
}