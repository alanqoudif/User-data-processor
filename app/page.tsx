'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Users, CheckCircle, AlertCircle, Loader2, X, Info, ArrowRight, Key, User } from 'lucide-react';
import { processExcelFile, convertToCSV, downloadCSV, UserRecord, ProcessingResult } from '@/lib/excel-processor';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processedData, setProcessedData] = useState<UserRecord[]>([]);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setProcessedData([]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setResult(null);
      setProcessedData([]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const result = await processExcelFile(file);
      setResult(result);
      if (result.success && result.data) {
        // تحديث كلمات المرور لتكون himamedu1212
        const updatedData = result.data.map(user => ({
          ...user,
          password: 'himamedu1212'
        }));
        setProcessedData(updatedData);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'حدث خطأ غير متوقع أثناء معالجة الملف'
      });
    }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (processedData.length > 0) {
      const csvContent = convertToCSV(processedData);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCSV(csvContent, `himam_users_${timestamp}.csv`);
      
      // عرض popup التعليمات بعد التحميل
      setShowInstructionsModal(true);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setProcessedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Modal للتعليمات
  const InstructionsModal = () => {
    if (!showInstructionsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">كيفية رفع المستخدمين في منصة همم التعليمية</h2>
                  <p className="text-gray-600">اتبع الخطوات التالية لإضافة المستخدمين الجدد</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* خطوات الرفع */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  خطوات رفع المستخدمين:
                </h3>
                <div className="space-y-4">
                  {[
                    { step: 1, text: "سجل دخولك بحساب الأدمن في منصة همم التعليمية" },
                    { step: 2, text: "اذهب إلى قسم «إدارة الموقع»" },
                    { step: 3, text: "انقر على «المستخدمون»" },
                    { step: 4, text: "اختر «قسم رفع المستخدمين»" },
                    { step: 5, text: "اسحب الملف المحمل وأفلته في المنطقة المكتوب فيها «تستطيع سحب وإفلات الملفات هنا لإضافتها»" },
                    { step: 6, text: "انقر على «رفع المستخدمين»" },
                    { step: 7, text: "تأكد من جميع بيانات المستخدمين قبل التأكيد النهائي" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {item.step}
                      </div>
                      <p className="text-gray-700 pt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* معلومات كلمة المرور */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  معلومات مهمة عن كلمات المرور:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-gray-700 font-medium">كلمة المرور الافتراضية لجميع المستخدمين:</p>
                      <div className="bg-gray-100 rounded-lg p-3 mt-2 font-mono text-lg text-center">
                        <code className="text-blue-600 font-bold">himamedu1212</code>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-gray-700">
                      <strong>ملاحظة:</strong> يمكن للمستخدمين تغيير كلمة المرور واسم المستخدم بأنفسهم بعد تسجيل الدخول لأول مرة
                    </p>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">✅ تم إعداد الملف بنجاح!</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>عدد المستخدمين:</strong> {processedData.length}</p>
                    <p><strong>تنسيق الملف:</strong> CSV</p>
                  </div>
                  <div>
                    <p><strong>كلمة المرور:</strong> himamedu1212</p>
                    <p><strong>أسماء المستخدمين:</strong> فريدة ومحولة للإنجليزية</p>
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                فهمت، إغلاق النافذة
              </button>
              <button
                onClick={() => {
                  const csvContent = convertToCSV(processedData);
                  const timestamp = new Date().toISOString().slice(0, 10);
                  downloadCSV(csvContent, `himam_users_${timestamp}.csv`);
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                تحميل الملف مرة أخرى
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-4">
          <FileSpreadsheet className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">معالج بيانات المستخدمين</h1>
        </div>
        <p className="text-gray-600 text-lg">
          حول ملفات Excel إلى CSV لرفعها في منصة همم التعليمية
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <p className="text-blue-800 font-medium">
            🎓 أداة مخصصة لمنصة همم التعليمية - إنشاء ملفات المستخدمين بتنسيق محدد
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          رفع الملف
        </h2>

        {!file ? (
          <div
            className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-xl text-gray-700 mb-2">اسحب ملف Excel هنا أو انقر للاختيار</p>
            <p className="text-gray-500">ملفات Excel (.xlsx, .xls) مدعومة</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                  </p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                إزالة
              </button>
            </div>
          </div>
        )}

        {file && !processing && !result && (
          <div className="mt-6 text-center">
            <button
              onClick={handleProcess}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <Users className="w-5 h-5" />
              معالجة الملف
            </button>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {processing && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">جاري معالجة الملف...</h3>
            <p className="text-gray-600">يرجى الانتظار أثناء تحليل البيانات وإعداد كلمات المرور</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {result.success ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-semibold text-gray-800">تمت المعالجة بنجاح!</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.originalRowCount}</p>
                  <p className="text-gray-600">الصفوف الأصلية</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{result.processedRowCount}</p>
                  <p className="text-gray-600">المستخدمين المعالجين</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-purple-600">himamedu1212</p>
                  <p className="text-gray-600">كلمة المرور الموحدة</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">CSV</p>
                  <p className="text-gray-600">التنسيق الناتج</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  تحميل ملف CSV للمنصة
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-semibold text-gray-800">خطأ في المعالجة</h3>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-red-700">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Table */}
      {processedData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">معاينة البيانات</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto ltr">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Username</th>
                  <th className="px-4 py-3 text-left font-semibold">First Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Password</th>
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, 10).map((user, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 font-mono text-sm">{user.username}</td>
                    <td className="px-4 py-3">{user.firstname}</td>
                    <td className="px-4 py-3">{user.lastname}</td>
                    <td className="px-4 py-3 font-mono text-sm">{user.email}</td>
                    <td className="px-4 py-3 font-mono text-sm text-blue-600 font-semibold">{user.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {processedData.length > 10 && (
              <p className="text-center text-gray-500 mt-4">
                ... وعرض أول 10 سجلات من أصل {processedData.length} سجل
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">كيفية الاستخدام</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">الخطوات:</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>ارفع ملف Excel يحتوي على بيانات المستخدمين</li>
              <li>انقر على "معالجة الملف" لتحليل البيانات</li>
              <li>راجع النتائج والمعاينة</li>
              <li>حمل ملف CSV المجهز لمنصة همم</li>
              <li>اتبع التعليمات لرفع الملف في المنصة</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">التنسيق الناتج:</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>username:</strong> اسم المستخدم (مُحول من العربية للإنجليزية)</li>
              <li>• <strong>firstname:</strong> الاسم الأول</li>
              <li>• <strong>lastname:</strong> الاسم الأخير</li>
              <li>• <strong>email:</strong> البريد الإلكتروني</li>
              <li>• <strong>password:</strong> himamedu1212 (موحدة لجميع المستخدمين)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal للتعليمات */}
      <InstructionsModal />
    </div>
  );
} 