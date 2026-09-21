import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_TESTBOOKS = [
  {
    id: 'pantheon-ng',
    title: 'Pantheon V4 Testbook',
    version: 'v1.0.0',
    description: 'Caderno de testes completo para o sistema Pantheon NG V4. Inclui operações de corte, religue e parametrização.',
    color: 'text-amber-500',
    icon: 'Zap',
    isCustom: false,
    ownerId: 'system',
    ownerName: 'Sistema',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
    sharedWith: [],
    modules: ['intro', 'dispositivos', 'corte-religue', 'leitura-demanda', 'alarmes', 'parametrizacao', 'relatorios', 'diagnosticos'] as const,
  },
  {
    id: 'streetlight',
    title: 'Streetlight Testbook',
    version: 'v1.0.0',
    description: 'Caderno de testes completo para o sistema Streetlight. Inclui operações de corte, religue e parametrização.',
    color: 'text-amber-500',
    icon: 'Zap',
    isCustom: false,
    ownerId: 'system',
    ownerName: 'Sistema',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
    sharedWith: [],
    modules: ['intro', 'dispositivos', 'corte-religue', 'alarmes', 'relatorios', 'parametrizacao', 'diagnosticos', 'leitura-demanda'] as const,
  },
  {
    id: 'zeus',
    title: 'Zeus Testbook',
    version: 'v1.0.0',
    description: 'Caderno de testes completo para o sistema Zeus. Inclui operações de corte, religue e parametrização.',
    color: 'text-amber-500',
    icon: 'Zap',
    isCustom: false,
    ownerId: 'system',
    ownerName: 'Sistema',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: true,
    sharedWith: [],
    modules: ['intro', 'dispositivos', 'corte-religue', 'parametrizacao', 'diagnosticos', 'alarmes', 'leitura-demanda', 'relatorios'] as const,
  },
];

async function seedTestbooks() {
  try {
    console.log('🌱 Starting testbook seeding...');
    
    const testbooksRef = collection(db, 'testbooks');
    
    for (const testbook of DEFAULT_TESTBOOKS) {
      await setDoc(doc(testbooksRef, testbook.id), testbook);
      console.log(`✅ Seeded testbook: ${testbook.title}`);
    }
    
    console.log('✅ All testbooks seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding testbooks:', error);
    process.exit(1);
  }
}

seedTestbooks();
