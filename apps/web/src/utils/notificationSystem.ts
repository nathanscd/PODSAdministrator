import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export const sendNotification = async (
  recipientId: string,
  title: string,
  description: string,
  type: 'assignment' | 'alert' | 'info' | 'system' = 'info',
  link?: string
) => {
  try {
    const sender = auth.currentUser;
    
    if (!recipientId) return;

    await addDoc(collection(db, "notifications"), {
      recipientId,
      senderId: sender?.uid || 'system',
      senderName: sender?.displayName || 'Sistema',
      title,
      description,
      type,
      link,
      read: false,
      createdAt: serverTimestamp() 
    });
    
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};