import { FirestoreDataConverter, QueryDocumentSnapshot, DocumentData, WithFieldValue } from 'firebase/firestore';
import {
  User,
  Testbook,
  Module,
  Translation,
  DailyGoal,
  Notification,
  Opportunity,
  SystemLog
} from 'shared/types';
import {
  userSchema,
  testbookSchema,
  moduleSchema,
  translationSchema,
  dailyGoalSchema,
  notificationSchema,
  opportunitySchema,
  systemLogSchema
} from 'shared/schemas';

// Helper to convert Firestore timestamp or string fallback into a standard Javascript Date
const convertDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(entity: WithFieldValue<User>): DocumentData {
    userSchema.parse(entity);
    return {
      email: entity.email,
      displayName: entity.displayName,
      photoUrl: entity.photoUrl || null,
      role: entity.role || 'USER',
      bio: entity.bio || 'Sem descrição.',
      theme: entity.theme || 'light-orange',
      technicalSalesGroup: entity.technicalSalesGroup || 'Unassigned',
      language: entity.language || 'pt',
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: entity.createdBy || 'system',
      updatedBy: entity.updatedBy || 'system',
      isDeleted: entity.isDeleted || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      photoUrl: data.photoUrl || undefined,
      role: data.role || 'USER',
      bio: data.bio || 'Sem descrição.',
      theme: data.theme || 'light-orange',
      technicalSalesGroup: data.technicalSalesGroup || 'Unassigned',
      language: data.language || 'pt',
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
    } as User;
  }
};

export const testbookConverter: FirestoreDataConverter<Testbook> = {
  toFirestore(entity: WithFieldValue<Testbook>): DocumentData {
    testbookSchema.parse(entity);
    return {
      title: entity.title,
      version: entity.version || '1.0.0',
      description: entity.description,
      color: entity.color || 'text-blue-500',
      icon: entity.icon || 'Book',
      isCustom: entity.isCustom ?? true,
      isPublic: entity.isPublic ?? false,
      sharedWith: entity.sharedWith || [],
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      isDeleted: entity.isDeleted || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Testbook {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      version: data.version || '1.0.0',
      description: data.description,
      color: data.color || 'text-blue-500',
      icon: data.icon || 'Book',
      isCustom: data.isCustom ?? true,
      isPublic: data.isPublic ?? false,
      sharedWith: data.sharedWith || [],
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
    } as Testbook;
  }
};

export const moduleConverter: FirestoreDataConverter<Module> = {
  toFirestore(entity: WithFieldValue<Module>): DocumentData {
    moduleSchema.parse(entity);
    return {
      testbookId: entity.testbookId,
      title: entity.title,
      content: entity.content,
      orderIndex: entity.orderIndex ?? 0,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      isDeleted: entity.isDeleted || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Module {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      testbookId: data.testbookId,
      title: data.title,
      content: data.content,
      orderIndex: data.orderIndex ?? 0,
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
    } as Module;
  }
};

export const translationConverter: FirestoreDataConverter<Translation> = {
  toFirestore(entity: WithFieldValue<Translation>): DocumentData {
    translationSchema.parse(entity);
    return {
      language: entity.language,
      key: entity.key,
      value: entity.value,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Translation {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      language: data.language,
      key: data.key,
      value: data.value,
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
    } as Translation;
  }
};

export const dailyGoalConverter: FirestoreDataConverter<DailyGoal> = {
  toFirestore(entity: WithFieldValue<DailyGoal>): DocumentData {
    dailyGoalSchema.parse(entity);
    return {
      text: entity.text,
      completed: entity.completed ?? false,
      assignedTo: entity.assignedTo || null,
      assignedName: entity.assignedName || null,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      isDeleted: entity.isDeleted || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): DailyGoal {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      text: data.text,
      completed: data.completed ?? false,
      assignedTo: data.assignedTo || undefined,
      assignedName: data.assignedName || undefined,
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
    } as DailyGoal;
  }
};

export const notificationConverter: FirestoreDataConverter<Notification> = {
  toFirestore(entity: WithFieldValue<Notification>): DocumentData {
    notificationSchema.parse(entity);
    return {
      recipientId: entity.recipientId,
      title: entity.title,
      message: entity.message,
      type: entity.type || 'info',
      read: entity.read ?? false,
      link: entity.link || null,
      createdAt: entity.createdAt || new Date(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Notification {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      recipientId: data.recipientId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      read: data.read ?? false,
      link: data.link || undefined,
      createdAt: convertDate(data.createdAt),
    } as Notification;
  }
};

export const opportunityConverter: FirestoreDataConverter<Opportunity> = {
  toFirestore(entity: WithFieldValue<Opportunity>): DocumentData {
    opportunitySchema.parse(entity);
    return {
      description: entity.description,
      technicalSalesGroup: entity.technicalSalesGroup || '',
      utility: entity.utility || '',
      files: entity.files || '',
      yearStart: entity.yearStart,
      yearEnd: entity.yearEnd,
      hqInterface: entity.hqInterface || '',
      kam: entity.kam || '',
      status: entity.status || 'Draft',
      product: entity.product || '',
      priority: entity.priority || 'Média',
      businessStages: entity.businessStages || 'Prospecção',
      reasonWinLoss: entity.reasonWinLoss || '',
      quantity: entity.quantity || 0,
      scp: entity.scp || 0,
      remember: entity.remember || '',
      homologated: entity.homologated ?? false,
      reasonHomologated: entity.reasonHomologated || '',
      country: entity.country || 'Brasil',
      ecosystem: entity.ecosystem || '',
      progress: entity.progress || 0,
      lastCustomerDiscussion: entity.lastCustomerDiscussion || '',
      observation: entity.observation || '',
      competitors: entity.competitors || '',
      productTeam: entity.productTeam || '',
      salesManagement: entity.salesManagement || '',
      ownerId: entity.ownerId,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      isDeleted: entity.isDeleted || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Opportunity {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      description: data.description,
      technicalSalesGroup: data.technicalSalesGroup || '',
      utility: data.utility || '',
      files: data.files || '',
      yearStart: data.yearStart,
      yearEnd: data.yearEnd,
      hqInterface: data.hqInterface || '',
      kam: data.kam || '',
      status: data.status || 'Draft',
      product: data.product || '',
      priority: data.priority || 'Média',
      businessStages: data.businessStages || 'Prospecção',
      reasonWinLoss: data.reasonWinLoss || '',
      quantity: data.quantity || 0,
      scp: data.scp || 0,
      remember: data.remember || '',
      homologated: data.homologated ?? false,
      reasonHomologated: data.reasonHomologated || '',
      country: data.country || 'Brasil',
      ecosystem: data.ecosystem || '',
      progress: data.progress || 0,
      lastCustomerDiscussion: data.lastCustomerDiscussion || '',
      observation: data.observation || '',
      competitors: data.competitors || '',
      productTeam: data.productTeam || '',
      salesManagement: data.salesManagement || '',
      ownerId: data.ownerId,
      createdAt: convertDate(data.createdAt),
      updatedAt: convertDate(data.updatedAt),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
    } as Opportunity;
  }
};

export const systemLogConverter: FirestoreDataConverter<SystemLog> = {
  toFirestore(entity: WithFieldValue<SystemLog>): DocumentData {
    systemLogSchema.parse(entity);
    return {
      action: entity.action,
      detail: entity.detail,
      userId: entity.userId || null,
      createdAt: entity.createdAt || new Date(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): SystemLog {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      action: data.action,
      detail: data.detail,
      userId: data.userId || undefined,
      createdAt: convertDate(data.createdAt),
    } as SystemLog;
  }
};
