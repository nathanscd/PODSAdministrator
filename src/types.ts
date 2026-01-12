export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

export type PageType = 'document' | 'board';

export interface Task {
  id: string;
  content: string;
  description?: string;
  assignee?: string;
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
  theme?: string;
  content?: string;
  tasks?: any;
  columns?: any;
  columnOrder?: string[];
}