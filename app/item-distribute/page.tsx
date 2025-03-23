'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, update,remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function ItemDistributePage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    date: '',
    time: '',
    boss: '',
    item: '',
    distributeDate: '',
    amount: '',
    type: '입금',
    nickname: '',
  });
  const [records, setRecords] = useState<any[]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);

  useEffect(() => {
    const distRef = ref(database, 'item-distribute');
    onValue(distRef, (snapshot) => {
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
    if (!form.date || !form.boss || !form.item || !form.nickname || !form.amount) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const newRecord = { ...form };

    if (editKey) {
      await update(ref(database, `item-distribute/${editKey}`), newRecord);
      setEditKey(null);
    } else {
      await push(ref(database, 'item-distribute'), newRecord);
    }

    // ✅ 자동 혈비 반영
    await push(ref(database, 'boss-fund'), {
      date: form.date,
      amount: Number(form.amount),
      type: form.type,
      note: `[${form.boss}] ${form.item} / ${form.nickname}`,
    });

    setForm({
      date: '',
      time: '',
      boss: '',
      item: '',
      distributeDate: '',
      amount: '',
      type: '입금',
      nickname: '',
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

      {/* 입력 폼 */}
      <div className="flex flex-wrap gap-2">
        <input name="date" value={form.date} onChange={handleChange} placeholder="날짜 (예: 0324)" className="border p-1 text-sm w-24" />
        <input name="time" value={form.time} onChange={handleChange} placeholder="시간 (예: 21:30)" className="border p-1 text-sm w-24" />
        <input name="boss" value={form.boss} onChange={handleChange} placeholder="보스명" className="border p-1 text-sm w-24" />
        <input name="item" value={form.item} onChange={handleChange} placeholder="아이템" className="border p-1 text-sm w-32" />
        <input name="distributeDate" value={form.distributeDate} onChange={handleChange} placeholder="분배날짜" className="border p-1 text-sm w-24" />
        <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임" className="border p-1 text-sm w-24" />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="금액" className="border p-1 text-sm w-24" />
        <select name="type" value={form.type} onChange={handleChange} className="border p-1 text-sm w-20">
          <option value="입금">입금</option>
          <option value="출금">출금</option>
        </select>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">
          {editKey ? '수정 완료' : '입력'}
        </button>
      </div>

      {/* 출력 리스트 */}
      <table className="w-full mt-6 text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">날짜</th>
            <th className="border p-2">시간</th>
            <th className="border p-2">보스</th>
            <th className="border p-2">아이템</th>
            <th className="border p-2">분배날짜</th>
            <th className="border p-2">닉네임</th>
            <th className="border p-2">금액</th>
            <th className="border p-2">입출금</th>
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
              <td className="border p-1">{r.nickname}</td>
              <td className="border p-1">{r.amount}</td>
              <td className="border p-1">{r.type}</td>
              <td className="border p-1 text-blue-600 cursor-pointer" onClick={() => handleEdit(r)}>수정</td>
              <td className="border p-1 text-red-500 cursor-pointer" onClick={() => handleDelete(r.key)}>삭제</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
