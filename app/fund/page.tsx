'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function FundPage() {
  const router = useRouter();

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [type, setType] = useState<'입금' | '출금'>('입금');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [funds, setFunds] = useState<{
    key: string;
    date: string;
    amount: number;
    memo: string;
    type: '입금' | '출금';
  }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fundRef = ref(database, 'boss-fund');
    onValue(fundRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        key,
        ...(value as any),
      })) as typeof funds;
      parsed.sort((a, b) => parseInt(b.date) - parseInt(a.date));
      setFunds(parsed);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount);
    if (!date || isNaN(parsedAmount)) return alert('날짜와 금액을 정확히 입력하세요.');

    const newRecord = { date, amount: parsedAmount, memo, type };
    const fundRef = ref(database, 'boss-fund');

    try {
      if (editKey) {
        await update(ref(database, `boss-fund/${editKey}`), newRecord);
        setEditKey(null);
      } else {
        await push(fundRef, newRecord);
      }
      setDate('');
      setAmount('');
      setMemo('');
      setType('입금');
    } catch (err) {
      alert('저장 실패!');
      console.error(err);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await remove(ref(database, `boss-fund/${key}`));
  };

  const handleEdit = (record: (typeof funds)[0]) => {
    setDate(record.date);
    setAmount(record.amount.toString());
    setMemo(record.memo);
    setType(record.type);
    setEditKey(record.key);
  };

  const filteredFunds = funds.filter((f) => {
    if (startDate && f.date < startDate) return false;
    if (endDate && f.date > endDate) return false;
    return true;
  });

  const totalAmount = filteredFunds.reduce((sum, record) => {
    return record.type === '입금' ? sum + record.amount : sum - record.amount;
  }, 0);

  return (
    <main className="flex flex-col items-center p-10 space-y-8">
      <div className="w-full max-w-4xl mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>

      <h1 className="text-3xl font-bold">혈비 입출금 기록</h1>

      <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-xl">
        <input
          type="text"
          placeholder="날짜 (예: 0322)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="금액 (숫자만)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="메모 (예: 보스 드롭 분배)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('입금')}
            className={`px-4 py-2 rounded text-white ${type === '입금' ? 'bg-green-600' : 'bg-gray-400'}`}
          >
            입금
          </button>
          <button
            type="button"
            onClick={() => setType('출금')}
            className={`px-4 py-2 rounded text-white ${type === '출금' ? 'bg-red-600' : 'bg-gray-400'}`}
          >
            출금
          </button>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          {editKey ? '수정 완료' : '기록 저장'}
        </button>
      </form>

      <div className="flex gap-4 w-full max-w-xl">
        <input
          type="text"
          placeholder="시작일 (예: 0322)"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="종료일 (예: 0325)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="w-full max-w-xl text-right font-semibold">
        현재 잔액: <span className="text-blue-600">{totalAmount.toLocaleString()} 다이아</span>
      </div>

      <div className="w-full max-w-4xl">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 w-24">날짜</th>
              <th className="border p-2 w-32">금액</th>
              <th className="border p-2">메모</th>
              <th className="border p-2 w-20">유형</th>
              <th className="border p-2 w-28">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredFunds.map((record) => (
              <tr key={record.key} className="text-center">
                <td className="border p-2">{record.date}</td>
                <td className="border p-2">{record.amount.toLocaleString()} 다이아</td>
                <td className="border p-2 text-left">{record.memo}</td>
                <td className="border p-2">{record.type}</td>
                <td className="border p-2">
                  <div className="flex justify-center gap-3 whitespace-nowrap">
                    <button onClick={() => handleEdit(record)} className="text-blue-600 underline">
                      수정
                    </button>
                    <button onClick={() => handleDelete(record.key)} className="text-red-600 underline">
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
