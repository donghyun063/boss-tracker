'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

interface ItemEntry {
  key?: string;
  date: string;
  time: string;
  boss: string;
  item: string;
  distributeDate: string;
  amount: string;
  nickname: string;
}

export default function ItemDistributePage() {
  const router = useRouter();
  const [form, setForm] = useState<ItemEntry>({
    date: '',
    time: '',
    boss: '',
    item: '',
    distributeDate: '',
    amount: '',
    nickname: '',
  });
  const [records, setRecords] = useState<ItemEntry[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  useEffect(() => {
    const refData = ref(database, 'item-distribution');
    onValue(refData, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({
          key,
          ...value,
        }));
        setRecords(parsed.reverse());
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const refData = ref(database, 'item-distribution');
    if (editKey) {
      await update(ref(database, `item-distribution/${editKey}`), form);
      setEditKey(null);
    } else {
      await push(refData, form);
    }
    setForm({
      date: '',
      time: '',
      boss: '',
      item: '',
      distributeDate: '',
      amount: '',
      nickname: '',
    });
  };

  const handleEdit = (entry: ItemEntry) => {
    setForm(entry);
    setEditKey(entry.key!);
  };

  const handleDelete = async (key: string) => {
    await remove(ref(database, `item-distribution/${key}`));
  };

  return (
    <main className="p-5 max-w-screen-xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 underline mb-4"
      >
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold mb-4">📦 아이템 분배 관리</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { name: 'date', placeholder: '날짜 (예: 0323)' },
          { name: 'time', placeholder: '시간 (예: 2130)' },
          { name: 'boss', placeholder: '보스명' },
          { name: 'item', placeholder: '아이템' },
          { name: 'distributeDate', placeholder: '분배날짜 (예: 0323)' },
          { name: 'amount', placeholder: '입금/출금액' },
          { name: 'nickname', placeholder: '닉네임' },
        ].map((field) => (
          <input
            key={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={form[field.name as keyof ItemEntry] || ''}
            onChange={handleChange}
            className="border p-1 text-sm w-[120px] text-center"
          />
        ))}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          {editKey ? '수정 완료' : '입력'}
        </button>
      </div>

      <table className="w-full border text-sm table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">날짜</th>
            <th className="border p-2">시간</th>
            <th className="border p-2">보스</th>
            <th className="border p-2">아이템</th>
            <th className="border p-2">분배날짜</th>
            <th className="border p-2">입금/출금액</th>
            <th className="border p-2">닉네임</th>
            <th className="border p-2">수정</th>
            <th className="border p-2">삭제</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.key} className="text-center">
              <td className="border px-2">{r.date}</td>
              <td className="border px-2">{r.time}</td>
              <td className="border px-2">{r.boss}</td>
              <td className="border px-2">{r.item}</td>
              <td className="border px-2">{r.distributeDate}</td>
              <td className="border px-2">{r.amount}</td>
              <td className="border px-2">{r.nickname}</td>
              <td className="border px-2 text-blue-600 cursor-pointer" onClick={() => handleEdit(r)}>수정</td>
              <td className="border px-2 text-red-500 cursor-pointer" onClick={() => handleDelete(r.key!)}>삭제</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
