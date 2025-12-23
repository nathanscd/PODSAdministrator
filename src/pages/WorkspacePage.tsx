import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import Editor from "../components/Editor";
import { Page } from "../types";

export default function WorkspacePage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { updatePage } = usePages();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    if (!pageId) return;
    const unsub = onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        setPage({ id: docSnap.id, ...docSnap.data() } as Page);
      }
    });
    return unsub;
  }, [pageId]);

  if (!page) return <div className="p-10 text-gray-400">Carregando conteúdo...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-20 px-10 pb-20">
      <input
        className="text-5xl font-bold w-full outline-none mb-10 border-none focus:ring-0 placeholder-gray-200 bg-transparent"
        value={page.title}
        onChange={(e) => updatePage(page.id, { title: e.target.value })}
        placeholder="Sem título"
      />
      <Editor
        key={page.id}
        initialContent={page.content}
        onUpdate={(html) => updatePage(page.id, { content: html })}
      />
    </div>
  );
}