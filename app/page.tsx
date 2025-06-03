'use client';

import { useState, useEffect } from 'react';
import { processExcelFile, UserData } from '@/lib/excel-processor';
import LoginForm from '@/components/LoginForm';
import { isAuthenticated, logout } from '@/lib/auth';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<UserData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    // إعادة تعيين جميع المتغيرات
    setFile(null);
    setResult(null);
    setError(null);
    setShowInstructions(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('يرجى اختيار ملف Excel صالح (.xlsx أو .xls)');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const processedData = await processExcelFile(file);
      setResult(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في معالجة الملف');
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    
    const csvHeader = 'username,firstname,lastname,email,password\n';
    const csvContent = result.map(user => 
      `${user.username},${user.firstname},${user.lastname},${user.email},${user.password}`
    ).join('\n');
    
    const csvData = csvHeader + csvContent;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'himam_users.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // عرض التعليمات بعد التحميل
    setShowInstructions(true);
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setShowInstructions(false);
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  // عرض صفحة تسجيل الدخول إذا لم يكن مُسجلاً
  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                همم
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                أداة تحويل ملفات المستخدمين
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              منصة همم التعليمية - تحويل ملفات Excel إلى CSV
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            تسجيل خروج
          </button>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">1. رفع ملف Excel</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-700">✓ تم اختيار الملف:</p>
                  <p className="text-gray-900 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg text-gray-700">اسحب ملف Excel هنا أو</p>
                  <label className="inline-block cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    اختر ملف
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                الأنواع المدعومة: .xlsx, .xls (حتى 10 MB)
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="flex items-center">
                <svg className="h-5 w-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {file && !result && (
            <div className="mt-6">
              <button
                onClick={handleProcess}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري المعالجة...
                  </div>
                ) : (
                  'معالجة الملف وتحويله'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">2. نتائج التحويل</h2>
            
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p className="flex items-center">
                <svg className="h-5 w-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                تم تحويل {result.length} مستخدم بنجاح
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 border-b text-right text-sm font-medium text-gray-700">اسم المستخدم</th>
                    <th className="px-4 py-3 border-b text-right text-sm font-medium text-gray-700">الاسم الأول</th>
                    <th className="px-4 py-3 border-b text-right text-sm font-medium text-gray-700">الاسم الأخير</th>
                    <th className="px-4 py-3 border-b text-right text-sm font-medium text-gray-700">البريد الإلكتروني</th>
                    <th className="px-4 py-3 border-b text-right text-sm font-medium text-gray-700">كلمة المرور</th>
                  </tr>
                </thead>
                <tbody>
                  {result.slice(0, 5).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b text-sm text-gray-900">{user.username}</td>
                      <td className="px-4 py-3 border-b text-sm text-gray-900">{user.firstname}</td>
                      <td className="px-4 py-3 border-b text-sm text-gray-900">{user.lastname}</td>
                      <td className="px-4 py-3 border-b text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 border-b text-sm text-gray-900 font-mono">{user.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.length > 5 && (
              <p className="text-sm text-gray-600 mb-4">
                عرض أول 5 صفوف من {result.length} صف
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={downloadCSV}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                تحميل ملف CSV
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ملف جديد
              </button>
            </div>
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  خطوات رفع المستخدمين لمنصة همم
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">تم تحميل ملف himam_users.csv بنجاح!</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">لرفع المستخدمين إلى منصة همم:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>سجل دخول إلى لوحة تحكم منصة همم</li>
                    <li>اذهب إلى <strong>"إدارة الموقع"</strong></li>
                    <li>اختر <strong>"المستخدمون"</strong></li>
                    <li>انقر على <strong>"رفع مستخدمين"</strong></li>
                    <li>ارفع ملف <code>himam_users.csv</code> الذي حمّلته الآن</li>
                    <li>تأكد من مطابقة الأعمدة: username, firstname, lastname, email, password</li>
                    <li>انقر <strong>"استيراد"</strong> لإضافة المستخدمين</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">ملاحظات مهمة:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>كلمة المرور الموحدة لجميع المستخدمين: <code className="bg-yellow-100 px-1 rounded">himamedu1212</code></li>
                    <li>يمكن للمستخدمين تغيير كلمة المرور وأسماء المستخدمين لاحقاً</li>
                    <li>تأكد من صحة عناوين البريد الإلكتروني قبل الرفع</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  فهمت، إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm inline-block">
            <strong>محمي بنظام أمان:</strong> هذه الأداة متاحة فقط لإدارة منصة همم التعليمية
          </div>
        </div>
      </div>
    </div>
  );
} 