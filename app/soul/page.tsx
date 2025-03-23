'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

const bosses = [
  '메두사', '티미트리스', '사반', '트롬바', '베히모스', '탈라킨', '체르투바', '판드',
  '카탄', '사르카', '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스', '브레카',
  '탈킨', '스탄', '오크', '바실라', '란도르', '글라키', '히실로메', '망각의거울',
  '실라', '무프', '노르무스', '우칸바', '펠리스'
];

export default function SoulPage() {
  const router = useRouter();
  const [form, setForm] = useState<{ [key: string]: boolean | string }>({ id: '' });
  const [records, setRecords] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  useEffect(() => {
    const soulRef = ref(database, 'soul');
    onValue(soulRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
      setRecords(parsed);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form['id']) {
      alert('아이디를 입력해주세요.');
      return;
    }

    const dataToSave = { ...form };
    delete dataToSave.key;

    if (editKey) {
      await set(ref(database, `soul/${editKey}`), dataToSave);
      setEditKey(null);
    } else {
      await push(ref(database, 'soul'), dataToSave);
    }

    setForm({ id: '' });
    bosses.forEach((b) => setForm((prev) => ({ ...prev, [b]: false })));
  };

  const handleEdit = (record: any) => {
    setForm(record);
    setEditKey(record.key);
  };

  const handleDelete = async (key: string) => {
    const confirmDelete = confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;
    await remove(ref(database, `soul/${key}`));
  };

  return (
    <main className="p-10">
      <h1 className="text-xl font-bold mb-4">🔮 혼 보유 현황 입력</h1>
      <button
        onClick={() => router.push('/')}
        className="mb-4 text-sm text-blue-600 underline hover:text-blue-800"
      >
        ← 대시보드로 돌아가기
      </button>

      <div className="flex flex-wrap gap-2 items-center mb-6">
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
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        {editKey ? '수정 완료' : '입력'}
      </button>

      <table className="border text-sm w-full table-auto mt-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-1">아이디</th>
            {bosses.map((boss) => (
              <th key={boss} className="border p-1">{boss}</th>
            ))}
            <th className="border p-1">수정</th>
            <th className="border p-1">삭제</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.key} className="text-center">
              <td className="border p-1">{record.id}</td>
              {bosses.map((boss) => (
                <td key={boss} className="border p-1">
                  {record[boss] ? '✔️' : ''}
                </td>
              ))}
              <td className="border p-1">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-blue-600 hover:underline"
                >
                  수정
                </button>
              </td>
              <td className="border p-1">
                <button
                  onClick={() => handleDelete(record.key)}
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
