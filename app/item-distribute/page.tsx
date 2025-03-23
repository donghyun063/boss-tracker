'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function ItemDistributePage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    date: '',
    time: '',
    boss: '',
    item: '',
    distributeDate: '',
    nickname: '',
    type: '입금',
    amount: '',
  });
  const [records, setRecords] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, 'item-distribute');
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
        setRecords(parsed.reverse());
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const record = {
      ...form,
      amount: parseInt(form.amount) || 0,
    };

    const fundRecord = {
      date: form.distributeDate,
      amount: parseInt(form.amount) || 0,
      memo: `${form.boss} ${form.item} ${form.nickname}`,
      type: form.type,
      nickname: form.nickname || '',
    };

    if (editKey) {
      await update(ref(database, `item-distribute/${editKey}`), record);
      await push(ref(database, 'boss-fund'), fundRecord);
      setEditKey(null);
    } else {
      await push(ref(database, 'item-distribute'), record);
      await push(ref(database, 'boss-fund'), fundRecord);
    }

    setForm({
      date: '',
      time: '',
      boss: '',
      item: '',
      distributeDate: '',
      nickname: '',
      type: '입금',
      amount: '',
    });
  };

  const handleEdit = (record: any) => {
    setForm(record);
    setEditKey(record.key);
  };

  const handleDelete = async (key: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await remove(ref(database, `item-distribute/${key}`));
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push('/')} className="text-sm text-blue-600 underline mb-2">
        ← 대시보드로 돌아가기
      </button>

      <h1 className="text-xl font-bold">📦 아이템 분배 입력</h1>

      <div className="flex flex-wrap gap-2">
        {[
          { name: 'date', label: '날짜', placeholder: '예: 0324' },
          { name: 'time', label: '시간', placeholder: '예: 2130' },
          { name: 'boss', label: '보스명' },
          { name: 'item', label: '아이템' },
          { name: 'distributeDate', label: '분배날짜' },
          { name: 'nickname', label: '닉네임' },
          { name: 'amount', label: '금액' },
        ].map(({ name, label, placeholder }) => (
          <input
            key={name}
            name={name}
            placeholder={placeholder || label}
            value={form[name] || ''}
            onChange={handleChange}
            className="border p-1 text-sm w-24"
          />
        ))}
        <select name="type" value={form.type} onChange={handleChange} className="border p-1 text-sm w-20">
          <option value="입금">입금</option>
          <option value="출금">출금</option>
        </select>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
          {editKey ? '수정 완료' : '입력'}
        </button>
      </div>

      <table className="w-full text-sm border mt-6 table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">날짜</th>
            <th className="border p-2">시간</th>
            <th className="border p-2">보스</th>
            <th className="border p-2">아이템</th>
            <th className="border p-2">분배날짜</th>
            <th className="border p-2">금액</th>
            <th className="border p-2">닉네임</th>
            <th className="border p-2">유형</th>
            <th className="border p-2">수정</th>
            <th className="border p-2">삭제</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.key} className="text-center">
              <td className="border p-1">{r.date}</td>
              <td className="border p-1">{r.time}</td>
              <td className="border p-1">{r.boss}</td>
              <td className="border p-1">{r.item}</td>
              <td className="border p-1">{r.distributeDate}</td>
              <td className="border p-1">{r.amount?.toLocaleString()}</td>
              <td className="border p-1">{r.nickname}</td>
              <td className="border p-1">{r.type}</td>
              <td className="border p-1">
                <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline">수정</button>
              </td>
              <td className="border p-1">
                <button onClick={() => handleDelete(r.key)} className="text-red-500 hover:underline">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
