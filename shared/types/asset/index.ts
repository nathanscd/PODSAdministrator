import { BaseEntity } from '../shared';

export interface Asset extends BaseEntity {
  name: string;
  serialNumber: string;
  status: string;
}

export interface ChipControlItem extends BaseEntity {
  iccid: string;
  operator: string;
  status: string;
  assignedDevice?: string;
}
