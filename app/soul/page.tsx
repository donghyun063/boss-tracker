'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const bosses = [
  '메두사', '티미트리스', '사반', '펠리스', '트롬바', '베히모스', '탈라킨', '체르투바', '판드', '카탄', '사르카',
  '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스', '브레카', '탈킨', '스탄', '오크', '바실라',
  '란도르', '글라키', '히실로메', '망각의거울', '실라', '무프', '노르무스', '우칸바'
];

export default function SoulPage() {
  const router = useRouter();
  const [form, setForm] = useState<{ [key: string]: boolean | string }>({});
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedList, setSavedList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setUid(user.uid);
      const snapshot = await get(ref(database, `soul/${user.uid}`));
      const data = snapshot.val();
      if (data) setForm(data);
      setLoading(false);

      const listSnapshot = await get(ref(database, 'soul'));
      const listData = listSnapshot.val();
      if (listData) {
        const parsed = Object.entries(listData).map(([key, value]: any) => ({ id: key, ...value }));
        setSavedList(parsed);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!uid) return;
    await set(ref(database, `soul/${uid}`), form);
    alert('온 보유 현황이 저장되었습니다.');

    const listSnapshot = await get(ref(database, 'soul'));
    const listData = listSnapshot.val();
    if (listData) {
      const parsed = Object.entries(listData).map(([key, value]: any) => ({ id: key, ...value }));
      setSavedList(parsed);
    }
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800 self-start"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-4">📋 혼 보유 현황 입력</h1>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          name="id"
          value={String(form['id'] || '')}
          onChange={handleChange}
          placeholder="아이디"
          className="border px-2 py-1 rounded w-32 text-sm"
        />
        {bosses.map((boss) => (
          <label key={boss} className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              name={boss}
              checked={Boolean(form[boss])}
              onChange={handleChange}
            />
            {boss}
          </label>
        ))}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          입력
        </button>
      </div>

      {/* 리스트 표시 */}
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">아이디</th>
              {bosses.map((boss) => (
                <th key={boss} className="border px-2 py-1 whitespace-nowrap">{boss}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {savedList.map((entry) => (
              <tr key={entry.id}>
                <td className="border px-2 py-1 text-center">{entry.id}</td>
                {bosses.map((boss) => (
                  <td key={boss} className="border px-2 py-1 text-center">
                    {entry[boss] ? '✔️' : ''}
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
