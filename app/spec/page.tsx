'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, push, update, remove } from 'firebase/database';
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
    '아이디', '레벨', '방어', '리덕', '템컬렉', '무기', '상의', '장갑', '신발', '투구', '목걸이',
    '반지1', '반지2', '벨트', '각반', '망토', '시길',
    ...Array.from({ length: 10 }, (_, i) => `영스${i + 1}`)
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUid(user.uid);
      setLoading(false);
    });

    const fetchSpecs = async () => {
      const snapshot = await get(ref(database, 'specs'));
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({
          key,
          ...value,
        }));
        setSpecs(parsed);
      }
    };

    fetchSpecs();
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
    const snapshot = await get(ref(database, 'specs'));
    const data = snapshot.val();
    if (data) {
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        key,
        ...value,
      }));
      setSpecs(parsed);
    }
  };

  const handleEdit = (spec: any) => {
    setForm(spec);
    setEditKey(spec.key);
  };

  const handleDelete = async (key: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await remove(ref(database, `specs/${key}`));
      setSpecs((prev) => prev.filter((spec) => spec.key !== key));
    }
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-6 space-y-4 w-full">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline self-start"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-2">📋 스펙 입력</h1>

      {/* 입력 영역 */}
      <div className="flex flex-wrap gap-2 justify-start w-full max-w-screen-lg">
        {fields.map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={form[key] || ''}
            onChange={handleChange}
            className="border p-1 rounded text-xs w-[80px]"
          />
        ))}
      </div>

      {/* 입력 버튼 */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        입력
      </button>

      {/* 테이블 */}
      <div className="overflow-x-auto w-full">
        <table className="text-sm border-collapse mt-4 mx-auto">
          <thead>
            <tr>
              {fields.map((key) => (
                <th key={key} className="border px-2 py-1 whitespace-nowrap">{key}</th>
              ))}
              <th className="border px-2 py-1">수정</th>
              <th className="border px-2 py-1">삭제</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.key} className="text-center">
                {fields.map((key) => (
                  <td key={key} className="border px-2 py-1 whitespace-nowrap">{spec[key] || ''}</td>
                ))}
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleEdit(spec)}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </button>
                </td>
                <td className="border px-2 py-1">
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
