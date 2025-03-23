'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { database, auth } from '@/lib/firebase';

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [funds, setFunds] = useState<{ date: string; amount: number; type: '입금' | '출금' }[]>([]);
  const [itemRecords, setItemRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ 관리자 여부 확인용

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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

      if (userInfo.role === 'admin') {
        setIsAdmin(true); // ✅ 관리자면 true
      }

      setLoading(false);

      const bossRef = ref(database, 'boss-records');
      onValue(bossRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
        setRecords(parsed.reverse());

        const filteredItems = parsed.filter((record: any) =>
          record.dropItems?.some((item: string) => !item.includes('희비')) && !record.winner
        );
        setItemRecords(filteredItems);
      });

      const fundRef = ref(database, 'boss-fund');
      onValue(fundRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const parsed = Object.values(data) as typeof funds;
        parsed.sort((a, b) => parseInt(b.date) - parseInt(a.date)).reverse();
        setFunds(parsed);
      });
    });

    return () => unsubscribeAuth();
  }, []);

  const getDateKey = (dateStr: string): number => {
    const match = dateStr.match(/(\d{1,2})월 (\d{1,2})일/);
    if (!match) return 0;
    const mm = match[1].padStart(2, '0');
    const dd = match[2].padStart(2, '0');
    return parseInt(mm + dd);
  };

  const filteredRecords = records.filter((record) => {
    const dateKey = getDateKey(record.date);
    const start = startDate ? parseInt(startDate) : 0;
    const end = endDate ? parseInt(endDate) : 9999;
    return dateKey >= start && dateKey <= end;
  });

  const participantCounts: Record<string, number> = {};
  filteredRecords.forEach((record) => {
    (record.participants || []).forEach((name: string) => {
      participantCounts[name] = (participantCounts[name] || 0) + 1;
    });
  });

  const totalParticipations = Object.values(participantCounts).reduce((a, b) => a + b, 0);
  const recentFunds = funds.slice(0, 5);
  const totalAmount = funds.reduce((sum, record) => {
    return record.type === '입금' ? sum + record.amount : sum - record.amount;
  }, 0);
  const heebiCount = records.reduce((count, record) => {
    return count + (record.dropItems?.filter((item: string) => item.includes('희비')).length || 0);
  }, 0);

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-6xl flex justify-between items-center">
        <h1 className="text-3xl font-bold">0000 혈 대시보드</h1>
        <div className="flex gap-2">
        // 대시보드 버튼 부분에 아래 코드 줄 추가
          <button onClick={() => router.push('/spec')} className="bg-orange-500 text-white px-4 py-2 rounded text-sm">📋 스펙 현황</button>
          <button onClick={() => router.push('/record')} className="bg-green-600 text-white px-4 py-2 rounded text-sm">+ 보스참여자 입력</button>
          <button onClick={() => router.push('/fund')} className="bg-blue-500 text-white px-4 py-2 rounded text-sm">💰 혈비 관리</button>
          <button onClick={() => router.push('/item-bid')} className="bg-purple-500 text-white px-4 py-2 rounded text-sm">📦 아이템 보유/입찰</button>
          {isAdmin && (
            <button onClick={() => router.push('/admin')} className="bg-red-500 text-white px-4 py-2 rounded text-sm">👑 관리자 승인</button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl border p-5 rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">보스 참여 순위</h2>
        <div className="flex gap-2 items-center mb-4">
          <input type="text" placeholder="시작일 (예: 0310)" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
          <span>~</span>
          <input type="text" placeholder="종료일 (예: 0322)" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <ul className="list-decimal pl-5 text-sm">
          {Object.entries(participantCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
            const rate = totalParticipations ? Math.round((count / totalParticipations) * 100) : 0;
            return <li key={name}><strong>{name}</strong>: {count}회 ({rate}%)</li>
          })}
          {Object.keys(participantCounts).length === 0 && <li>참여 기록이 없습니다.</li>}
        </ul>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border rounded shadow bg-white h-full">
          <h2 className="text-lg font-semibold mb-3">💰 혈비 관리</h2>
          <p className="font-bold text-blue-700 mb-2">잔액: {totalAmount.toLocaleString()} 다이아</p>
          <p className="text-sm font-semibold mb-1">최근 입출금 기록</p>
          <ul className="text-sm list-disc pl-4">
            {recentFunds.map((record, index) => (
              <li key={index}>
                {record.date} - {record.type} {record.amount.toLocaleString()} 다이아
              </li>
            ))}
            {recentFunds.length === 0 && <li>기록 없음</li>}
          </ul>
        </div>

        <div className="p-5 border rounded shadow bg-white h-full">
          <h2 className="text-lg font-semibold mb-3">📦 아이템 보유 현황</h2>
          <ul className="text-sm list-disc pl-4">
            {itemRecords.slice(0, 5).map((record) => (
              <li key={record.key}>
                {record.bossName} / {record.date} /
                <button
                  className="text-blue-600 underline hover:text-blue-800 ml-1"
                  onClick={() => router.push('/item-bid')}
                >
                  {record.dropItems.filter((item: string) => !item.includes('희비')).join(', ')}
                </button>
              </li>
            ))}
            {itemRecords.length === 0 && <li>아이템 기록 없음</li>}
          </ul>
        </div>

        <div className="p-5 border rounded shadow bg-white h-full">
          <h2 className="text-lg font-semibold mb-2">📘 희귀 제작 비법서</h2>
          <p>현재 보유 수량: <strong className="text-red-600">{heebiCount}</strong> 개</p>
        </div>
      </div>
    </main>
  );
}
