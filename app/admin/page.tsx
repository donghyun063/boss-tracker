'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, onValue, update } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

interface UserData {
  name: string;
  age: string;
  phone: string;
  class: string;
  nickname: string;
  email: string;
  approval: boolean;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userInfo = snapshot.val();

      if (!userInfo || userInfo.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.push('/');
        return;
      }

      const usersRef = ref(database, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        setUsers(data || {});
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const approveUser = async (uid: string) => {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, {
      approval: true,
      role: 'user',
    });
    alert('승인 완료!');
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="p-10 max-w-3xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">가입 요청 승인</h1>
      <ul className="space-y-4">
        {Object.entries(users).map(([uid, user]) => (
          <li key={uid} className="border p-4 rounded shadow-sm">
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>전화번호:</strong> {user.phone}</p>
            <p><strong>클래스:</strong> {user.class}</p>
            <p><strong>닉네임:</strong> {user.nickname}</p>
            <p><strong>승인 상태:</strong> {user.approval ? '✅ 승인됨' : '⏳ 승인 대기중'}</p>
            <p><strong>권한:</strong> {user.role}</p>

            {!user.approval && (
              <button
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
                onClick={() => approveUser(uid)}
              >
                ✅ 승인하기
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
