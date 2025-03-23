'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export default function SignupPage() {
  const router = useRouter();
  const auth = getAuth();

  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    class: '',
    nickname: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // Firebase Realtime Database에 저장
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      ...form,
    });

    alert('가입이 완료되었습니다!');
    router.push('/'); // 대시보드로 이동
  };

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">추가 정보 입력</h1>
      <input name="name" placeholder="이름" className="border p-2 mb-2 w-full" onChange={handleChange} />
      <input name="age" placeholder="나이" className="border p-2 mb-2 w-full" onChange={handleChange} />
      <input name="phone" placeholder="전화번호" className="border p-2 mb-2 w-full" onChange={handleChange} />
      <input name="class" placeholder="클래스" className="border p-2 mb-2 w-full" onChange={handleChange} />
      <input name="nickname" placeholder="닉네임" className="border p-2 mb-2 w-full" onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">가입 완료</button>
    </main>
  );
}
