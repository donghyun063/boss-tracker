'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function FundPage() {
  const router = useRouter();

  const [userApproved, setUserApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [type, setType] = useState<'입금' | '출금'>('입금');
  const [funds, setFunds] = useState<{
    date: string;
    amount: number;
    memo: string;
    type: '입금' | '출금';
  }[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userInfo = snapshot.val();

      if (!userInfo || !userInfo.approval) {
        alert('관리자 승인이 필요합니다.');
        router.push('/login');
        return;
      }

      setUserApproved(true);
      setLoading(false);

      const fundRef = ref(database, 'boss-fund');
      onValue(fundRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const parsed = Object.values(data) as typeof funds;
        setFunds(parsed.reverse());
      });
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount);
    if (!date || isNaN(parsedAmount)) return alert('날짜와 금액을 정확히 입력하세요.');

    const newRecord = { date, amount: parsedAmount, memo, type };

    try {
      const fundRef = ref(database, 'boss-fund');
      await push(fundRef, newRecord);
      alert('저장 완료!');
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장 실패!');
    }

    setDate('');
    setAmount('');
    setMemo('');
    setType('입금');
  };

  const totalAmount = funds.reduce((sum, record) => {
    return record.type === '입금' ? sum + record.amount : sum - record.amount;
  }, 0);

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

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
          기록 저장
        </button>
      </form>

      <div className="w-full max-w-xl text-right font-semibold">
        현재 잔액: <span className="text-blue-600">{totalAmount.toLocaleString()} 아데나</span>
      </div>

      <div className="w-full max-w-4xl">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">날짜</th>
              <th className="border p-2">금액</th>
              <th className="border p-2">메모</th>
              <th className="border p-2">유형</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((record, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">{record.date}</td>
                <td className="border p-2">{record.amount.toLocaleString()} 아데나</td>
                <td className="border p-2 text-left">{record.memo}</td>
                <td className="border p-2">{record.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
