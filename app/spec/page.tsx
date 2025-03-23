'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, update, get, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fields = [
    'def', 'reduction', 'collection', 'weapon', 'top', 'gloves', 'shoes', 'helmet', 'necklace',
    'ring', 'belt', 'leg', 'cape', 'sigil',
    ...Array.from({ length: 10 }, (_, i) => `sp${i + 1}`)
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const data = snapshot.val();
      if (data) {
        setForm(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!uid) return;
    await update(ref(database, `users/${uid}`), form);
    alert('스펙이 저장되었습니다!');
  };

  const handleClear = async () => {
    if (!uid) return;
    const updates: any = {};
    fields.forEach((key) => (updates[key] = ''));
    await update(ref(database, `users/${uid}`), updates);
    setForm((prev: any) => {
      const cleared = { ...prev };
      fields.forEach((key) => (cleared[key] = ''));
      return cleared;
    });
    alert('스펙이 초기화되었습니다.');
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6 max-w-screen-lg mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline hover:text-blue-800 self-start"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold mb-4">📋 스펙 입력 및 수정</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {fields.map((key) => (
          <div key={key} className="flex flex-col text-sm">
            <label className="font-semibold mb-1">{key.toUpperCase()}</label>
            <input
              name={key}
              value={form[key] || ''}
              onChange={handleChange}
              className="border p-1 rounded"
              placeholder={`${key} 입력`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          저장
        </button>
        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          초기화
        </button>
      </div>
    </main>
  );
}
