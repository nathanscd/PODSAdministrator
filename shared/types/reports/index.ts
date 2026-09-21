import { BaseEntity } from '../shared';

export interface ReportMetric extends BaseEntity {
  title: string;
  value: number | string;
  change?: number;
}
