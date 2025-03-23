'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, onValue, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RecordPage() {
  const router = useRouter();
  const [bossName, setBossName] = useState('');
  const [rawDate, setRawDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [dropItems, setDropItems] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
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

    const recordRef = ref(database, 'boss-records');
    onValue(recordRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const parsed = Object.entries(data).map(([key, value]: any) => ({ key, ...value }));
      setRecords(parsed.reverse());
    });

    return () => unsubscribe();
  }, [router]);

  const parseDateString = (str: string) => {
    if (str.length !== 8) return '잘못된 형식';
    const year = new Date().getFullYear();
    const month = parseInt(str.slice(0, 2), 10);
    const day = parseInt(str.slice(2, 4), 10);
    const hour = parseInt(str.slice(4, 6), 10);
    const minute = parseInt(str.slice(6, 8), 10);
    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
  };

  const convertToRawDate = (formatted: string): string => {
    const regex = /\d{4}년 (\d{1,2})월 (\d{1,2})일 (\d{1,2})시 (\d{1,2})분/;
    const match = formatted.match(regex);
    if (!match) return '';
    const [, mm, dd, hh, mi] = match;
    return `${mm.padStart(2, '0')}${dd.padStart(2, '0')}${hh.padStart(2, '0')}${mi.padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      bossName,
      date: parseDateString(rawDate),
      participants: participants.split(',').map((p) => p.trim()),
      dropItems: dropItems.split(',').map((i) => i.trim()),
    };

    if (editIndex !== null) {
      const updated = [...records];
      updated[editIndex] = newRecord;
      setRecords(updated);
      setEditIndex(null);
    } else {
      const recordRef = ref(database, 'boss-records');
      await push(recordRef, newRecord);
    }

    setBossName('');
    setRawDate('');
    setParticipants('');
    setDropItems('');
  };

  const handleEdit = (index: number) => {
    const record = records[index];
    setBossName(record.bossName);
    setRawDate(convertToRawDate(record.date));
    setParticipants(record.participants.join(', '));
    setDropItems(record.dropItems.join(', '));
    setEditIndex(index);
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

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

      <h1 className="text-3xl font-bold">보스 참여자 입력</h1>

      <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-2xl">
        <input
          type="text"
          placeholder="보스 이름"
          value={bossName}
          onChange={(e) => setBossName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="월일시분 (예: 03222130)"
          value={rawDate}
          onChange={(e) => setRawDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="참여자 이름 (쉼표로 구분)"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="드롭 아이템 (쉼표로 구분)"
          value={dropItems}
          onChange={(e) => setDropItems(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {editIndex !== null ? '수정 완료' : '기록 저장'}
        </button>
      </form>

      <div className="w-full max-w-6xl mt-10">
        <h2 className="text-xl font-semibold mb-3">처치 기록</h2>
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">보스명</th>
              <th className="border p-2">날짜시간</th>
              <th className="border p-2">참여자</th>
              <th className="border p-2">드롭 아이템</th>
              <th className="border p-2">수정</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2 whitespace-nowrap">{record.bossName}</td>
                <td className="border p-2 whitespace-nowrap">{record.date}</td>
                <td className="border p-2 text-left">{record.participants.join(', ')}</td>
                <td className="border p-2 text-left">{record.dropItems.join(', ')}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:underline"
                  >
                    수정
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
