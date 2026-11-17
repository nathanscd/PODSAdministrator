import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Palette,
  Globe,
  Shield,
  Bell,
  Save,
  LogOut,
  Camera,
  Briefcase,
  FileText,
  Sparkles,
  Check,
  Lock,
  Cpu,
  Database,
  Zap,
  ShieldCheck,
  Search,
  Building,
  Users,
  CreditCard,
  Key,
  Info,
  Laptop,
  Paintbrush,
  Settings,
  Sliders,
  Box,
  Fingerprint,
  Activity,
  LifeBuoy
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const THEMES = [
  { id: "orange", name: "Laranja", color: "#ff6a00" },
  { id: "rosa", name: "Rosa", color: "#ff0080" },
  { id: "roxo", name: "Roxo", color: "#8a2be2" },
  { id: "vermelho", name: "Vermelho", color: "#dc2626" },
  { id: "azul", name: "Azul", color: "#2651dc" },
];

const SIDEBAR_CATEGORIES = [
  {
    title: "Account",
    items: [
      { id: "profile", name: "Perfil", icon: <User size={16} /> },
      { id: "preferences", name: "Preferências Pessoais", icon: <Sliders size={16} /> },
      { id: "appearance", name: "Aparência", icon: <Paintbrush size={16} /> },
      { id: "privacy", name: "Privacidade", icon: <Fingerprint size={16} /> },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "ws-general", name: "Geral", icon: <Settings size={16} /> },
      { id: "ws-members", name: "Membros", icon: <Users size={16} /> },
      { id: "ws-roles", name: "Cargos e Permissões", icon: <ShieldCheck size={16} /> },
    ],
  },
  {
    title: "Product",
    items: [
      { id: "notifications", name: "Notificações", icon: <Bell size={16} /> },
      { id: "integrations", name: "Integrações", icon: <Box size={16} /> },
      { id: "widgets", name: "Widgets e Dashboard", icon: <Laptop size={16} /> },
    ],
  },
  {
    title: "Security",
    items: [
      { id: "security", name: "Autenticação", icon: <Key size={16} /> },
      { id: "sessions", name: "Sessões e Dispositivos", icon: <Cpu size={16} /> },
      { id: "audit", name: "Logs de Auditoria", icon: <Activity size={16} /> },
    ],
  },
  {
    title: "About",
    items: [
      { id: "about", name: "Sobre o aplicativo", icon: <Info size={16} /> },
      { id: "support", name: "Suporte", icon: <LifeBuoy size={16} /> },
    ],
  },
];

export const SettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full h-full bg-background overflow-hidden" data-lenis-prevent>{children}</div>
);

export const SettingsSidebar = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[280px] flex-shrink-0 border-r border-border/50 bg-muted/20 flex flex-col h-full overflow-scroll">
    {children}
  </div>
);

export const SettingsMainContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 flex flex-col h-full overflow-scroll bg-background relative">
    {children}
  </div>
);

export const SettingsRightPanel = () => (
  <div className="w-[260px] scroll flex-shrink-0 border-l border-border/50 bg-muted/10 xl:flex flex-col p-6 h-full" lenis-data-prevent>
    <div className="sticky top-0 space-y-6 scroll">
      <div className="space-y-2 scroll">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          Dicas de Configuração
        </h4>
      </div>
      <Separator className="bg-border/50" />
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Links Úteis
        </h4>
        <div className="flex flex-col gap-2">
          <a href="/testbooks" className="text-xs text-foreground hover:text-primary transition-colors cursor-pointer">
            Documentação do aplicativo
          </a>
          <a className="text-xs text-foreground hover:text-primary transition-colors cursor-pointer">
            Política de Privacidade
          </a>
        </div>
      </div>
    </div>
  </div>
);

export const SettingsSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {children}
  </section>
);

export const SettingsGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col border border-border/60 bg-card rounded-xl shadow-sm divide-y divide-border/50 overflow-hidden">
    {children}
  </div>
);

export const ControlledByOrganization = ({ scope }: { scope: "organization" | "workspace" | "system" }) => (
  <div className="flex items-center gap-1.5 mt-1.5">
    <Shield size={12} className="text-amber-500" />
    <span className="text-[11px] text-muted-foreground font-medium">
      {scope === "organization" && "Controlado pela organização"}
      {scope === "workspace" && "Controlado pelo workspace"}
      {scope === "system" && "Definido pelo sistema"}
    </span>
  </div>
);

