import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { logAction } from "../utils/systemLogger";
import { Plus, FileText, Briefcase, StickyNote, Trash2, Globe, User } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { Page } from "../types";
import { useLang } from "../contexts/LangContext";
import { useTitle } from "../hooks/useTitle";
import { PageHero } from "../components/ui/page-hero";
import { EmptyState } from "../components/ui/empty-state";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/ui/status-badge";

export default function PagesDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'opportunities'>('personal');
  const { isAdmin } = useAuth(); 
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { t } = useLang();
  useTitle(`${t.pages.title} - PODS Administrator`);

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
    }, (error) => {
      console.error(error);
      addToast(t.pages.messages.loadError, "error");
    });

    return unsubscribe;
  }, [isAdmin, t]);

  const createNewPage = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = await addDoc(collection(db, "pages"), {
        title: t.pages.defaults.newPageTitle,
        content: "",
        type: "document", 
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName || t.pages.defaults.user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: false,
        linkedOpportunityId: null
      });
      
      logAction("Criou Página", "Nova Anotação");
      addToast(t.pages.messages.createdSuccess, "success");
      navigate(`/page/${docRef.id}`);
    } catch (error) {
      addToast(t.pages.messages.createError, "error");
    }
  };

  const deletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (confirm(t.pages.messages.confirmDelete)) {
      try {
        await deleteDoc(doc(db, "pages", pageId));
        logAction("Excluiu Página", pageId);
        addToast(t.pages.messages.deletedSuccess, "info");
      } catch (error) {
        addToast(t.pages.messages.deleteError, "error");
      }
    }
  };

  const formatDate = (page: Page) => {
    const timestamp = page.updatedAt || page.createdAt;
    if (!timestamp) return t.pages.status.saving; 
    if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString('pt-BR'); 
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
    return t.pages.status.noDate;
  };

  const filteredPages = pages.filter(page => 
    activeTab === 'personal' ? !page.linkedOpportunityId : !!page.linkedOpportunityId
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHero
          title={t.pages.title}
          description={`${t.pages.subtitle} ${isAdmin ? `(${t.pages.admin})` : ''}`}
          icon={<FileText className="w-6 h-6 text-[var(--primary)]" />}
          actions={
            <Button onClick={createNewPage} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Nova Página</span>
            </Button>
          }
        />

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Button
            variant={activeTab === 'personal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('personal')}
            className="gap-2 rounded-xl"
          >
            <StickyNote className="w-4 h-4" />
            <span>{t.pages.tabs.personal}</span>
          </Button>
          <Button
            variant={activeTab === 'opportunities' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('opportunities')}
            className="gap-2 rounded-xl"
          >
            <Briefcase className="w-4 h-4" />
            <span>{t.pages.tabs.opportunities}</span>
          </Button>
        </div>

        {/* Pages Grid */}
        {filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPages.map((page) => (
              <div 
                key={page.id} 
                onClick={() => navigate(`/page/${page.id}`)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden h-52"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-[var(--primary)]">
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] truncate">
                      {page.ownerName || t.pages.defaults.unknown}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {page.isPublic && (
                      <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500" title={t.pages.status.public}>
                        <Globe className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <button 
                      onClick={(e) => deletePage(e, page.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-auto">
                  <h3 className="text-base font-bold text-[var(--foreground)] line-clamp-2 tracking-tight group-hover:text-[var(--primary)] transition-colors">
                    {page.title || t.pages.defaults.untitled}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 mt-2 text-[11px] font-medium text-[var(--muted-foreground)]">
                  <span>{formatDate(page)}</span>
                  {page.linkedOpportunityId && (
                    <StatusBadge status="info" label={t.pages.status.linked} dot={false} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-[var(--muted-foreground)]" />}
            title={t.pages.messages.emptyState}
            description="Crie uma nova página ou anotação para começar a organizar suas ideias no workspace."
            primaryActionLabel="Criar Página"
            onPrimaryAction={createNewPage}
          />
        )}
      </div>
    </PageTransition>
  );
}