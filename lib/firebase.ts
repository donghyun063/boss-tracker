import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // 🔥 추가

const firebaseConfig = {
  apiKey: 'AIzaSyDJIpebql2nPZ5pxYeXrMrwC7LZ-b5YH8k',
  authDomain: 'boss-tracker-81001.firebaseapp.com',
  databaseURL: 'https://boss-tracker-81001-default-rtdb.firebaseio.com',
  projectId: 'boss-tracker-81001',
  storageBucket: 'boss-tracker-81001.appspot.com',
  messagingSenderId: '320704959258',
  appId: '1:320704959258:web:b861b6a2c9de96fe5512a3',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, database, auth, provider }; // 👈 이 줄 추가!

import { ref, get } from 'firebase/database';

export async function isUserRegistered(uid: string): Promise<boolean> {
  const db = getDatabase();
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists();
}
