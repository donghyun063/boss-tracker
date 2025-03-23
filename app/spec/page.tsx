'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  const fields = [
    '아이디', '레벨', '방어', '리덕', '템컬렉', '무기', '상의', '장갑', '신발', '투구', '목걸이',
    '반지', '벨트', '각반', '망토', '시길',
    ...Array.from({ length: 10 }, (_, i) => `영스${i + 1}`)
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUid(user.uid);
        setLoading(false);
      }
    });

    const specRef = ref(database, 'specs');
    onValue(specRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        key,
        ...value,
      }));
      setSpecs(parsed);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (editKey) {
      await update(ref(database, `specs/${editKey}`), form);
      setEditKey(null);
    } else {
      await push(ref(database, 'specs'), form);
    }
    setForm({});
  };

  const handleEdit = (spec: any) => {
    setForm(spec);
    setEditKey(spec.key);
  };

  const handleDelete = async (key: string) => {
    if (confirm('삭제하시겠습니까?')) {
      await remove(ref(database, `specs/${key}`));
    }
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold">📋 스펙 입력</h1>

      <div className="flex flex-nowrap gap-2 overflow-x-auto">
        {fields.map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field] || ''}
            onChange={handleChange}
            className="border p-1 w-[90px] text-sm rounded"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        {editKey ? '수정 완료' : '입력'}
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              {fields.map((field) => (
                <th key={field} className="border px-2 py-1 whitespace-nowrap">{field}</th>
              ))}
              <th className="border px-2 py-1">수정</th>
              <th className="border px-2 py-1">삭제</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.key}>
                {fields.map((field) => (
                  <td key={field} className="border px-2 py-1 whitespace-nowrap">{spec[field] || ''}</td>
                ))}
                <td className="border px-2 py-1">
                  <button onClick={() => handleEdit(spec)} className="text-blue-600 hover:underline">수정</button>
                </td>
                <td className="border px-2 py-1">
                  <button onClick={() => handleDelete(spec.key)} className="text-red-600 hover:underline">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
