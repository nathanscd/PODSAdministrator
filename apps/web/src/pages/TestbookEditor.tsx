import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, FileDown, Share2, Menu, X, Save, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useFavicon, useTitle } from '../hooks/useTitle';
import { useTestbook } from '../hooks/useTestbook';
import { useTestbookContent } from '../hooks/useTestbookContent';
import { AdminValidationModal } from '../components/Testbook/AdminValidationModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Testbook, TestbookModule, TestbookModuleContent } from '../types';

const MODULE_NAMES: { [key in TestbookModule]: string } = {
  intro: '1. Introdução',
  dispositivos: '2. Dispositivos',
  'corte-religue': '3. Corte/Religue',
  'leitura-demanda': '4. Leitura de Demanda',
  alarmes: '5. Alarmes',
  parametrizacao: '6. Parametrização',
  relatorios: '7. Relatórios',
  diagnosticos: '8. Diagnósticos',
};

const MODULE_DESCRIPTIONS: { [key in TestbookModule]: string } = {
  intro: 'Estrutura e conceitos básicos do testbook',
  dispositivos: 'Informações sobre componentes e equipamentos',
  'corte-religue': 'Procedimentos de corte e religação',
  'leitura-demanda': 'Como realizar leituras de demanda',
  alarmes: 'Configuração e gerenciamento de alarmes',
  parametrizacao: 'Configuração de parâmetros do sistema',
  relatorios: 'Geração e análise de relatórios',
  diagnosticos: 'Ferramentas e procedimentos de diagnóstico',
};

