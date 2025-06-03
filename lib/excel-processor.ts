import * as XLSX from 'xlsx';
import { generateUniqueUsername } from './transliteration';

export interface UserRecord {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface ProcessingResult {
  success: boolean;
  data?: UserRecord[];
  error?: string;
  originalRowCount?: number;
  processedRowCount?: number;
}

// وظيفة لتنظيف وتطبيع النصوص
function normalizeText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text).trim();
}

// كلمة المرور الافتراضية لمنصة همم التعليمية
const DEFAULT_PASSWORD = 'himamedu1212';

// وظيفة لإنشاء كلمة مرور عشوائية (احتياطية فقط)
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// وظيفة للتحقق من صحة البريد الإلكتروني
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// وظيفة لمحاولة تحديد أعمدة البيانات من الرؤوس
function detectColumns(headers: string[]): { [key: string]: number } {
  const columnMap: { [key: string]: number } = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // البحث عن أعمدة الاسم الأول
    if (normalizedHeader.includes('first') || normalizedHeader.includes('الاسم الأول') || 
        normalizedHeader.includes('اسم') || normalizedHeader === 'name' ||
        normalizedHeader.includes('fname') || normalizedHeader.includes('given')) {
      columnMap.firstname = index;
    }
    
    // البحث عن أعمدة الاسم الأخير
    if (normalizedHeader.includes('last') || normalizedHeader.includes('الاسم الأخير') || 
        normalizedHeader.includes('العائلة') || normalizedHeader.includes('surname') ||
        normalizedHeader.includes('lname') || normalizedHeader.includes('family')) {
      columnMap.lastname = index;
    }
    
    // البحث عن أعمدة البريد الإلكتروني
    if (normalizedHeader.includes('email') || normalizedHeader.includes('mail') ||
        normalizedHeader.includes('بريد') || normalizedHeader.includes('إيميل')) {
      columnMap.email = index;
    }
    
    // البحث عن أعمدة كلمة المرور
    if (normalizedHeader.includes('password') || normalizedHeader.includes('pass') ||
        normalizedHeader.includes('كلمة المرور') || normalizedHeader.includes('رقم سري')) {
      columnMap.password = index;
    }
  });
  
  return columnMap;
}

export function processExcelFile(file: File): Promise<ProcessingResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // قراءة أول ورقة عمل
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // تحويل البيانات إلى JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          resolve({
            success: false,
            error: 'الملف يجب أن يحتوي على صف رؤوس وصف بيانات واحد على الأقل'
          });
          return;
        }
        
        const headers = jsonData[0].map(h => normalizeText(h));
        const rows = jsonData.slice(1);
        
        // محاولة تحديد الأعمدة تلقائياً
        const columnMap = detectColumns(headers);
        
        const existingUsernames = new Set<string>();
        const processedData: UserRecord[] = [];
        
        rows.forEach((row, index) => {
          // تخطي الصفوف الفارغة
          if (!row || row.every(cell => !normalizeText(cell))) {
            return;
          }
          
          let firstname = '';
          let lastname = '';
          let email = '';
          let password = '';
          
          // استخراج البيانات بناءً على التحديد التلقائي أو الترتيب
          if (columnMap.firstname !== undefined) {
            firstname = normalizeText(row[columnMap.firstname]);
          } else if (row[0]) {
            firstname = normalizeText(row[0]);
          }
          
          if (columnMap.lastname !== undefined) {
            lastname = normalizeText(row[columnMap.lastname]);
          } else if (row[1]) {
            lastname = normalizeText(row[1]);
          }
          
          if (columnMap.email !== undefined) {
            email = normalizeText(row[columnMap.email]);
          } else {
            // البحث عن البريد الإلكتروني في الصف
            const emailCell = row.find(cell => {
              const cellText = normalizeText(cell);
              return isValidEmail(cellText);
            });
            if (emailCell) {
              email = normalizeText(emailCell);
            }
          }
          
          if (columnMap.password !== undefined) {
            password = normalizeText(row[columnMap.password]);
          }
          
          // التحقق من البيانات الأساسية
          if (!firstname && !lastname) {
            return; // تخطي إذا لم يكن هناك اسم
          }
          
          // استخدام كلمة المرور الافتراضية لمنصة همم التعليمية
          // إذا لم تكن موجودة أو فارغة، استخدم الافتراضية
          if (!password) {
            password = DEFAULT_PASSWORD;
          }
          
          // إنشاء اسم مستخدم فريد
          const username = generateUniqueUsername(firstname || lastname, existingUsernames);
          existingUsernames.add(username);
          
          processedData.push({
            username,
            firstname: firstname || '',
            lastname: lastname || '',
            email: email || '',
            password
          });
        });
        
        resolve({
          success: true,
          data: processedData,
          originalRowCount: rows.length,
          processedRowCount: processedData.length
        });
        
      } catch (error) {
        resolve({
          success: false,
          error: `خطأ في معالجة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'خطأ في قراءة الملف'
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function convertToCSV(data: UserRecord[]): string {
  // إنشاء صف الرؤوس
  const headers = ['username', 'firstname', 'lastname', 'email', 'password'];
  
  // تحويل البيانات إلى صفوف CSV
  const rows = data.map(record => [
    record.username,
    record.firstname,
    record.lastname,
    record.email,
    record.password
  ]);
  
  // دمج الرؤوس والبيانات
  const allRows = [headers, ...rows];
  
  // تحويل إلى CSV
  return allRows.map(row => 
    row.map(field => {
      // إضافة علامات اقتباس إذا كان الحقل يحتوي على فاصلة أو سطر جديد
      if (field.includes(',') || field.includes('\n') || field.includes('"')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    }).join(',')
  ).join('\n');
}

export function downloadCSV(csvContent: string, filename: string = 'himam_users.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 