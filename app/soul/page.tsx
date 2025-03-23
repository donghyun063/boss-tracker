'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set, get, onValue } from 'firebase/database';
import { database, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const bossNames = [
  '메두사', '티미트리스', '사반', '트롬바', '베히모스', '탈라킨', '체르투바', '판드',
  '카탄', '사르카', '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스', '브레카',
  '탈킨', '스탄', '오크', '바실라', '란도르', '글라키', '히실로메', '망각의거울',
  '실라', '무프', '노르무스', '우칸바'
];

export default function SoulPage() {
  const router = useRouter();
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [checkedBosses, setCheckedBosses] = useState<Record<string, boolean>>({});
  const [souls, setSouls] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userInfo = snapshot.val();
      setName(userInfo?.nickname || '');
    });

    const soulRef = ref(database, 'soul');
    onValue(soulRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        id: key,
        ...value,
      }));
      setSouls(parsed);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCheckbox = (boss: string) => {
    setCheckedBosses((prev) => ({
      ...prev,
      [boss]: !prev[boss]
    }));
  };

  const handleSubmit = async () => {
    if (!uid || !name) return;
    await set(ref(database, `soul/${uid}`), {
      name,
      ...checkedBosses
    });
    alert('집혼 현황이 저장되었습니다.');
  };

  return (
    <main className="flex flex-col items-center p-10 space-y-6">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800 self-start"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold">🧿 집혼 현황 입력</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
        {bossNames.map((boss) => (
          <label key={boss} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={checkedBosses[boss] || false}
              onChange={() => handleCheckbox(boss)}
            />
            <span>{boss}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        입력
      </button>

      <h2 className="text-xl font-semibold mt-10">📝 집혼 보유자 리스트</h2>

      <div className="overflow-x-auto w-full max-w-7xl">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">닉네임</th>
              {bossNames.map((boss) => (
                <th key={boss} className="border p-2 whitespace-nowrap">{boss}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {souls.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border p-2">{user.name}</td>
                {bossNames.map((boss) => (
                  <td key={boss} className="border p-2">
                    {user[boss] ? '✅' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
