import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Book,
  ArrowRight,
  Zap,
  Plus,
  FileDown,
  Share2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Loader2,
  MoreVertical,
  Edit2,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useFavicon, useTitle } from "../hooks/useTitle";
import { useTestbook } from "../hooks/useTestbook";
import { TestbookCreateModal } from "../components/Testbook/TestbookCreateModal";
import { TestbookShareModal } from "../components/Testbook/TestbookShareModal";
import { useAuth } from "../contexts/AuthContext";
import { Testbook, TestbookModule } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// All testbooks now come from Firebase - see scripts/seedTestbooks.ts for initialization

const COLOR_MAP: { [key: string]: { bg: string; border: string } } = {
  "text-amber-500": { bg: "bg-amber-500/10", border: "border-amber-500/30" },
  "text-blue-500": { bg: "bg-blue-500/10", border: "border-blue-500/30" },
  "text-emerald-500": { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  "text-purple-500": { bg: "bg-purple-500/10", border: "border-purple-500/30" },
  "text-pink-500": { bg: "bg-pink-500/10", border: "border-pink-500/30" },
  "text-orange-500": { bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

function TestbookCard({ testbook, onEdit, onDelete, onDownload, onShare, onDuplicate, onTogglePublic }: {
  testbook: Testbook;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onTogglePublic: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const colorMap = COLOR_MAP[testbook.color] || COLOR_MAP["text-blue-500"];

  const handleCardClick = () => {
    if (!testbook.isCustom) {
      navigate(`/${testbook.id}`);
    } else {
      navigate(`/testbook/${testbook.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full cursor-pointer hover:border-[var(--accent-color)]/50"
      onClick={handleCardClick}
    >
      {/* Menu button */}
      {user?.uid && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
          >
            <MoreVertical size={18} className="text-[var(--text-secondary)]" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  {
                    icon: Edit2,
                    label: "Editar",
                    action: () => {
                      onEdit();
                      setShowMenu(false);
                    },
                  },
                  {
                    icon: FileDown,
                    label: "Download PDF",
                    action: () => {
                      onDownload();
                      setShowMenu(false);
                    },
                  },
                  ...(testbook.isCustom ? [
                    {
                      icon: Share2,
                      label: "Compartilhar",
                      action: () => {
                        onShare();
                        setShowMenu(false);
                      },
                    }
                  ] : []),
                  {
                    icon: Copy,
                    label: "Duplicar",
                    action: () => {
                      onDuplicate();
                      setShowMenu(false);
                    },
                  },
                  ...(testbook.isCustom ? [
                    {
                      icon: testbook.isPublic ? Lock : Unlock,
                      label: testbook.isPublic ? "Tornar Privado" : "Tornar Público",
                      action: () => {
                        onTogglePublic();
                        setShowMenu(false);
                      },
                    },
                    {
                      icon: Trash2,
                      label: "Deletar",
                      action: () => {
                        onDelete();
                        setShowMenu(false);
                      },
                      danger: true,
                    }
                  ] : []),
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className={`w-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[var(--bg-app)] transition-colors ${
                      item.danger ? "text-red-500 hover:bg-red-500/10" : "text-[var(--text-primary)]"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorMap.bg} ${colorMap.border} shadow-inner group-hover:scale-110 transition-transform duration-300`}
        >
          <Zap size={24} strokeWidth={2} className={testbook.color} />
        </div>
        <div className="flex gap-2">
          {testbook.isCustom && (
            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
              testbook.isPublic
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
            }`}>
              {testbook.isPublic ? "Público" : "Privado"}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
        {testbook.title}
      </h3>

      <p className="text-sm text-[var(--text-secondary)] opacity-80 leading-relaxed flex-1 mb-6">
        {testbook.description}
      </p>

      <div className="space-y-3">
        <div className="text-xs text-[var(--text-secondary)]">
          <p className="font-bold mb-1">Módulos: {testbook.modules?.length || 0}</p>
          <div className="flex flex-wrap gap-1">
            {(testbook.modules || []).map((module) => (
              <span key={module} className="px-2 py-1 bg-[var(--bg-app)] rounded text-[10px] font-medium">
                {module}
              </span>
            ))}
          </div>
        </div>
      </div>

      {testbook.ownerName && testbook.ownerName !== "Sistema" && (
        <p className="text-xs text-[var(--text-secondary)] mt-4 pt-4 border-t border-[var(--border-color)]">
          Por: {testbook.ownerName}
        </p>
      )}

      <div className="flex items-center text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors mt-4">
        <span>{testbook.isCustom ? "Acessar / Editar" : "Acessar testbook"}</span>
        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

export default function Testbooks() {
  useTitle("Testbooks - Manuais e Guias");
  useFavicon("/testbooks/Testbook.png");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testbooks, loading, fetchTestbooks, createTestbook, deleteTestbook, duplicateTestbook, togglePublic, shareTestbook } = useTestbook();
  const [displayTestbooks, setDisplayTestbooks] = useState<Testbook[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTestbookForShare, setSelectedTestbookForShare] = useState<Testbook | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchTestbooks(user.uid);
    }
  }, [user, fetchTestbooks]);

  useEffect(() => {
    if (user?.uid) {
      fetchTestbooks(user.uid);
    }
  }, [user?.uid, fetchTestbooks]);

  useEffect(() => {
    // All testbooks come from Firebase (includes default + custom)
    setDisplayTestbooks(testbooks);
  }, [testbooks]);

  const handleCreate = async (title: string, description: string, modules: TestbookModule[], color: string) => {
    if (!user?.uid) {
      alert("Você precisa estar logado para criar um testbook");
      return;
    }

    setIsCreating(true);
    try {
      await createTestbook(
        title,
        description,
        modules,
        user.uid,
        user.displayName || "Usuário",
        color,
        "Book",
        true
      );
      setIsCreateModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (testbook: Testbook) => {
    alert(`Funcionalidade de download para ${testbook.title} em desenvolvimento. Em breve você poderá fazer download dos testbooks em PDF!`);
  };

  const handleShare = async (testbook: Testbook) => {
    setSelectedTestbookForShare(testbook);
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (emails: string[]) => {
    if (!selectedTestbookForShare || !user?.uid) return;
    
    setIsSharing(true);
    try {
      await shareTestbook(selectedTestbookForShare.id, emails, user.uid);
      setIsShareModalOpen(false);
      setSelectedTestbookForShare(null);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDuplicate = async (testbook: Testbook) => {
    if (!user?.uid) {
      alert("Você precisa estar logado");
      return;
    }
    await duplicateTestbook(testbook.id, user.uid, user.displayName || "Usuário");
  };

  const handleDelete = async (testbook: Testbook) => {
    if (!confirm(`Tem certeza que deseja deletar "${testbook.title}"?`)) return;
    if (user?.uid) {
      await deleteTestbook(testbook.id, user.uid);
    }
  };

  const handleTogglePublic = async (testbook: Testbook) => {
    if (user?.uid) {
      await togglePublic(testbook.id, user.uid);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] p-6 md:p-10 lg:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-color)] rounded-full blur-[150px] opacity-5 pointer-events-none" />

        <header className="mb-16 relative z-10">
          <div className="flex items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] w-fit shadow-sm backdrop-blur-md mb-6">
                <Book size={16} className="text-[var(--accent-color)]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  Manuais e Guias
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-4">
                Testbooks
              </h1>
              <p className="text-lg text-[var(--text-secondary)] opacity-80 max-w-2xl leading-relaxed">
                Acesse os cadernos de testes oficiais, guias de validação e procedimentos operacionais padronizados.
                {user?.uid && " Crie seus próprios testbooks customizados!"}
              </p>
            </div>
            {user?.uid && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 md:px-8 py-3 md:py-4 bg-[var(--accent-color)] text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap h-fit"
              >
                <Plus size={20} />
                <span className="hidden md:inline">Criar Novo</span>
              </motion.button>
            )}
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-[var(--accent-color)] animate-spin" />
          </div>
        )}

        {!loading && displayTestbooks.length === 0 && (
          <div className="text-center py-20">
            <Book size={48} className="text-[var(--text-secondary)] opacity-50 mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] text-lg">Nenhum testbook disponível</p>
          </div>
        )}

        {!loading && displayTestbooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <AnimatePresence mode="popLayout">
              {displayTestbooks.map((testbook) => (
                <TestbookCard
                  key={testbook.id}
                  testbook={testbook}
                  onEdit={() => navigate(`/testbook/${testbook.id}`)}
                  onDelete={() => handleDelete(testbook)}
                  onDownload={() => handleDownload(testbook)}
                  onShare={() => handleShare(testbook)}
                  onDuplicate={() => handleDuplicate(testbook)}
                  onTogglePublic={() => handleTogglePublic(testbook)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <TestbookCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
          isLoading={isCreating}
        />

        {selectedTestbookForShare && (
          <TestbookShareModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setSelectedTestbookForShare(null);
            }}
            testbookTitle={selectedTestbookForShare.title}
            testbookId={selectedTestbookForShare.id}
            onShare={handleShareSubmit}
            isLoading={isSharing}
          />
        )}
      </div>
    </PageTransition>
  );
}