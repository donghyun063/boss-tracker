'use client';

import { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/'); // 로그인한 경우 홈 또는 대시보드로 이동
      } else {
        setLoading(false); // 로그인 안 된 경우 로그인 화면 표시
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert('로그인에 실패했습니다.');
      console.error(error);
    }
  };

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">구글 로그인</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}
