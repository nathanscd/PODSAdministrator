export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

export type PageType = "document" | "board";

export interface Task {
  id: string;
  content: string;      // Título da tarefa
  description?: string; // Descrição longa (dentro do modal)
  assignee?: string;    // Nome do responsável
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
  createdAt: any;
  
  // Campos para Documentos de Texto
  content?: string;

  // Campos para Quadros (To-Do)
  tasks?: Record<string, Task>;
  columns?: Record<string, Column>;
  columnOrder?: string[];
}