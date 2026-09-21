import { BaseEntity } from '../shared';

export interface AutomationRule extends BaseEntity {
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}
