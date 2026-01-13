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