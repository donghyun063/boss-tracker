'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, update, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ItemBidPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [bids, setBids] = useState<Record<string, string[]>>({});
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<Record<string, string>>({});
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

      setLoading(false);
    });

    const bossRef = ref(database, 'boss-records');
    onValue(bossRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({
        key,
        ...value,
      }));
      const filtered = parsed.filter((record) =>
        record.dropItems?.some((item: string) => !item.includes('희비'))
      );
      setRecords(filtered);

      const bidsData: Record<string, string[]> = {};
      const winnersData: Record<string, string> = {};
      parsed.forEach((record: any) => {
        if (record.bids) {
          bidsData[record.key] = record.bids;
        }
        if (record.winner) {
          winnersData[record.key] = record.winner;
        }
      });
      setBids(bidsData);
      setWinners(winnersData);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (key: string, value: string) => {
    setInputValue((prev) => ({ ...prev, [key]: value }));
  };

  const handleBidSubmit = async (key: string) => {
    const name = inputValue[key]?.trim();
    if (!name) return;
    const newBids = [...(bids[key] || []), name];
    setBids((prev) => ({ ...prev, [key]: newBids }));
    setInputValue((prev) => ({ ...prev, [key]: '' }));
    setActiveInput(null);
    await update(ref(database, `boss-records/${key}`), { bids: newBids });
  };

  const handleCancelBid = async (key: string) => {
    const name = inputValue[key]?.trim();
    if (!name) return;
    const updatedBids = (bids[key] || []).filter((bidder) => bidder !== name);
    const updatedWinners = winners[key] === name ? '' : winners[key];
    setBids((prev) => ({ ...prev, [key]: updatedBids }));
    setWinners((prev) => ({ ...prev, [key]: updatedWinners }));
    setInputValue((prev) => ({ ...prev, [key]: '' }));
    await update(ref(database, `boss-records/${key}`), {
      bids: updatedBids,
      winner: updatedWinners,
    });
  };

  const handleSetWinner = async (key: string) => {
    const name = inputValue[key]?.trim();
    if (!name) return;
    setWinners((prev) => ({ ...prev, [key]: name }));
    await update(ref(database, `boss-records/${key}`), { winner: name });
  };

  if (loading) return <div className="text-center p-10">로딩 중...</div>;

  return (
    <main className="flex flex-col items-center p-10 space-y-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-6xl mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← 대시보드로 돌아가기
        </button>
      </div>

      <h1 className="text-2xl font-bold">📦 아이템 입찰 및 분배</h1>
      <div className="w-full max-w-6xl">
        {records.length === 0 ? (
          <p className="text-center text-gray-500">희비를 제외한 아이템 기록이 없습니다.</p>
        ) : (
          <table className="w-full border border-gray-300 table-fixed">
            <colgroup>
              <col className="w-1/7" />
              <col className="w-1/4" />
              <col className="w-1/2" />
              <col className="w-1/6" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">보스명</th>
                <th className="border p-2">날짜</th>
                <th className="border p-2">참여자</th>
                <th className="border p-2">아이템</th>
                <th className="border p-2">입찰</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.key} className="text-center">
                  <td className="border p-2 whitespace-nowrap">{record.bossName}</td>
                  <td className="border p-2 whitespace-nowrap">{record.date}</td>
                  <td className="border p-2 text-left">{record.participants?.join(', ')}</td>
                  <td className="border p-2 text-left">
                    {record.dropItems.filter((item: string) => !item.includes('희비')).join(', ')}
                  </td>
                  <td className="border p-2 text-left align-top">
                    <div className="flex gap-1 items-center mb-2">
                      <input
                        type="text"
                        value={inputValue[record.key] || ''}
                        onChange={(e) => handleInputChange(record.key, e.target.value)}
                        className="border px-2 py-1 rounded w-24 text-sm"
                        placeholder="이름 입력"
                      />
                      <button
                        onClick={() => handleBidSubmit(record.key)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        입찰
                      </button>
                      <button
                        onClick={() => handleCancelBid(record.key)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSetWinner(record.key)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        낙찰
                      </button>
                    </div>
                    {(bids[record.key]?.length > 0 || winners[record.key]) && (
                      <div className="text-sm">
                        {bids[record.key]?.length > 0 && (
                          <div className="mb-1">
                            <strong>입찰자:</strong> {bids[record.key].join(', ')}
                          </div>
                        )}
                        {winners[record.key] && (
                          <div>
                            <strong className="text-green-700">낙찰자:</strong> {winners[record.key]}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
