'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, push, remove, update, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [uid, setUid] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fields = [
    { key: 'id', label: '아이디' },
    { key: 'level', label: '레벨' },
    { key: 'def', label: '방어' },
    { key: 'reduction', label: '리덕' },
    { key: 'collection', label: '템컬렉' },
    { key: 'weapon', label: '무기' },
    { key: 'top', label: '상의' },
    { key: 'gloves', label: '장갑' },
    { key: 'shoes', label: '신발' },
    { key: 'helmet', label: '투구' },
    { key: 'necklace', label: '목걸이' },
    { key: 'ring', label: '반지' },
    { key: 'belt', label: '벨트' },
    { key: 'leg', label: '각반' },
    { key: 'cape', label: '망토' },
    { key: 'sigil', label: '시길' },
    ...Array.from({ length: 10 }, (_, i) => ({ key: `sp${i + 1}`, label: `영스${i + 1}` }))
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);

      const snapshot = await get(ref(database, `users/${user.uid}`));
      const userInfo = snapshot.val();
      if (!userInfo || !userInfo.approval) {
        alert('승인된 사용자만 접근 가능합니다.');
        router.push('/login');
        return;
      }

      const specRef = ref(database, 'specs');
      onValue(specRef, (snapshot) => {
        const specData = snapshot.val();
        if (!specData) return setData([]);
        const parsed = Object.entries(specData).map(([key, value]: any) => ({ key, ...value }));
        setData(parsed);
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const isEmpty = !form.id || !form.level;
    if (isEmpty) return alert('아이디와 레벨은 필수입니다.');
    if (editKey) {
      await update(ref(database, `specs/${editKey}`), form);
      setEditKey(null);
    } else {
      await push(ref(database, 'specs'), form);
    }
    setForm({});
  };

  const handleEdit = (entry: any) => {
    setForm(entry);
    setEditKey(entry.key);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await remove(ref(database, `specs/${key}`));
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="p-6 space-y-4 max-w-screen-2xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>

      <h1 className="text-xl font-bold">📋 스펙 입력</h1>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {fields.map((f) => (
          <input
            key={f.key}
            name={f.key}
            value={form[f.key] || ''}
            onChange={handleChange}
            placeholder={f.label}
            className="border p-1 rounded text-sm"
          />
        ))}
      </div>

      <div className="mt-3">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editKey ? '수정 완료' : '입력'}
        </button>
      </div>

      {/* 결과 테이블 */}
      <div className="overflow-auto mt-6">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              {fields.map((f) => (
                <th key={f.key} className="border p-1 whitespace-nowrap">{f.label}</th>
              ))}
              <th className="border p-1">수정</th>
              <th className="border p-1">삭제</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.key} className="text-center">
                {fields.map((f) => (
                  <td key={f.key} className="border p-1">{entry[f.key]}</td>
                ))}
                <td className="border p-1">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 underline text-xs"
                  >
                    수정
                  </button>
                </td>
                <td className="border p-1">
                  <button
                    onClick={() => handleDelete(entry.key)}
                    className="text-red-600 underline text-xs"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
