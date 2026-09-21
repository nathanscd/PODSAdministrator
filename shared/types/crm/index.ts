import { BaseEntity } from '../shared';

export interface Opportunity extends BaseEntity {
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
  priority: 'Baixa' | 'Média' | 'Alta';
  businessStages: string;
  reasonWinLoss: string;
  quantity: number;
  scp: number;
  remember: string;
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
