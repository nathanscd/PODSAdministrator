import { useState, useEffect } from "react";
import { 
  collection, onSnapshot, query, where, orderBy, 
  serverTimestamp, addDoc, updateDoc, deleteDoc, doc, getDoc, or 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { Page, PageType } from "../types";

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        setAdminLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const checkAdmin = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin === true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAdminLoaded(true);
      }
    };
    checkAdmin();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !adminLoaded) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, "pages"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "pages"), 
        or(
          where("ownerId", "==", currentUser.uid),
          where("isPublic", "==", true)
        ),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Page));
      setPages(data);
      setLoading(false);
    }, (err) => {
      console.error("Erro na busca de páginas:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, isAdmin, adminLoaded]);

  const createPage = async (title: string = "", type: PageType = "document", templateData: any = {}) => {
    if (!currentUser) return null;
    const docRef = await addDoc(collection(db, "pages"), {
      title: title || (type === "board" ? "Novo Quadro" : "Nova Página"),
      type,
      ownerId: currentUser.uid,
      ownerName: currentUser.displayName || "Membro",
      isPublic: false,
      createdAt: serverTimestamp(),
      theme: "light",
      ...(type === "board" ? {
        tasks: templateData.tasks || {},
        columns: templateData.columns || {
          "col-1": { id: "col-1", title: "A Fazer", taskIds: [] },
          "col-2": { id: "col-2", title: "Em Andamento", taskIds: [] },
          "col-3": { id: "col-3", title: "Concluído", taskIds: [] },
        },
        columnOrder: templateData.columnOrder || ["col-1", "col-2", "col-3"],
      } : { content: templateData.content || "" })
    });
    return docRef.id;
  };

  const updatePage = async (id: string, data: Partial<Page>) => {
    await updateDoc(doc(db, "pages", id), data as any);
  };

  const deletePage = async (id: string) => {
    await deleteDoc(doc(db, "pages", id));
  };

  return { 
    pages, 
    loading: loading || !adminLoaded, 
    isAdmin, 
    userDisplayName: currentUser?.displayName || "Membro",
    createPage,
    updatePage,
    deletePage
  };
}