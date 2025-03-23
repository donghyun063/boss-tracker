'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    class: '',
    nickname: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      email: user.email,
      ...form,
    });

    alert('가입이 완료되었습니다!');
    router.push('/');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">추가 정보 입력</h1>
      <div className="flex flex-col gap-2 w-full max-w-md">
        <input name="name" placeholder="이름" value={form.name} onChange={handleChange} className="border p-2 rounded" />
        <input name="age" placeholder="나이" value={form.age} onChange={handleChange} className="border p-2 rounded" />
        <input name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} className="border p-2 rounded" />
        <input name="class" placeholder="클래스" value={form.class} onChange={handleChange} className="border p-2 rounded" />
        <input name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} className="border p-2 rounded" />
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">가입 완료</button>
      </div>
    </main>
  );
}
