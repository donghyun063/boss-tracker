'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    class: '',
    nickname: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 데이터:', formData);
    // ✅ 여기서 Firebase에 데이터 저장 기능 추가 예정
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">추가 정보 입력</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input name="name" placeholder="이름" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="age" placeholder="나이" value={formData.age} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="phone" placeholder="전화번호" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="class" placeholder="클래스" value={formData.class} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="nickname" placeholder="닉네임" value={formData.nickname} onChange={handleChange} className="w-full border p-2 rounded" required />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">제출</button>
      </form>
    </main>
  );
}
