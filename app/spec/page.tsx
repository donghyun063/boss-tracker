'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, remove } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SpecPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [specs, setSpecs] = useState<any[]>([]);

  const fields = [
    { name: 'id', label: '아이디' },
    { name: 'level', label: '레벨' },
    { name: 'def', label: '방어' },
    { name: 'reduction', label: '리덕' },
    { name: 'collection', label: '템컬렉' },
    { name: 'weapon', label: '무기' },
    { name: 'top', label: '상의' },
    { name: 'gloves', label: '장갑' },
    { name: 'shoes', label: '신발' },
    { name: 'helmet', label: '투구' },
    { name: 'necklace', label: '목걸이' },
    { name: 'ring1', label: '반지1' },
    { name: 'ring2', label: '반지2' },
    { name: 'belt', label: '벨트' },
    { name: 'leg', label: '각반' },
    { name: 'cape', label: '망토' },
    { name: 'sigil', label: '시길' },
    ...Array.from({ length: 10 }, (_, i) => ({ name: `sp${i + 1}`, label: `영스${i + 1}` })),
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
    });

    const specRef = ref(database, 'specs');
    onValue(specRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
        setSpecs(parsed);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await push(ref(database, 'specs'), form);
    setForm({});
  };

  const handleDelete = async (key: string) => {
    await remove(ref(database, `specs/${key}`));
  };

  return (
    <main className="p-5 max-w-screen-xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline mb-4"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-4">📝 스펙 입력</h1>

      {/* ✅ 입력 영역 */}
      <div className="overflow-x-auto w-full">
        <div className="flex-nowrap whitespace-nowrap flex gap-1">
          {fields.map((field) => (
            <input
              key={field.name}
              name={field.name}
              placeholder={field.label}
              value={form[field.name] || ''}
              onChange={handleChange}
              className="border p-1 text-xs w-[70px] text-center"
            />
          ))}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
          >
            입력
          </button>
        </div>
      </div>

      {/* ✅ 테이블 */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            <tr>
              {fields.map((field) => (
                <th key={field.name} className="border p-2 whitespace-nowrap px-3">
                  {field.label}
                </th>
              ))}
              <th className="border p-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.key} className="text-center">
                {fields.map((field) => (
                  <td key={field.name} className="border px-3 py-1 whitespace-nowrap">
                    {spec[field.name] || ''}
                  </td>
                ))}
                <td className="border px-3 py-1">
                  <button
                    onClick={() => handleDelete(spec.key)}
                    className="text-red-500 hover:underline"
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