const DEFAULT_MODULE_CONTENTS: { [key in TestbookModule]: string } = {
  intro: `# 1. Introdução\n\n## 1.1 Estrutura do documento\nCada teste aqui apresentado possui: pré-condição (condições mínimas para o que teste ocorra), execução (etapas enumeradas para realização dos testes) e pós-condição (resultado esperado).\n\n## 1.2 Sobre os testes\nOs testes aqui descritos são feitos através da interface gráfica do MDC, conhecida como ORCA. Todos os testes também pressupõem a existência de:\n- Um AP;\n- Um medidor/controlador devidamente associado a esse AP;\n- Ambos os equipamentos devem estar ligados e disponíveis na rede (exceto em casos onde o teste diga o contrário);\n- (Opcional) Um testador com certificação válida NR-10;\n- (Opcional) Para realizar testes de alarmes, o equipamento de teste deve estar previamente configurado com essa funcionalidade.`,
  
  dispositivos: `# 2. Dispositivos\n\n## 2.1 Posição dos MMs / Gerenciamento de Rede\nNeste capítulo é demonstrado como identificar a posição dos medidores dentro da caixa e o monitoramento da qualidade de comunicação.\n\n## 2.2 Execução de Monitoramento:\n1. No menu lateral acesse: Assets > Registration > Terminals;\n2. Clique no botão de visualização da caixa;\n3. Uma tela com a lista dos medidores e a sua posição dentro da caixa será exibida na tela.\n\n## 2.3 Medição de Qualidade (RSSI e LQI):\n- RSSI: Medição da potência presente em um sinal de rádio recebido. Dispositivos acima de -90dBm são satisfatórios.\n- LQI: Qualidade dos pacotes de dados recebidos. Dispositivos com indicador acima de 85 são satisfatórios.`,
  
  'corte-religue': `# 3. Corte e Religue\n\nAqui é apresentada a funcionalidade de abertura e fechamento de relé (corte e religa).\n\n## 3.1 Corte (Abertura de Relé)\n- Pré-condição: Ao menos um dos medidores deve estar com o relé fechado (Connected).\n- Execução:\n  1. Abrir o ORCA;\n  2. No menu lateral, acesse: Operational Commands > Disconnect/Connect;\n  3. Selecione o medidor e envie o comando de desconexão.\n- Pós-condição: Em caso de sucesso, o status mudará para Disconnected.\n\n## 3.2 Religa (Fechamento de Relé)\n- Pré-condição: Ao menos um dos medidores deve estar com o relé aberto (Disconnected).\n- Execução:\n  1. Abrir o ORCA;\n  2. No menu lateral, acesse: Operational Commands > Disconnect/Connect;\n  3. Selecione o protocolo e envie o comando de conexão.\n- Pós-condição: Em caso de sucesso, o status mudará para Connected.`,
  
  'leitura-demanda': `# 4. Leitura sob Demanda\n\n- Pré-condição: Medidor online e devidamente registrado no MDC.\n- Execução:\n  1. Navegue até: Operational Commands > On Demand Reading;\n  2. Selecione o Node apropriado na árvore de ativos;\n  3. Escolha o Protocol Type;\n  4. Insira o Meter No.;\n  5. Selecione os parâmetros que deseja ler (Energia, Tensão, Corrente, etc);\n  6. Clique em Read ou On Demand Reading.\n- Pós-condição: O resultado da leitura sob demanda será exibido em tempo real com os valores lidos com sucesso.`,
  
  alarmes: `# 5. Alarmes e Eventos\n\nProcedimentos para validação e consulta de eventos e alarmes reportados pelo equipamento ao sistema.\n\n- Execução:\n  1. Acesse o menu de Alarmes/Eventos no ORCA;\n  2. Filtre pelo Terminal/Medidor específico;\n  3. Provoque o alarme fisicamente (ex: tampa aberta, se aplicável e seguro) ou simule via comando;\n  4. Verifique o recebimento do pacote de alarme no sistema com o Timestamp correto.\n- Pós-condição: O alarme provocado deve constar na tabela de alarmes ativos com o status correto.`,
  
  parametrizacao: `# 6. Parametrização do Sistema\n\nFluxos de leitura da parametrização atual e envio de nova configuração.\n\n## 6.1 Leitura de Parâmetros\n- Permite ler os parâmetros atuais gravados no Terminal/Medidor.\n\n## 6.2 Envio de Configuração\n- Execução:\n  1. No menu lateral acesse: Configuration > Parameters Configuration > Terminal/Meter Parameters;\n  2. Selecione o protocolo correspondente;\n  3. Selecione o equipamento de teste na lista;\n  4. Selecione a categoria da parametrização e configure as opções à direita;\n  5. Envie o comando.\n- Pós-condição: Uma tela mostrando o sucesso da operação será exibida e gravada.`,
  
  relatorios: `# 7. Relatórios e Análises\n\nProcedimentos para consulta e extração de relatórios do ambiente MDC/LESS.\n\n- Pré-condição: Ao menos um medidor cadastrado, com task de push de dados configurada e comunicando.\n- Execução:\n  1. No menu lateral acesse: Reports > Readings;\n  2. Selecione o período da consulta (Time/Date);\n  3. Selecione o nó que será consultado (Node);\n  4. Selecione o tipo de leitura (ex: Energy, Billing, Load Profile);\n  5. Clique em pesquisar/exportar.\n- Pós-condição: Os dados do relatório devem ser gerados em tabela com a opção de exportação em CSV ou Excel.`,
  
  diagnosticos: `# 8. Ferramentas de Diagnóstico\n\nFerramentas e procedimentos úteis para reunir informações e realizar testes individuais de conectividade dos dispositivos de rede.\n\n## 8.1 Operação de Diagnóstico (Ping)\n- Execução:\n  1. Acesse: Network Management > Device Manage;\n  2. Clique no botão de Diagnóstico (Ping) na coluna Action do dispositivo específico;\n  3. Verifique a taxa de perda de pacotes.\n- Pós-condição: O diagnóstico ideal deve resultar em 0% de perda de pacotes (Packet Loss).\n\n## 8.2 Análise Estática de Rede\n- Exibição de informações geográficas, alarmes ativos, nós filhos e medições históricas de qualidade para diagnóstico rápido de problemas em campo.`
};

