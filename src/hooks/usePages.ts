import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Page } from "../types";

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const q = query(collection(db, "pages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Page[];
      setPages(data);
    });
    return unsubscribe;
  }, []);

  const createPage = async () => {
    try {
      const docRef = await addDoc(collection(db, "pages"), {
        title: "",
        content: "",
        createdAt: new Date()
      });
      return docRef.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const updatePage = async (id: string, data: Partial<Page>) => {
    await updateDoc(doc(db, "pages", id), data);
  };

  const deletePage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pages", id));
    } catch (e) {
      console.error(e);
    }
  };

  return { pages, createPage, updatePage, deletePage };
};