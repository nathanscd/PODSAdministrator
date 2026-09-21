import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';

interface AdminValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void> | void;
  onTestbookOnly: () => Promise<void> | void;
  isLoading?: boolean;
  changeDescription: string;
  moduleName: string;
}

export function AdminValidationModal({
  isOpen,
  onClose,
  onApprove,
  onTestbookOnly,
  isLoading = false,
  changeDescription,
  moduleName,
}: AdminValidationModalProps) {
  const [selectedOption, setSelectedOption] = useState<'testbook' | 'global' | null>(null);

  const handleSubmit = async () => {
    if (selectedOption === 'testbook') {
      await onTestbookOnly();
    } else if (selectedOption === 'global') {
      await onApprove();
    }
    handleReset();
  };

  const handleReset = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleReset}
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">
                    Salvar Alterações
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">{moduleName}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
              >
                <X size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Você deseja salvar as alterações:
              </p>

              <p className="text-sm p-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]">
                <strong>Mudança:</strong> {changeDescription}
              </p>

              <div className="space-y-3">
                {/* Testbook Only Option */}
                <button
                  onClick={() => setSelectedOption('testbook')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedOption === 'testbook'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-app)] hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        selectedOption === 'testbook'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      {selectedOption === 'testbook' && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)]">
                        Apenas Neste Testbook
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        As alterações serão salvas apenas neste testbook
                      </p>
                    </div>
                  </div>
                </button>

                {/* Global Option */}
                <button
                  onClick={() => setSelectedOption('global')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedOption === 'global'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-app)] hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        selectedOption === 'global'
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      {selectedOption === 'global' && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          Em Todos os Testbooks
                        </p>
                        <Lock size={14} className="text-purple-500" />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Requer validação de administrador
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] italic p-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg">
                💡 <strong>Dica:</strong> Se você é administrador, sua alteração será validada automaticamente.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-[var(--border-color)]">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold hover:bg-[var(--bg-app)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedOption}
                className="flex-1 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
