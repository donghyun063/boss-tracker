'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, update, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';

interface UserInfo {
  uid: string;
  name: string;
  email: string;
  age: string;
  phone: string;
  class: string;
  nickname: string;
  approval: boolean;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const snapshot = await get(ref(database, `users/${user.uid}`));
      const currentUser = snapshot.val();

      if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.push('/login');
        return;
      }

      // 승인되지 않은 사용자만 가져오기
      const userRef = ref(database, 'users');
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const userList = Object.entries(data)
          .map(([uid, value]: any) => ({ uid, ...value }))
          .filter((user: UserInfo) => user.approval === false);

        setUsers(userList);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [router]);

  const approveUser = async (uid: string) => {
    await update(ref(database, `users/${uid}`), {
      approval: true,
    });
    alert('승인 완료!');
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠 가입 승인 대기자 목록</h1>
      {users.length === 0 ? (
        <p>승인 대기 중인 사용자가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.uid} className="border p-4 rounded shadow bg-white flex justify-between items-center">
              <div>
                <p><strong>이름:</strong> {user.name}</p>
                <p><strong>이메일:</strong> {user.email}</p>
                <p><strong>전화번호:</strong> {user.phone}</p>
                <p><strong>클래스:</strong> {user.class}</p>
                <p><strong>닉네임:</strong> {user.nickname}</p>
              </div>
              <button
                onClick={() => approveUser(user.uid)}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
              >
                ✅ 승인
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
