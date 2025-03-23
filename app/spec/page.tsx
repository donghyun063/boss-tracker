'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  const fields = [
    '아이디', '레벨', '방어', '리덕', '템컬렉', '무기', '상의', '장갑', '신발', '투구',
    '목걸이', '반지', '벨트', '각반', '망토', '시길',
    ...Array.from({ length: 10 }, (_, i) => `영스${i + 1}`)
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);
    });

    const specRef = ref(database, 'user-specs');
    onValue(specRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
      setSpecs(parsed);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form['아이디']) return alert('아이디는 필수입니다.');

    if (editKey) {
      await update(ref(database, `user-specs/${editKey}`), form);
      setEditKey(null);
    } else {
      await push(ref(database, 'user-specs'), form);
    }
    setForm({});
  };

  const handleEdit = (spec: any) => {
    setForm(spec);
    setEditKey(spec.key);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await remove(ref(database, `user-specs/${key}`));
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6 max-w-screen-xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800 self-start"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold mb-4">📋 스펙 입력</h1>

      <div className="overflow-x-auto w-full">
        <table className="w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            <tr>
              {fields.map((field) => (
                <th key={field} className="border p-1 whitespace-nowrap">{field}</th>
              ))}
              <th className="border p-1 whitespace-nowrap">수정</th>
              <th className="border p-1 whitespace-nowrap">삭제</th>
            </tr>
            <tr>
              {fields.map((field) => (
                <td key={field} className="border p-1">
                  <input
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    className="border px-1 py-0.5 rounded w-full"
                  />
                </td>
              ))}
              <td colSpan={2} className="border p-1 text-center">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  입력
                </button>
              </td>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.key} className="text-center">
                {fields.map((field) => (
                  <td key={field} className="border p-1 whitespace-nowrap">
                    {spec[field] || ''}
                  </td>
                ))}
                <td className="border p-1">
                  <button
                    onClick={() => handleEdit(spec)}
                    className="text-blue-600 hover:underline"
                  >수정</button>
                </td>
                <td className="border p-1">
                  <button
                    onClick={() => handleDelete(spec.key)}
                    className="text-red-600 hover:underline"
                  >삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
