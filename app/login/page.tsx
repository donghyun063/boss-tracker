'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect } from 'firebase/auth';
import { app } from '@/lib/firebase'; // 'app'도 export 했는지 꼭 확인!

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogin = () => {
    signInWithRedirect(auth, provider);
  };

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">🔐 구글 로그인</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}
