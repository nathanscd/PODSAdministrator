import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { Page, PageType } from "../types";

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pages"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Page[];
      
      setPages(pagesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createPage = async (type: PageType = "document") => {
    const baseData = {
      title: "",
      type,
      createdAt: serverTimestamp(),
    };

    let initialData = {};

    if (type === "board") {
      initialData = {
        tasks: {},
        columns: {
          "col-1": { id: "col-1", title: "A Fazer", taskIds: [] },
          "col-2": { id: "col-2", title: "Em Andamento", taskIds: [] },
          "col-3": { id: "col-3", title: "Concluído", taskIds: [] },
        },
        columnOrder: ["col-1", "col-2", "col-3"],
      };
    } else {
      initialData = {
        content: "",
      };
    }

    const docRef = await addDoc(collection(db, "pages"), {
      ...baseData,
      ...initialData,
    });

    return docRef.id;
  };

  const updatePage = async (id: string, data: Partial<Page>) => {
    const docRef = doc(db, "pages", id);
    await updateDoc(docRef, data);
  };

  const deletePage = async (id: string) => {
    const docRef = doc(db, "pages", id);
    await deleteDoc(docRef);
  };

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
  };
}