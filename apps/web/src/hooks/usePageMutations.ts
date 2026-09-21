import { updateDoc, doc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Page, PageType } from "../types";

export function usePageMutations() {
  const updatePage = async (id: string, data: Partial<Page>) => {
    try {
      await updateDoc(doc(db, "pages", id), data as any);
    } catch (error) {
      console.error("Error updating page:", error);
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pages", id));
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  };

  const createPage = async (title: string = "", type: PageType = "document", templateData: any = {}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
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
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  };

  return {
    updatePage,
    deletePage,
    createPage
  };
}
