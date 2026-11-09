import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAX42ks-n9vFCLN6kDeiVhTdQRi7uw66OI",
  authDomain: "chatapp-7dc38.firebaseapp.com",
  databaseURL: "https://chatapp-7dc38-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatapp-7dc38",
  storageBucket: "chatapp-7dc38.firebasestorage.app",
  messagingSenderId: "912156186957",
  appId: "1:912156186957:web:508e00e879e75533b17f04",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