export default function TestbookEditor() {
  const { testbookId } = useParams<{ testbookId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { testbooks } = useTestbook();
  const { content, fetchTestbookContent, getModuleContent, updateModuleContent, updateGlobalModule } = useTestbookContent();

  const [testbook, setTestbook] = useState<Testbook | null>(null);
  const [activeModule, setActiveModule] = useState<TestbookModule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminValidationOpen, setIsAdminValidationOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ description: string; content: Partial<TestbookModuleContent>; isGlobal: boolean } | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTestbook = async () => {
      if (!testbookId) return;
      setIsLoading(true);
      try {
        // Try to find in already-loaded testbooks list (fast path)
        let foundTestbook: Testbook | undefined = testbooks.find((t) => t.id === testbookId);
        
        if (!foundTestbook) {
          // Direct Firestore fetch fallback
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          const docRef = doc(db, 'testbooks', testbookId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            foundTestbook = {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as Testbook;
          }
        }

        if (!foundTestbook) {
          // Default system testbooks (not stored in Firestore)
          const defaultBooks: Testbook[] = [
            {
              id: "pantheon-ng",
              title: "Pantheon V4 Testbook",
              version: "v1.0.0",
              description: "Caderno de testes completo para o sistema Pantheon NG V4. Inclui operações de corte, religue e parametrização.",
              color: "text-amber-500",
              icon: "Zap",
              isCustom: false,
              ownerId: "system",
              ownerName: "Sistema",
              createdAt: new Date(),
              updatedAt: new Date(),
              isPublic: true,
              sharedWith: [],
              modules: ["intro", "dispositivos", "corte-religue", "leitura-demanda"] as TestbookModule[],
            },
            {
              id: "streetlight",
              title: "Streetlight Testbook",
              version: "v1.0.0",
              description: "Caderno de testes completo para o sistema Streetlight. Inclui operações de corte, religue e parametrização.",
              color: "text-amber-500",
              icon: "Zap",
              isCustom: false,
              ownerId: "system",
              ownerName: "Sistema",
              createdAt: new Date(),
              updatedAt: new Date(),
              isPublic: true,
              sharedWith: [],
              modules: ["intro", "dispositivos", "corte-religue", "alarmes", "relatorios"] as TestbookModule[],
            },
            {
              id: "zeus",
              title: "Zeus Testbook",
              version: "v1.0.0",
              description: "Caderno de testes completo para o sistema Zeus. Inclui operações de corte, religue e parametrização.",
              color: "text-amber-500",
              icon: "Zap",
              isCustom: false,
              ownerId: "system",
              ownerName: "Sistema",
              createdAt: new Date(),
              updatedAt: new Date(),
              isPublic: true,
              sharedWith: [],
              modules: ["intro", "dispositivos", "corte-religue", "parametrizacao", "diagnosticos"] as TestbookModule[],
            },
          ];
          foundTestbook = defaultBooks.find(b => b.id === testbookId);
        }

        setTestbook(foundTestbook || null);
        if (foundTestbook && foundTestbook.modules.length > 0) {
          setActiveModule(foundTestbook.modules[0]);
          await fetchTestbookContent(testbookId);
        }
      } catch (err) {
        console.error("Erro ao carregar testbook:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestbook();
  }, [testbookId, testbooks, fetchTestbookContent]);

  useTitle(testbook?.title || 'Testbook');
  useFavicon('/testbooks/Testbook.png');

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[var(--accent-color)] rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!testbook) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-[var(--text-secondary)] opacity-50 mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] text-lg mb-4">Testbook não encontrado</p>
            <button
              onClick={() => navigate('/testbooks')}
              className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90"
            >
              Voltar para Testbooks
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const canEdit = !!user && (testbook.ownerId === 'system' || user?.uid === testbook.ownerId || isAdmin);
  const currentModuleContent = activeModule ? getModuleContent(activeModule) : null;
  const colorMap = {
    'text-amber-500': { text: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    'text-blue-500': { text: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    'text-emerald-500': { text: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    'text-purple-500': { text: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    'text-pink-500': { text: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    'text-orange-500': { text: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  };
  const colors = colorMap[testbook.color as keyof typeof colorMap] || colorMap['text-blue-500'];

  const handleSaveModuleContent = async (isGlobalChange: boolean) => {
    if (!activeModule || !user) return;

    setIsSaving(true);
    try {
      const updates: Partial<TestbookModuleContent> = {
        title: MODULE_NAMES[activeModule],
        description: MODULE_DESCRIPTIONS[activeModule],
        content: editedContent,
      };

      if (isGlobalChange && !isAdmin) {
        // Non-admin users need validation for global changes
        setPendingChanges({
          description: 'Alteração de conteúdo global do módulo',
          content: updates,
          isGlobal: true,
        });
        setIsAdminValidationOpen(true);
      } else {
        // Admin or testbook-only change
        const success = isGlobalChange && isAdmin 
          ? await updateGlobalModule(activeModule, updates, user.uid, user.displayName || 'Usuário')
          : await updateModuleContent(testbook.id, activeModule, updates, user.uid, user.displayName || 'Usuário');

        if (success) {
          setIsEditing(false);
          await fetchTestbookContent(testbook.id);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminValidationApprove = async () => {
    if (!pendingChanges || !activeModule || !user) return;

    try {
      const success = await updateGlobalModule(
        activeModule,
        pendingChanges.content,
        user.uid,
        user.displayName || 'Usuário'
      );

      if (success) {
        setIsEditing(false);
        await fetchTestbookContent(testbook.id);
      }
    } finally {
      setPendingChanges(null);
      setIsAdminValidationOpen(false);
    }
  };

  const handleAdminValidationTestbookOnly = async () => {
    if (!pendingChanges || !activeModule || !user) return;

    try {
      const success = await updateModuleContent(
        testbook.id,
        activeModule,
        pendingChanges.content,
        user.uid,
        user.displayName || 'Usuário'
      );

      if (success) {
        setIsEditing(false);
        await fetchTestbookContent(testbook.id);
      }
    } finally {
      setPendingChanges(null);
      setIsAdminValidationOpen(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/testbooks')}
                className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl font-black text-[var(--text-primary)] truncate">
                  {testbook.title}
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {testbook.modules.length} módulos • {testbook.isCustom ? 'Customizado' : 'Padrão'}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {canEdit && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContent(currentModuleContent?.content || (activeModule ? DEFAULT_MODULE_CONTENTS[activeModule] : ''));
                        }}
                        className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold hover:bg-[var(--bg-app)] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveModuleContent(false)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save size={16} />
                        Salvar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedContent(currentModuleContent?.content || (activeModule ? DEFAULT_MODULE_CONTENTS[activeModule] : ''));
                      }}
                      className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                  )}
                </>
              )}
              <button className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                <FileDown size={20} className="text-[var(--text-secondary)]" />
              </button>
              <button className="p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                <Share2 size={20} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-[var(--text-secondary)]" />
              ) : (
                <Menu size={20} className="text-[var(--text-secondary)]" />
              )}
            </button>
          </div>

          {/* Mobile Menu Content */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-app)] px-6 py-3 space-y-2"
              >
                {canEdit && (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold hover:bg-[var(--card-bg)]"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            handleSaveModuleContent(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          Salvar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Module List */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-2">
                {testbook.modules.map((moduleId) => (
                  <button
                    key={moduleId}
                    onClick={() => {
                      setActiveModule(moduleId);
                      setIsEditing(false);
                      setEditedContent('');
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                      activeModule === moduleId
                        ? `${colors.bg} ${colors.border} border-2 text-[var(--text-primary)] font-bold`
                        : 'bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/50'
                    }`}
                  >
                    {MODULE_NAMES[moduleId]}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeModule && (
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8"
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                          Conteúdo
                        </label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-color)] focus:outline-none transition-colors resize-none"
                          rows={12}
                          placeholder="Digite o conteúdo do módulo aqui..."
                        />
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleSaveModuleContent(false)}
                          disabled={isSaving}
                          className="w-full px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Salvando neste testbook...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Salvar Apenas Neste Testbook
                            </>
                          )}
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => {
                              setPendingChanges({
                                description: 'Alteração de conteúdo global do módulo',
                                content: { content: editedContent },
                                isGlobal: true,
                              });
                              setIsAdminValidationOpen(true);
                            }}
                            disabled={isSaving}
                            className="w-full px-6 py-3 border-2 border-purple-500 text-purple-500 rounded-lg font-bold hover:bg-purple-500/5 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Lock size={16} />
                            Solicitar Atualização Global
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleSaveModuleContent(true)}
                            disabled={isSaving}
                            className="w-full px-6 py-3 border-2 border-emerald-500 text-emerald-500 rounded-lg font-bold hover:bg-emerald-500/5 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            Salvar em Todos os Testbooks (Admin)
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-black text-[var(--text-primary)]">
                        {MODULE_NAMES[activeModule]}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {MODULE_DESCRIPTIONS[activeModule]}
                      </p>

                      {(currentModuleContent && currentModuleContent.content) || (activeModule && DEFAULT_MODULE_CONTENTS[activeModule]) ? (
                        <div className="mt-6 p-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg whitespace-pre-wrap text-[var(--text-secondary)]">
                          {currentModuleContent?.content || (activeModule ? DEFAULT_MODULE_CONTENTS[activeModule] : '')}
                        </div>
                      ) : (
                        <div className="mt-6 p-8 bg-[var(--bg-app)] border-2 border-dashed border-[var(--border-color)] rounded-lg text-center">
                          <p className="text-[var(--text-secondary)]">
                            Nenhum conteúdo adicionado ainda.
                            {canEdit && ' Clique em "Editar" para adicionar.'}
                          </p>
                        </div>
                      )}

                      {currentModuleContent && (
                        <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-1 pt-4 border-t border-[var(--border-color)]">
                          <p>
                            <strong>Última atualização:</strong> {new Date(currentModuleContent.updatedAt).toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p>
                            <strong>Por:</strong> {currentModuleContent.updatedByName}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Validation Modal */}
        <AdminValidationModal
          isOpen={isAdminValidationOpen}
          onClose={() => {
            setIsAdminValidationOpen(false);
            setPendingChanges(null);
          }}
          onApprove={handleAdminValidationApprove}
          onTestbookOnly={handleAdminValidationTestbookOnly}
          isLoading={isSaving}
          changeDescription={pendingChanges?.description || ''}
          moduleName={activeModule ? MODULE_NAMES[activeModule] : ''}
        />
      </div>
    </PageTransition>
  );
}
