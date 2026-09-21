export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

export type PageType = 'document' | 'board' | 'kanban' | 'spreadsheet' | 'tracker';

export interface Opportunity {
  id: string;
  description: string;
  technicalSalesGroup: string;
  utility: string;
  files: string;
  yearStart: number;
  yearEnd: number;
  hqInterface: string;
  kam: string;
  status: string;
  product: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  businessStages: string; 
  reasonWinLoss: string;
  quantity: number;
  scp: number;
  remember?: string;
  homologated: boolean;
  reasonHomologated: string;
  country: string;
  ecosystem: string;
  progress: number;
  lastCustomerDiscussion: string;
  observation: string;
  competitors: string;
  productTeam: string;
  salesManagement: string;
  ownerId: string;
}

export interface UserGoal {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface Task {
  id: string;
  content: string;
  description?: string;
  assignedTo?: string;
  assignedName?: string; 
  status?: string;
  createdAt?: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Page {
  id: string;
  type: PageType;
  title: string;
  ownerId: string;
  ownerName?: string; 
  isPublic?: boolean; 
  createdAt: any; 
  updatedAt: any;
  theme?: string;
  content?: string;
  
  tasks?: Record<string, Task>;
  columns?: Record<string, Column>;
  columnOrder?: string[];
  
  linkedOpportunityId?: string | null;
}

export interface TaskItem {
  id: string;
  task: string;
  startDate: string;     
  plannedEndDate: string; 
  currentEndDate: string; 
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  responsible: string;
  team: 'Pre-Sales' | 'Post-Sales' | 'Technical' | 'HQ' | 'Sales';
  progress: number; 
}

export interface TaskTracker {
  title?: string;
  id: string;
  opportunityId: string;
  opportunityName: string;
  opportunityUtility: string;
  ownerId: string;
  ownerName: string;
  tasks: TaskItem[];
  createdAt: any;
}

export interface MonthlySnapshot {
  id: string;
  month: number;
  year: number;
  timestamp: any;
  stats: {
    totalOpportunities: number;
    winCount: number;
    lossCount: number;
    openCount: number;
    groupStats: {
      name: string;
      good: number;
      attention: number;
      bad: number;
      win: number;
      loss: number;
      open: number;
    }[];
    ecosystemDistribution: { name: string; value: number }[];
    countryDistribution: { name: string; value: number }[];
  };
  opportunitiesSnapshot: Opportunity[];
}

  export interface StrategicItem {
  id: string;
  goal: string;
  qty: string;
  type: "result_2025" | "objective_2026";
  createdAt: any; 
}

export interface Chips {
  id: string;
  numero: string;
  operadora: string;
  tecnologia: string;
  projeto: string;
  cliente: string;
  responsavel: string;
  equipamento: string; 
  createdAt: any;
}

export interface Sample{
  id: string;
  nome: string;
  dataLimite: Date;
  status: string;
  cliente: string;
  projeto: string;
}

export type CommunicationType = 'NB' | '3G' | '4G' | 'outro';
export type UtilityType = 'Água' | 'Energia' | 'Gás' | 'Saneamento' | 'Telecomunicações';
export type ReservationStatus = 'pending' | 'approved' | 'rejected';

export interface Asset {
  id: string;
  numeroSerie: string;
  modelo: string;
  localizacao: string;
  responsavel: string;
  sistemaVinculado: string;
  tipoComunicacao: CommunicationType;
  projeto: string;
  utility: UtilityType;
  periodoUsoInicial: string;
  periodoUsoFinal: string;
  acessorios?: string;
  observacoes?: string;
  chipVinculado?: string;
  dataCriacao: string;
}

export interface Reservation {
  id: string;
  assetId: string;
  solicitanteName: string;
  status: ReservationStatus;
  dataSolicitacao: string;
}

export interface FilterOptions {
  utility?: UtilityType;
  tipoComunicacao?: CommunicationType;
  projeto?: string;
  responsavel?: string;
  searchTerm?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  link?: string;
  date: string; 
  time?: string; 
  type: 'personal' | 'tracker';
  ownerId: string;
  assignedTo?: string;
  assignedName?: string;
}

export interface QuickTask {
  id: string;
  text: string;
  ownerId: string;
  assignedTo?: string;
  assignedName?: string;
  createdAt: any;
}

export interface Metric {
  label: string;
  value: string;
  unit?: string;
  context?: string;
}

export interface ComparisonItem {
  name: string;
  value: string;
  trend: string;
}

export interface Comparison {
  category: string;
  items: ComparisonItem[];
}

export interface Insight {
  type: string;
  text: string;
}

export interface ReportData {
  theme: string;
  date: string;
  summary: string;
  metrics: Metric[];
  comparisons: Comparison[];
  insights: Insight[];
  sources: string[];
}

export type TestbookModule = 'intro' | 'dispositivos' | 'corte-religue' | 'leitura-demanda' | 'alarmes' | 'parametrizacao' | 'relatorios' | 'diagnosticos';

export interface Testbook {
  id: string;
  title: string;
  description: string;
  version: string;
  modules: TestbookModule[];
  color: string;
  icon: string;
  isCustom: boolean;
  ownerId: string;
  ownerName?: string;
  createdAt: any;
  updatedAt: any;
  isPublic: boolean;
  sharedWith?: string[];
}

export interface TestbookModuleContent {
  id: string;
  testbookId: string;
  moduleId: TestbookModule;
  title: string;
  description: string;
  content: string; // HTML rich text content
  images?: string[]; // URLs to images
  alerts?: {
    type: 'info' | 'warning' | 'tip' | 'error';
    title: string;
    content: string;
  }[];
  isGlobal: boolean; // If true, affects all testbooks with this module
  createdAt: any;
  updatedAt: any;
  updatedBy: string;
  updatedByName: string;
}

export interface TestbookEditChange {
  moduleId: TestbookModule;
  isGlobal: boolean;
  changes: Partial<TestbookModuleContent>;
}


