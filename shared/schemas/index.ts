import { z } from 'zod';

export const roleSchema = z.enum(['ADMIN', 'MANAGER', 'USER', 'CRAWLER']);
export const themeSchema = z.enum([
  'light-orange',
  'light-rosa',
  'light-roxo',
  'light-vermelho',
  'dark-orange',
  'dark-rosa',
  'dark-roxo',
  'dark-vermelho',
]);

export const baseEntitySchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().optional(),
});

export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  displayName: z.string().min(1),
  photoUrl: z.string().url().optional().nullable(),
  role: roleSchema.default('USER'),
  bio: z.string().default('Sem descrição.'),
  theme: themeSchema.default('light-orange'),
  technicalSalesGroup: z.string().default('Unassigned'),
  language: z.string().default('pt'),
});

export const testbookSchema = baseEntitySchema.extend({
  title: z.string().min(1),
  version: z.string().default('1.0.0'),
  description: z.string(),
  color: z.string().default('text-blue-500'),
  icon: z.string().default('Book'),
  isCustom: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  sharedWith: z.array(z.string().email()).default([]),
  modules: z.array(z.string()).optional(),
});

export const moduleSchema = baseEntitySchema.extend({
  testbookId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  orderIndex: z.number().int().default(0),
});

export const translationSchema = z.object({
  id: z.string().uuid().optional(),
  language: z.string().min(2).max(5),
  key: z.string().min(1),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const dailyGoalSchema = baseEntitySchema.extend({
  text: z.string().min(1),
  completed: z.boolean().default(false),
  assignedTo: z.string().nullable().optional(),
  assignedName: z.string().nullable().optional(),
});

export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  recipientId: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'assignment', 'alert']).default('info'),
  read: z.boolean().default(false),
  link: z.string().nullable().optional(),
  createdAt: z.date().optional(),
});

export const opportunitySchema = baseEntitySchema.extend({
  description: z.string().min(1),
  technicalSalesGroup: z.string().default(''),
  utility: z.string().default(''),
  files: z.string().default(''),
  yearStart: z.number().int(),
  yearEnd: z.number().int(),
  hqInterface: z.string().default(''),
  kam: z.string().default(''),
  status: z.string().default('Draft'),
  product: z.string().default(''),
  priority: z.enum(['Baixa', 'Média', 'Alta']).default('Média'),
  businessStages: z.string().default('Prospecção'),
  reasonWinLoss: z.string().default(''),
  quantity: z.number().default(0),
  scp: z.number().default(0),
  remember: z.string().default(''),
  homologated: z.boolean().default(false),
  reasonHomologated: z.string().default(''),
  country: z.string().default('Brasil'),
  ecosystem: z.string().default(''),
  progress: z.number().min(0).max(100).default(0),
  lastCustomerDiscussion: z.string().default(''),
  observation: z.string().default(''),
  competitors: z.string().default(''),
  productTeam: z.string().default(''),
  salesManagement: z.string().default(''),
  ownerId: z.string(),
});

export const systemLogSchema = z.object({
  id: z.string().uuid().optional(),
  action: z.string(),
  detail: z.string(),
  userId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
});
