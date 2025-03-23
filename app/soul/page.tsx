'use client';

import { useEffect, useState } from 'react';
import { ref, push, onValue, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SoulPage() {
  const router = useRouter();
  const [form, setForm] = useState<{ [key: string]: boolean | string }>({ id: '' });
  const [records, setRecords] = useState<any[]>([]);
  const bosses = [
    '메두사', '티미트리스', '사반', '트롬바', '베히모스', '탈라킨', '체르투바', '판드', '카탄', '사르카',
    '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스', '브레카', '탈킨', '스탄', '오크', '바실라',
    '란도르', '글라키', '히실로메', '망각의거울', '실라', '무프', '노르무스', '우칸바', '펠리스' // ✅ 펠리스 추가
  ];

  useEffect(() => {
    const soulRef = ref(database, 'soul');
    onValue(soulRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        key,
        ...value,
      }));
      setRecords(parsed);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.id || typeof form.id !== 'string') {
      alert('아이디를 입력하세요.');
      return;
    }
    await push(ref(database, 'soul'), form);
    setForm({ id: '' }); // 입력 후 초기화
  };

  const handleDelete = async (key: string) => {
    await remove(ref(database, `soul/${key}`));
  };

  return (
    <main className="p-10">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800 mb-4 block"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-4">🧠 혼 보유 현황 입력</h1>

      <div className="flex flex-wrap gap-2 items-center mb-6">
        <input
          name="id"
          value={typeof form['id'] === 'string' ? form['id'] : ''}
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
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">아이디</th>
            {bosses.map((boss) => (
              <th key={boss} className="border px-2 py-1">{boss}</th>
            ))}
            <th className="border px-2 py-1">삭제</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.key} className="text-center">
              <td className="border px-2 py-1">{record.id}</td>
              {bosses.map((boss) => (
                <td key={boss} className="border px-2 py-1">
                  {record[boss] ? '✅' : ''}
                </td>
              ))}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(record.key)}
                  className="text-red-500 hover:underline text-xs"
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
