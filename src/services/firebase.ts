import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBIiLFITy65iO79czLEaJYNdnxkh5NpwSw",
  authDomain: "chatapp-b8740.firebaseapp.com",
  databaseURL: "https://chatapp-b8740-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatapp-b8740",
  storageBucket: "chatapp-b8740.firebasestorage.app",
  messagingSenderId: "251817960727",
  appId: "1:251817960727:web:1d154e149514a887a44352",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
