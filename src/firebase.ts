import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3-aq3qtm2c9KtgGRCDFqj-iGLxKaSfPg",
  authDomain: "podsadministrator.firebaseapp.com",
  projectId: "podsadministrator",
  storageBucket: "podsadministrator.firebasestorage.app",
  messagingSenderId: "182696281321",
  appId: "1:182696281321:web:6b6a2c4727752a5bd7dc78",
  measurementId: "G-1GRX7FRHKP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);