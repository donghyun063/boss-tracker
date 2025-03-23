'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, push, update, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [specList, setSpecList] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fields = [
    '아이디', '레벨', '방어', '리덕', '템컬렉', '무기', '상의', '장갑', '신발', '투구', '목걸이', '반지',
    '벨트', '각반', '망토', '시길',
    ...Array.from({ length: 10 }, (_, i) => `영스${i + 1}`)
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);
      const snapshot = await get(ref(database, 'spec'));
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({
          key,
          ...value,
        }));
        setSpecList(parsed.reverse());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (editKey) {
      await update(ref(database, `spec/${editKey}`), form);
      setEditKey(null);
    } else {
      await push(ref(database, 'spec'), form);
    }
    setForm({});
  };

  const handleEdit = (item: any) => {
    setForm(item);
    setEditKey(item.key);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await remove(ref(database, `spec/${key}`));
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="p-6">
      <button onClick={() => router.push('/')} className="text-blue-600 underline mb-4">← 대시보드로 돌아가기</button>

      <h1 className="text-xl font-bold mb-4">📝 스펙 입력</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {fields.map((key) => (
          <input
            key={key}
            name={key}
            value={form[key] || ''}
            onChange={handleChange}
            placeholder={key}
            className="border p-1 text-sm w-[110px]"
          />
        ))}
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-1 rounded">입력</button>
      </div>

      <table className="border text-sm w-full table-fixed">
        <thead>
          <tr>
            {fields.map((key) => (
              <th key={key} className="border px-2 py-1 whitespace-nowrap">{key}</th>
            ))}
            <th className="border px-2 py-1 whitespace-nowrap">수정</th>
            <th className="border px-2 py-1 whitespace-nowrap">삭제</th>
          </tr>
        </thead>
        <tbody>
          {specList.map((item) => (
            <tr key={item.key}>
              {fields.map((key) => (
                <td key={key} className="border px-2 py-1 text-center">{item[key] || ''}</td>
              ))}
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">수정</button>
              </td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleDelete(item.key)} className="text-red-600 hover:underline">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
