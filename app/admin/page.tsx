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
    <main className="p-10 max-w-6xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">가입 요청 승인</h1>
      <table className="w-full text-sm border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">이름</th>
            <th className="border px-2 py-1">이메일</th>
            <th className="border px-2 py-1">전화번호</th>
            <th className="border px-2 py-1">클래스</th>
            <th className="border px-2 py-1">닉네임</th>
            <th className="border px-2 py-1">승인 상태</th>
            <th className="border px-2 py-1">권한</th>
            <th className="border px-2 py-1">작업</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(users).map(([uid, user]) => (
            <tr key={uid} className="text-center">
              <td className="border px-2 py-1">{user.name}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.phone}</td>
              <td className="border px-2 py-1">{user.class}</td>
              <td className="border px-2 py-1">{user.nickname}</td>
              <td className="border px-2 py-1">{user.approval ? '✅ 승인됨' : '⏳ 대기 중'}</td>
              <td className="border px-2 py-1">{user.role}</td>
              <td className="border px-2 py-1">
                {!user.approval && (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => approveUser(uid)}
                  >
                    승인하기
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
