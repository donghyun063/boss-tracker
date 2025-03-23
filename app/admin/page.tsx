'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, update, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
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
        alert('접근 권한이 없습니다.');
        router.push('/');
        return;
      }

      setLoading(false);
    });

    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([uid, value]: any) => ({ uid, ...value }));
      setUsers(parsed);
    });

    return () => unsubscribe();
  }, [router]);

  const handleApprovalToggle = async (uid: string, approval: boolean) => {
    await update(ref(database, `users/${uid}`), { approval: !approval });
  };

  const handleRoleChange = async (uid: string, role: string) => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    await update(ref(database, `users/${uid}`), { role: newRole });
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6">
      <div className="w-full max-w-6xl mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>
      <h1 className="text-2xl font-bold">가입 승인 및 권한 관리</h1>
      <table className="w-full max-w-6xl border border-gray-300 mt-5">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">이름</th>
            <th className="border p-2">아이디</th>
            <th className="border p-2">전화번호</th>
            <th className="border p-2">나이</th>
            <th className="border p-2">클래스</th>
            <th className="border p-2">닉네임</th>
            <th className="border p-2">승인</th>
            <th className="border p-2">권한</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid} className="text-center">
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.phone}</td>
              <td className="border p-2">{user.age}</td>
              <td className="border p-2">{user.class}</td>
              <td className="border p-2">{user.nickname}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleApprovalToggle(user.uid, user.approval)}
                  className={`px-3 py-1 rounded text-sm ${user.approval ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}
                >
                  {user.approval ? '승인 취소' : '승인'}
                </button>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleRoleChange(user.uid, user.role)}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  {user.role === 'admin' ? '관리자' : '일반'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
