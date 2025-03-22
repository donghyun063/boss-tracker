'use client';

import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const [form, setForm] = useState({
    name: '',
    userId: '',
    phone: '',
    age: '',
  });

  // 로그인 상태 확인
  useEffect(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          // 이미 정보 있음 → 대시보드로
          router.push('/');
        } else {
          // 정보 없음 → 입력폼 보여주기
          setIsNewUser(true);
        }
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const { name, userId, phone, age } = form;

    if (!name || !userId || !phone || !age) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      name,
      userId,
      phone,
      age,
      role: 'user', // 기본은 일반 사용자
    });

    router.push('/');
  };

  if (!user) {
    return (
      <div className="p-10 text-center space-y-5">
        <h1 className="text-2xl font-bold">구글 로그인</h1>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Google 계정으로 로그인
        </button>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-xl font-bold mb-2">추가 정보 입력</h2>
        <input
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="아이디"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="전화번호"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="나이"
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          저장하고 시작하기
        </button>
      </div>
    );
  }

  return null;
}
