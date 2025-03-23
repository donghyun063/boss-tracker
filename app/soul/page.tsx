'use client';

import { useEffect, useState } from 'react';

const bosses = [
  '메두사', '티미트리스', '사반', '트롬바', '베히모스', '탈라킨', '체르투바',
  '판드', '카탄', '사르카', '마투라', '엔쿠라', '템페스트', '톨크루마', '가레스',
  '브레카', '탈킨', '스탄', '오크', '바실라', '란도르', '글라키', '히실로메',
  '망각의거울', '실라', '무프', '노르무스', '우칸바'
];

export default function SoulPage() {
  const [form, setForm] = useState<{ id: string; [key: string]: boolean }>({ id: '' });
  const [list, setList] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('soul_list');
    if (saved) {
      setList(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('soul_list', JSON.stringify(list));
  }, [list]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!form.id) return alert('아이디를 입력하세요.');
    if (editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = form;
      setList(updated);
      setEditIndex(null);
    } else {
      setList(prev => [...prev, form]);
    }
    setForm({ id: '' });
  };

  const handleEdit = (index: number) => {
    setForm(list[index]);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  return (
    <main className="p-6">
      <button
        onClick={() => window.history.back()}
        className="text-sm text-blue-600 underline mb-4 block"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-4">🧿 집혼 현황</h1>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          name="id"
          value={form.id || ''}
          onChange={handleChange}
          placeholder="아이디"
          className="border px-2 py-1 rounded w-28"
        />
        {bosses.map(boss => (
          <label key={boss} className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              name={boss}
              checked={form[boss] || false}
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

      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1 whitespace-nowrap">아이디</th>
              {bosses.map(boss => (
                <th key={boss} className="border p-1 whitespace-nowrap">{boss}</th>
              ))}
              <th className="border p-1 whitespace-nowrap">수정</th>
              <th className="border p-1 whitespace-nowrap">삭제</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user, index) => (
              <tr key={index} className="text-center">
                <td className="border p-1 whitespace-nowrap">{user.id}</td>
                {bosses.map(boss => (
                  <td key={boss} className="border p-1 whitespace-nowrap">
                    {user[boss] ? '✅' : ''}
                  </td>
                ))}
                <td className="border p-1">
                  <button onClick={() => handleEdit(index)} className="text-blue-600 hover:underline">수정</button>
                </td>
                <td className="border p-1">
                  <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
