import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // 🔥 추가

const firebaseConfig = {
  apiKey: 'AIzaSyDJJpEqgQLnZPSxpYeXrMrwvCZLZ-b5YHBk',
  authDomain: 'boss-tracker-81001.firebaseapp.com',
  databaseURL: 'https://boss-tracker-81001-default-rtdb.firebaseio.com',
  projectId: 'boss-tracker-81001',
  storageBucket: 'boss-tracker-81001.appspot.com',
  messagingSenderId: '320704959258',
  appId: '1:320704959258:web:b861b6a2c9de96fe5512a3',
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const auth = getAuth(app); // ✅ 인증 객체
const provider = new GoogleAuthProvider(); // ✅ 구글 로그인 제공자

export { database, auth, provider }; // ✅ export 해주기
