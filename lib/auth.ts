// نظام المصادقة البسيط لمنصة همم التعليمية
import CryptoJS from 'crypto-js';

// كلمة المرور المشفرة للإدارة (himam_admin_2024)
const ADMIN_PASSWORD_HASH = 'U2FsdGVkX1+8QWF5H8uH2qHzZwxJ3K9L5M7N3P1Q6R9S';
const SECRET_KEY = 'himam_educational_platform_2024';

export interface AuthState {
  isAuthenticated: boolean;
  timestamp: number;
  role: 'admin' | null;
}

// تشفير كلمة المرور
function hashPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}

// فك تشفير كلمة المرور
function decryptPassword(hash: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(hash, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

// التحقق من كلمة المرور
export function verifyPassword(password: string): boolean {
  const decryptedAdminPassword = decryptPassword(ADMIN_PASSWORD_HASH);
  return password === decryptedAdminPassword || password === 'himam_admin_2024';
}

// حفظ حالة تسجيل الدخول
export function setAuthState(isAuthenticated: boolean): void {
  if (typeof window === 'undefined') return;
  
  const authState: AuthState = {
    isAuthenticated,
    timestamp: Date.now(),
    role: isAuthenticated ? 'admin' : null
  };
  
  localStorage.setItem('himam_auth', JSON.stringify(authState));
}

// جلب حالة تسجيل الدخول
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, timestamp: 0, role: null };
  }
  
  try {
    const authData = localStorage.getItem('himam_auth');
    if (!authData) {
      return { isAuthenticated: false, timestamp: 0, role: null };
    }
    
    const authState: AuthState = JSON.parse(authData);
    
    // التحقق من انتهاء الجلسة (24 ساعة)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - authState.timestamp > twentyFourHours;
    
    if (isExpired) {
      logout();
      return { isAuthenticated: false, timestamp: 0, role: null };
    }
    
    return authState;
  } catch {
    return { isAuthenticated: false, timestamp: 0, role: null };
  }
}

// تسجيل الخروج
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('himam_auth');
}

// التحقق من تسجيل الدخول
export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
} 