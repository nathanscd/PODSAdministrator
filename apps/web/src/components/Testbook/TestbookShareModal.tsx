import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Mail } from 'lucide-react';

interface TestbookShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  testbookTitle: string;
  testbookId: string;
  onShare: (emails: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function TestbookShareModal({
  isOpen,
  onClose,
  testbookTitle,
  testbookId,
  onShare,
  isLoading = false,
}: TestbookShareModalProps) {
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');
  const [emails, setEmails] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Create a shareable link
  const shareLink = `${window.location.origin}/testbooks/shared/${testbookId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (shareMethod === 'email') {
      const emailList = emails
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e && e.includes('@'));

      if (emailList.length === 0) {
        alert('Por favor, insira pelo menos um email válido');
        return;
      }

      await onShare(emailList);
      setEmails('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--card-bg)] rounded-[2rem] shadow-2xl max-w-md w-full border border-[var(--border-color)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)]">
                  Compartilhar Testbook
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{testbookTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Method selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShareMethod('link')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                    shareMethod === 'link'
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-app)] text-[var(--text-primary)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  Compartilhar Link
                </button>
                <button
                  onClick={() => setShareMethod('email')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                    shareMethod === 'email'
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-app)] text-[var(--text-primary)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  Enviar Email
                </button>
              </div>

              {/* Link sharing */}
              {shareMethod === 'link' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-[var(--text-secondary)]">
                    Compartilhe este link com outras pessoas para que acessem seu testbook:
                  </p>
                  <div className="flex gap-2 p-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-transparent text-[var(--text-primary)] text-sm outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 hover:bg-[var(--card-bg)] rounded transition-colors"
                    >
                      {copied ? (
                        <Check size={18} className="text-emerald-500" />
                      ) : (
                        <Copy size={18} className="text-[var(--text-secondary)]" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Email sharing */}
              {shareMethod === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-[var(--text-secondary)]">
                    Digite os emails (separados por vírgula) que deseja convidar:
                  </p>
                  <textarea
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-color)] focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-[var(--border-color)]">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold hover:bg-[var(--bg-app)] transition-colors"
              >
                Cancelar
              </button>
              {shareMethod === 'email' && (
                <button
                  onClick={handleShare}
                  disabled={isLoading || !emails.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Compartilhar
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
