import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import Editor from "../components/Editor";
import BoardView from "../components/BoardView";
import { Page } from "../types";

export default function WorkspacePage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { updatePage } = usePages();
  const [page, setPage] = useState<Page | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const navigate = useNavigate();
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pageId) return;
    const unsub = onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Page;
        setPage(data);
        if (document.activeElement?.id !== "page-title-input") {
          setLocalTitle(data.title);
        }
      }
    });
    return unsub;
  }, [pageId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      if (pageId) updatePage(pageId, { title: val });
    }, 800);
  };

  if (!page) return <div className="p-10 text-gray-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-white text-[#37352F]">
      <nav className="h-12 px-4 flex items-center gap-2 sticky top-0 bg-white z-20 border-b border-transparent hover:border-gray-100 transition-colors">
        <button 
          onClick={() => navigate("/paginas")} 
          className="text-sm text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
        >
          ⤺ Voltar
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
           <span>{page.type === 'board' ? '📊' : '📄'}</span>
           <span>{localTitle || "Sem título"}</span>
        </div>
      </nav>

      <div className={`mx-auto ${page.type === 'board' ? 'px-4' : 'max-w-[900px] px-12 md:px-24'} pt-12`}>
        <div className="group relative mb-8">
          <input
            id="page-title-input"
            className="w-full text-4xl font-bold placeholder-gray-300 border-none outline-none bg-transparent focus:ring-0 text-[#37352F] p-0"
            value={localTitle}
            onChange={handleTitleChange}
            placeholder="Sem título"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="w-full">
        {page.type === 'board' ? (
          <BoardView page={page} />
        ) : (
          <div className="w-full placeholder-gray-300 border-none outline-none bg-transparent focus:ring-0 text-[#37352F] p-0">
            <Editor
              key={page.id}
              initialContent={page.content || ""}
              onUpdate={(html) => updatePage(page.id, { content: html })}
            />
          </div>
        )}
      </div>
    </div>
  );
}