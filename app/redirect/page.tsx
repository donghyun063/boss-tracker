'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function RedirectAfterLogin() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          // 이미 가입된 유저
          router.push('/'); // 대시보드로 이동
        } else {
          // 추가 정보 입력이 필요한 유저
          router.push('/signup');
        }
      } else {
        // 로그인 안 되어 있음 -> 로그인 페이지로
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return <div className="text-center p-10">확인 중...</div>;
}
