export type Fiscalizacao = {
  nomFiscalizacaoGeracao: string;
  qtdFiscalizacaoGeracao: number;
  mesReferencia: number;
  anoReferencia: number;
};

export interface Page {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}