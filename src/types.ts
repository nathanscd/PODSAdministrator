export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

// Expandido para suportar todos os tipos de páginas do sistema
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
  assignedName?: string; // Obrigatório para o sistema de notificações
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
  
  // CORREÇÃO AQUI: Tipagem estrita para o Board/Kanban
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
  tasks: TaskItem[];
  createdAt: any;
}