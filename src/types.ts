export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

export type PageType = 'document' | 'board';

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
  tasks?: any;
  columns?: any;
  columnOrder?: string[];
  linkedOpportunityId?: string | null;
}

export interface TaskItem {
  id: string;
  task: string;
  startDate: string;      // YYYY-MM-DD
  plannedEndDate: string; // YYYY-MM-DD
  currentEndDate: string; // YYYY-MM-DD
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  responsible: string;
  team: 'Pre-Sales' | 'Post-Sales' | 'Technical' | 'HQ' | 'Sales';
  progress: number; // 0 a 100
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