export const SettingsRow = ({
  title,
  description,
  control,
  badge,
  locked = false,
  lockScope,
  warning
}: {
  title: string;
  description?: string;
  control?: React.ReactNode;
  badge?: { text: string; variant?: "default" | "secondary" | "destructive" | "outline" };
  locked?: boolean;
  lockScope?: "organization" | "workspace" | "system";
  warning?: string;
}) => (
  <div className={`flex items-start sm:items-center justify-between p-4 gap-4 transition-colors ${locked ? 'bg-muted/5' : 'hover:bg-muted/30'}`}>
    <div className="flex flex-col gap-1.5 max-w-[70%]">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>{title}</span>
        {badge && <Badge variant={badge.variant || "secondary"} className="text-[10px] uppercase tracking-wider px-1.5 py-0 h-4">{badge.text}</Badge>}
        {locked && <Lock size={12} className="text-muted-foreground/70" />}
      </div>
      {description && <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>}
      {warning && <span className="text-xs text-destructive font-medium mt-0.5">{warning}</span>}
      {locked && lockScope && <ControlledByOrganization scope={lockScope} />}
    </div>
    <div className={`flex items-center gap-3 shrink-0 ${locked ? 'opacity-60 pointer-events-none' : ''}`}>
      {control}
    </div>
  </div>
);

