'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { auth, provider, isUserRegistered } from '@/lib/firebase'; // ✅ isUserRegistered 불러오기

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isRegistered = await isUserRegistered(user.uid);
        if (isRegistered) {
          router.push('/'); // 등록된 유저는 대시보드로
        } else {
          router.push('/signup'); // 등록 안 됐으면 /signup 으로 이동
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">🔐 구글 로그인</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}
