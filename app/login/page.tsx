'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup, // ✅ 팝업 로그인 함수 사용
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // ✅ app도 export 되어 있어야 함

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app); // ✅ Firebase 앱 객체 전달
  const provider = new GoogleAuthProvider();

  // 🔐 로그인 상태 감지해서 로그인된 경우 메인 페이지로 이동
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/'); // 로그인 성공 시 메인 페이지 이동
      } else {
        setLoading(false); // 로딩 종료 → 로그인 버튼 보이게
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  // 🔘 구글 로그인 버튼 클릭 시 실행
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      console.log("✅ 로그인 성공");
    } catch (error) {
      console.error("❌ 로그인 실패", error);
    }
  };

  // ⏳ 로딩 중일 때는 "로딩 중..." 텍스트 표시
  if (loading) {
    return <div className="text-center p-10">로딩 중...</div>;
  }

  // ✅ 로그인 페이지 UI
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
