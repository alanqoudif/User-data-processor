'use client';

import { useState } from 'react';
import { verifyPassword, setAuthState } from '@/lib/auth';

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // محاكاة تأخير للأمان
    await new Promise(resolve => setTimeout(resolve, 500));

    if (verifyPassword(password)) {
      setAuthState(true);
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
            همم
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            تسجيل دخول الإدارة
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            أداة تحويل ملفات المستخدمين - منصة همم التعليمية
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="أدخل كلمة مرور الإدارة"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التحقق...
                  </div>
                ) : (
                  'دخول إلى الأداة'
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                هذه الأداة مخصصة لإدارة منصة همم التعليمية فقط
              </p>
            </div>
          </div>
        </form>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <strong>ملاحظة أمنية:</strong> كلمة المرور صالحة لمدة 24 ساعة، بعدها ستحتاج لإعادة تسجيل الدخول
          </div>
        </div>
      </div>
    </div>
  );
} 