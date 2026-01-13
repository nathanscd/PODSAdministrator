import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Plus, FileText, Briefcase, StickyNote, Trash2, Globe, User } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { Page } from "../types";

export default function PagesDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'opportunities'>('personal');
  const { isAdmin } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = isAdmin 
      ? query(collection(db, "pages")) 
      : query(collection(db, "pages"), where("ownerId", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Page))
        .filter(page => page.type !== 'board');

      const sortedDocs = docs.sort((a, b) => {
        const dateA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
        const dateB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
        return dateB - dateA; 
      });

      setPages(sortedDocs);
    });

    return unsubscribe;
  }, [isAdmin]);

  const createNewPage = async () => {
    if (!auth.currentUser) return;
    const docRef = await addDoc(collection(db, "pages"), {
      title: "Nova Anotação",
      content: "",
      type: "document", // Define como documento na criação
      ownerId: auth.currentUser.uid,
      ownerName: auth.currentUser.displayName || "Usuário",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
      linkedOpportunityId: null
    });
    navigate(`/page/${docRef.id}`);
  };

  const deletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (confirm("Deseja excluir permanentemente esta anotação?")) {
      await deleteDoc(doc(db, "pages", pageId));
    }
  };

  const formatDate = (page: Page) => {
    const timestamp = page.updatedAt || page.createdAt;
    if (!timestamp) return "A guardar..."; 
    if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString('pt-BR'); 
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
    return "Sem data";
  };

  const filteredPages = pages.filter(page => 
    activeTab === 'personal' ? !page.linkedOpportunityId : !!page.linkedOpportunityId
  );

  return (
    <PageTransition>
      <div className="min-h-screen ml-10 -mr-10 -mt-10bg-[var(--bg-app)] p-8 lg:p-20">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Notas</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
              Gestão de Conteúdo {isAdmin && "(Administrador)"}
            </p>
          </div>
          <button 
            onClick={createNewPage} 
            className="bg-[var(--accent-color)] text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <Plus size={24} />
          </button>
        </header>

        <div className="flex gap-6 mb-10 border-b border-[var(--border-color)] pb-1">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all bg-transparent border-none cursor-pointer ${activeTab === 'personal' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}`}
          >
            <StickyNote size={16} /> Pessoais
          </button>
          <button 
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all bg-transparent border-none cursor-pointer ${activeTab === 'opportunities' ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}`}
          >
            <Briefcase size={16} /> Oportunidades
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPages.map(page => (
            <div 
              key={page.id} 
              onClick={() => navigate(`/page/${page.id}`)}
              className="group bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl cursor-pointer hover:border-[var(--accent-color)] transition-all hover:-translate-y-1 relative overflow-hidden h-52 flex flex-col justify-between shadow-sm"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity text-[var(--accent-color)] pointer-events-none">
                <FileText size={40} />
              </div>

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {page.isPublic && (
                   <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg" title="Pública">
                     <Globe size={16} />
                   </div>
                )}
                <button 
                  onClick={(e) => deletePage(e, page.id)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border-none cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-2 pr-8">
                <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-2 leading-tight">
                  {page.title || "Sem Título"}
                </h3>
                <div className="flex items-center gap-1.5 text-[var(--accent-color)] opacity-60">
                  <User size={10} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{page.ownerName || "Desconhecido"}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                  {formatDate(page)}
                </p>
                {page.linkedOpportunityId && (
                  <div className="flex items-center gap-1.5 bg-[var(--accent-color)]/10 px-2 py-1 rounded-md text-[var(--accent-color)]">
                    <Briefcase size={10} />
                    <span className="text-[8px] font-black uppercase">Vinculada</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPages.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <p className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Nenhuma nota encontrada nesta secção.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}