export const SettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return SIDEBAR_CATEGORIES;
    const query = searchQuery.toLowerCase();
    return SIDEBAR_CATEGORIES.map(category => ({
      ...category,
      items: category.items.filter(item => item.name.toLowerCase().includes(query))
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-[1200px] h-[85vh] max-h-[800px] rounded-2xl shadow-2xl border border-border/60 overflow-hidden bg-background">
              <SettingsLayout>
                <SettingsSidebar>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-1">
                        <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                          <Settings size={14} />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">Settings</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full md:hidden" onClick={onClose}>
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="relative group w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Buscar configurações..."
                        className="w-full h-9 pl-9 pr-9 text-xs font-medium bg-background border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer hover:bg-muted rounded-full transition-colors"
                        >
                          <X size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  <ScrollArea className="flex-1 px-3 pb-4">
                    <div className="space-y-6">
                      {filteredCategories.map((category, idx) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {category.title}
                          </h4>
                          <div className="space-y-0.5">
                            {category.items.map((item) => {
                              const isActive = activeTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setActiveTab(item.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                                    isActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                  }`}
                                >
                                  <div className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                    {item.icon}
                                  </div>
                                  <span className="truncate">{item.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="text-center py-8 px-4">
                          <Search size={24} className="mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">Nenhuma configuração encontrada para "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </SettingsSidebar>

                <SettingsMainContent>
                  <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                    <h2 className="text-sm font-semibold text-foreground">
                      {SIDEBAR_CATEGORIES.flatMap(c => c.items).find(i => i.id === activeTab)?.name || "Configurações"}
                    </h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hidden md:flex" onClick={onClose}>
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-6 md:p-10 max-w-4xl mx-auto">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {activeTab === "profile" && <ProfileSection />}
                          {activeTab === "preferences" && <PreferencesSection />}
                          {activeTab === "appearance" && <AppearanceSection />}
                          {activeTab === "security" && <SecuritySection />}
                          {activeTab === "notifications" && <NotificationsSection />}
                          {activeTab === "privacy" && <PlaceholderSection title="Privacidade" />}
                          {activeTab.startsWith("ws-") && <PlaceholderSection title="Configurações do Workspace" scope="workspace" />}
                          {activeTab.startsWith("company-") && <PlaceholderSection title="Configurações da Empresa" scope="organization" />}
                          {activeTab === "integrations" && <PlaceholderSection title="Integrações" />}
                          {activeTab === "widgets" && <PlaceholderSection title="Widgets e Dashboard" />}
                          {activeTab === "sessions" && <PlaceholderSection title="Sessões Ativas" />}
                          {activeTab === "audit" && <PlaceholderSection title="Logs de Auditoria" scope="organization" />}
                          {activeTab === "billing" && <PlaceholderSection title="Faturamento e Planos" scope="organization" />}
                          {activeTab === "api" && <PlaceholderSection title="API e Webhooks" scope="organization" />}
                          {activeTab === "support" && <PlaceholderSection title="Suporte" />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </SettingsMainContent>

                <SettingsRightPanel />
              </SettingsLayout>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const PlaceholderSection = ({ title, scope }: { title: string, scope?: "organization" | "workspace" }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 border border-border/50">
      <Box size={24} className="text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
      Este módulo está em desenvolvimento e será disponibilizado em atualizações futuras do aplicativo.
    </p>
    {scope && (
      <Badge variant="outline" className="text-xs font-normal">
        Nível de acesso: {scope === "organization" ? "Administrador da Organização" : "Administrador do Workspace"}
      </Badge>
    )}
  </div>
);

const ProfileSection = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [role, setRole] = useState(user?.role || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setRole(user.role || "");
      setBio(user.bio || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setPhotoURL(canvas.toDataURL("image/webp", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10">
      <SettingsSection title="Perfil Público" description="Gerencie suas informações públicas e de identificação dentro da plataforma.">
        <div className="flex items-start gap-8 mb-8">
          <div
            className="relative group cursor-pointer shrink-0 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden rounded-full"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <div className="h-24 w-24 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden relative">
              {photoURL ? (
                <img src={photoURL} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {name.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-foreground" size={20} />
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Nome Completo</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Cargo ou Título</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} className="max-w-md" />
            </div>
          </div>
        </div>

        <SettingsGroup>
          <SettingsRow
            title="Email da Conta"
            description="Email utilizado para login e notificações. Controlado pela organização."
            locked
            lockScope="organization"
            control={<span className="text-sm font-medium text-muted-foreground">{user?.email || "usuario@empresa.com"}</span>}
          />
          <SettingsRow
            title="Biografia"
            description="Uma breve descrição sobre você que aparecerá no seu perfil."
            control={
              <textarea
                className="w-full max-w-xs min-h-[80px] text-sm flex min-w-[250px] rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escreva algo sobre você..."
              />
            }
          />
        </SettingsGroup>
      </SettingsSection>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button variant="outline">Cancelar</Button>
        <Button disabled={isSaving} className="gap-2">
          <Save size={14} /> {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
};

const PreferencesSection = () => (
  <div className="space-y-10">
    <SettingsSection title="Preferências Regionais" description="Configure seu idioma, fuso horário e formatos de data.">
      <SettingsGroup>
        <SettingsRow
          title="Idioma do Sistema"
          description="Selecione o idioma principal da interface."
          control={<LanguageSwitcher />}
        />
        <SettingsRow
          title="Fuso Horário"
          description="Usado para calcular datas de entrega e automações."
          control={<span className="text-sm font-medium text-foreground px-3 py-1.5 bg-muted rounded-md border border-border/50">America/Sao_Paulo (GMT-3)</span>}
        />
        <SettingsRow
          title="Formato de Data e Hora"
          description="Controlado pelas diretrizes do workspace atual."
          locked
          lockScope="workspace"
          control={<span className="text-sm text-muted-foreground">DD/MM/YYYY 24h</span>}
        />
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection title="Acessibilidade e Comportamento" description="Ajuste como a interface se comporta para melhor atender às suas necessidades.">
      <SettingsGroup>
        <SettingsRow
          title="Reduzir Animações"
          description="Desativa animações de transição e efeitos visuais pesados."
          control={<Switch />}
        />
        <SettingsRow
          title="Modo Compacto"
          description="Reduz o espaçamento entre elementos em listas e tabelas."
          control={<Switch />}
        />
      </SettingsGroup>
    </SettingsSection>
  </div>
);

const AppearanceSection = () => {
  const { user, changeTheme } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [selectedColor, setSelectedColor] = useState("orange");

  useEffect(() => {
    if (user) {
      const themeStr = user.theme || "light-orange";
      setIsDark(themeStr.startsWith("dark"));
      setSelectedColor(themeStr.split("-")[1] || "orange");
    }
  }, [user]);

  const handleThemeChange = (mode: "light" | "dark", color: string) => {
    const newTheme = `${mode}-${color}` as any;
    changeTheme(newTheme);
    setIsDark(mode === "dark");
    setSelectedColor(color);
  };

  return (
    <div className="space-y-10" data-lenis-prevent>
      <SettingsSection title="Tema da Interface" description="Personalize a aparência geral do aplicativo no seu dispositivo.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => handleThemeChange("light", selectedColor)}
            className={`cursor-pointer rounded-xl border-2 p-1 transition-all ${!isDark ? 'border-primary' : 'border-transparent hover:border-border'}`}
          >
            <div className="bg-[#f4f4f5] rounded-lg p-4 h-32 flex flex-col gap-2 border border-border">
              <div className="h-4 w-1/3 bg-white rounded shadow-sm"></div>
              <div className="h-2 w-1/2 bg-white rounded shadow-sm opacity-60"></div>
              <div className="mt-auto h-10 w-full bg-white rounded shadow-sm"></div>
            </div>
            <p className="text-center text-sm font-medium mt-3 text-foreground">Light</p>
          </div>
          <div
            onClick={() => handleThemeChange("dark", selectedColor)}
            className={`cursor-pointer rounded-xl border-2 p-1 transition-all ${isDark ? 'border-primary' : 'border-transparent hover:border-border'}`}
          >
            <div className="bg-[#09090b] rounded-lg p-4 h-32 flex flex-col gap-2 border border-[#27272a]">
              <div className="h-4 w-1/3 bg-[#18181b] rounded shadow-sm"></div>
              <div className="h-2 w-1/2 bg-[#18181b] rounded shadow-sm opacity-60"></div>
              <div className="mt-auto h-10 w-full bg-[#18181b] rounded shadow-sm"></div>
            </div>
            <p className="text-center text-sm font-medium mt-3 text-foreground">Dark</p>
          </div>
        </div>

        <SettingsGroup>
          <SettingsRow
            title="Sincronizar com o sistema"
            description="Alterna automaticamente entre light e dark baseado no seu SO."
            control={<Switch />}
          />
        </SettingsGroup>
      </SettingsSection>

      <SettingsSection title="Cor de Destaque" description="Escolha a cor primária para botões, links e elementos ativos.">
        <div className="flex flex-wrap gap-4">
          {THEMES.map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => handleThemeChange(isDark ? "dark" : "light", tItem.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${selectedColor === tItem.id ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-border'}`}
            >
              <div
                className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center relative"
                style={{ backgroundColor: tItem.color }}
              >
                {selectedColor === tItem.id && <Check size={14} className="text-white drop-shadow-md" />}
              </div>
              <span className="text-[11px] font-medium text-foreground">{tItem.name}</span>
            </button>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
};

const SecuritySection = () => (
  <div className="space-y-10">
    <SettingsSection title="Autenticação e Senhas" description="Gerencie como você faz login e protege sua conta.">
      <SettingsGroup>
        <SettingsRow
          title="Autenticação de Dois Fatores (2FA)"
          description="Adiciona uma camada extra de segurança utilizando um aplicativo autenticador."
          badge={{ text: "Recomendado", variant: "default" }}
          control={<Button variant="outline" size="sm">Configurar</Button>}
        />
        <SettingsRow
          title="Alterar Senha"
          description="É recomendável alterar sua senha periodicamente."
          control={<Button variant="outline" size="sm">Alterar</Button>}
        />
        <SettingsRow
          title="Login via Single Sign-On (SSO)"
          description="Requerido pelas políticas da sua organização."
          locked
          lockScope="organization"
          control={<span className="text-sm font-medium text-muted-foreground">Ativo (Google)</span>}
        />
      </SettingsGroup>
    </SettingsSection>
    
    <SettingsSection title="Sessões Ativas" description="Dispositivos que atualmente têm acesso à sua conta.">
      <SettingsGroup>
        <SettingsRow
          title="MacBook Pro (Mac OS)"
          description="Sessão atual • Chrome • Eusébio, BR"
          badge={{ text: "Ativo Agora", variant: "outline" }}
          control={<Button variant="ghost" size="sm" disabled>Sair</Button>}
        />
        <SettingsRow
          title="iPhone 14 Pro (iOS)"
          description="Visto por último há 2 horas • Safari • Fortaleza, BR"
          control={<Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Encerrar</Button>}
        />
      </SettingsGroup>
    </SettingsSection>
  </div>
);

const NotificationsSection = () => (
  <div className="space-y-10">
    <SettingsSection title="Canais de Notificação" description="Escolha onde você deseja receber alertas do sistema.">
      <SettingsGroup>
        <SettingsRow
          title="Notificações Push no Navegador"
          description="Receba alertas em tempo real mesmo quando o aplicativo estiver em segundo plano."
          control={<Switch defaultChecked />}
        />
        <SettingsRow
          title="Resumo por Email"
          description="Um resumo diário das atividades da sua equipe e tarefas pendentes."
          control={<Switch defaultChecked />}
        />
        <SettingsRow
          title="Integração com Microsoft Teams"
          description="Envie notificações diretamente para canais do Teams."
          badge={{ text: "Experimental" }}
          control={<Switch />}
        />
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection title="Eventos e Gatilhos" description="Configure exatamente quais eventos disparam notificações.">
      <SettingsGroup>
        <SettingsRow
          title="Menções diretas (@)"
          description="Alguém menciona você em um comentário, documento ou tarefa."
          control={<Switch defaultChecked disabled className="opacity-50" />}
        />
        <SettingsRow
          title="Tarefas atribuídas"
          description="Uma nova tarefa foi designada a você."
          control={<Switch defaultChecked />}
        />
        <SettingsRow
          title="Atualizações de status"
          description="Tarefas ou projetos que você segue mudaram de status."
          control={<Switch />}
        />
        <SettingsRow
          title="Alertas de Segurança"
          description="Novos logins, alterações de permissão ou políticas do workspace."
          locked
          lockScope="system"
          control={<Switch defaultChecked disabled />}
        />
      </SettingsGroup>
    </SettingsSection>
  </div>
);