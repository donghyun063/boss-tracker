'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set, update, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const bosses = [
  '메두사', '티미트리스', '사반', '펠리스', '트롬바', '베히모스', '탈라킨', '체르투바', '판드', '카탄', '사르카',
  '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스', '브레카', '탈킨', '스탄', '오크', '바실라',
  '란도르', '글라키', '히실로메', '망각의거울', '실라', '무프', '노르무스', '우칸바'
];

export default function SoulPage() {
  const router = useRouter();
  const [form, setForm] = useState<{ [key: string]: boolean | string }>({ id: '' });
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const snapshot = await get(ref(database, 'soul'));
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
        setRecords(parsed);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!form.id) return alert('아이디를 입력해주세요.');
    await set(ref(database, `soul/${form.id}`), form);
    alert('저장 완료!');
    setForm({ id: '' });
    bosses.forEach((boss) => (form[boss] = false));
    const snapshot = await get(ref(database, 'soul'));
    const data = snapshot.val();
    if (data) {
      const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
      setRecords(parsed);
    }
  };

  const handleEdit = (record: any) => {
    const copy = { ...record };
    delete copy.key;
    setForm(copy);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await remove(ref(database, `soul/${id}`));
    setRecords((prev) => prev.filter((r) => r.key !== id));
  };

  return (
    <main className="p-10">
      <h1 className="text-xl font-bold mb-4">🧠 혼 보유 현황 입력</h1>
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <input
          name="id"
          value={form['id'] || ''}
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

      <table className="border text-sm w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">아이디</th>
            {bosses.map((boss) => (
              <th key={boss} className="border px-2 py-1 whitespace-nowrap">{boss}</th>
            ))}
            <th className="border px-2 py-1">수정</th>
            <th className="border px-2 py-1">삭제</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.key} className="text-center">
              <td className="border px-2 py-1">{record.id}</td>
              {bosses.map((boss) => (
                <td key={boss} className="border px-2 py-1">
                  {record[boss] ? '✔️' : ''}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-blue-600 hover:underline"
                >
                  수정
                </button>
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 hover:underline"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
