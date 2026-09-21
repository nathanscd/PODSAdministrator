import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Book } from 'lucide-react';
import { TestbookModule } from '../../types';

interface TestbookCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, modules: TestbookModule[], color: string) => Promise<void>;
  isLoading?: boolean;
}

const AVAILABLE_MODULES: { id: TestbookModule; title: string; description: string }[] = [
  { id: 'intro', title: 'Introdução', description: 'Estrutura e conceitos básicos do testbook' },
  { id: 'dispositivos', title: 'Dispositivos', description: 'Informações sobre componentes e equipamentos' },
  { id: 'corte-religue', title: 'Corte/Religue', description: 'Procedimentos de corte e religação' },
  { id: 'leitura-demanda', title: 'Leitura de Demanda', description: 'Como realizar leituras de demanda' },
  { id: 'alarmes', title: 'Alarmes', description: 'Configuração e gerenciamento de alarmes' },
  { id: 'parametrizacao', title: 'Parametrização', description: 'Configuração de parâmetros do sistema' },
  { id: 'relatorios', title: 'Relatórios', description: 'Geração e análise de relatórios' },
  { id: 'diagnosticos', title: 'Diagnósticos', description: 'Ferramentas e procedimentos de diagnóstico' },
];

const COLORS = [
  { name: 'Azul', value: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'Âmbar', value: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { name: 'Esmeralda', value: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { name: 'Roxo', value: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { name: 'Rosa', value: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { name: 'Laranja', value: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
];

export function TestbookCreateModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: TestbookCreateModalProps) {
  const [step, setStep] = useState<'name' | 'modules' | 'color'>('name');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<TestbookModule[]>([]);
  const [selectedColor, setSelectedColor] = useState('text-blue-500');

  const handleModuleToggle = (moduleId: TestbookModule) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Por favor, insira um nome para o testbook');
      return;
    }
    if (selectedModules.length === 0) {
      alert('Por favor, selecione pelo menos um módulo');
      return;
    }
    await onCreate(title, description, selectedModules, selectedColor);
    handleReset();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSelectedModules([]);
    setSelectedColor('text-blue-500');
    setStep('name');
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
            className="bg-[var(--card-bg)] rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-[var(--border-color)]"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 md:p-8 border-b border-[var(--border-color)] bg-[var(--card-bg)]/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/10 flex items-center justify-center">
                  <Book size={20} className="text-[var(--accent-color)]" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
                    Criar Novo Testbook
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Etapa {step === 'name' ? '1' : step === 'modules' ? '2' : '3'} de 3
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors"
              >
                <X size={20} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              {step === 'name' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                      Nome do Testbook *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Meu Testbook Customizado"
                      className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-color)] focus:outline-none transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o propósito ou conteúdo do seu testbook"
                      rows={4}
                      className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-color)] focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {step === 'modules' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Selecione os módulos que deseja incluir no seu testbook:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_MODULES.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleToggle(module.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedModules.includes(module.id)
                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                            : 'border-[var(--border-color)] bg-[var(--bg-app)] hover:border-[var(--accent-color)]/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              selectedModules.includes(module.id)
                                ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                                : 'border-[var(--border-color)]'
                            }`}
                          >
                            {selectedModules.includes(module.id) && (
                              <CheckCircle2 size={14} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[var(--text-primary)]">
                              {module.title}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-4 pt-4 border-t border-[var(--border-color)]">
                    Módulos selecionados: {selectedModules.length}
                  </p>
                </motion.div>
              )}

              {step === 'color' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Escolha uma cor para seu testbook:
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedColor === color.value
                            ? `${color.bg} ${color.border} border-2`
                            : 'border-[var(--border-color)] bg-[var(--bg-app)] hover:border-[var(--border-color)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${color.bg} border-2 ${color.border} flex items-center justify-center`}>
                          <div className={`w-3 h-3 rounded-full ${color.value.replace('text-', 'bg-')}`} />
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mt-2 text-center">
                          {color.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 md:p-8 border-t border-[var(--border-color)] bg-[var(--card-bg)]/95 backdrop-blur-sm">
              <button
                onClick={() => {
                  if (step === 'name') {
                    handleReset();
                  } else if (step === 'modules') {
                    setStep('name');
                  } else {
                    setStep('modules');
                  }
                }}
                className="flex-1 px-6 py-3 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold hover:bg-[var(--bg-app)] transition-colors"
              >
                {step === 'name' ? 'Cancelar' : 'Voltar'}
              </button>

              <button
                onClick={() => {
                  if (step === 'name' && title.trim()) {
                    setStep('modules');
                  } else if (step === 'modules' && selectedModules.length > 0) {
                    setStep('color');
                  } else if (step === 'color') {
                    handleCreate();
                  }
                }}
                disabled={
                  (step === 'name' && !title.trim()) ||
                  (step === 'modules' && selectedModules.length === 0) ||
                  isLoading
                }
                className="flex-1 px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando...
                  </>
                ) : step === 'color' ? (
                  'Criar Testbook'
                ) : (
                  'Próximo'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
