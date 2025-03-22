// components/FundSummary.tsx
'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function FundSummary() {
  const [funds, setFunds] = useState<{
    date: string;
    amount: number;
    type: '입금' | '출금';
  }[]>([]);

  useEffect(() => {
    const fundRef = ref(database, 'boss-fund');
    onValue(fundRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.values(data) as typeof funds;
      parsed.sort((a, b) => parseInt(b.date) - parseInt(a.date)).reverse();
      setFunds(parsed);
    });
  }, []);

  const recentFunds = funds.slice(0, 5);

  const totalAmount = funds.reduce((sum, record) => {
    return record.type === '입금' ? sum + record.amount : sum - record.amount;
  }, 0);

  return (
    <div className="p-5 border rounded shadow bg-white h-full">
      <h2 className="text-lg font-semibold mb-3">💰 혈 비 관리</h2>
      <p className="font-bold text-blue-700 mb-2">잔액: {totalAmount.toLocaleString()} 다이아</p>
      <p className="text-sm font-semibold mb-1">최근 입출금 기록</p>
      <ul className="text-sm list-disc pl-4">
        {recentFunds.map((record, index) => (
          <li key={index}>
            {record.date} - {record.type === '출금' ? '-' : ''}{record.amount.toLocaleString()} 다이아
          </li>
        ))}
        {recentFunds.length === 0 && <li>기록 없음</li>}
      </ul>
    </div>
  );
}
