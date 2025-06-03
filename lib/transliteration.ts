// خريطة تحويل الأحرف العربية إلى إنجليزية
const arabicToEnglishMap: { [key: string]: string } = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
  'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'th',
  'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
  'ة': 'h', 'ء': 'a', 'ؤ': 'w', 'ئ': 'y',
  'ً': '', 'ٌ': '', 'ٍ': '', 'َ': '', 'ُ': '', 'ِ': '',
  'ّ': '', 'ْ': '', 'ـ': '', ' ': '_'
};

export function transliterateArabicToEnglish(text: string): string {
  if (!text) return '';
  
  // التحقق من وجود أحرف عربية
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  
  // إذا لم يكن النص يحتوي على أحرف عربية، ارجع النص كما هو
  if (!hasArabic) {
    return text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  }
  
  let result = '';
  
  for (let char of text) {
    if (arabicToEnglishMap[char]) {
      result += arabicToEnglishMap[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (char === ' ') {
      result += '_';
    }
  }
  
  // تنظيف النتيجة
  result = result.replace(/_{2,}/g, '_'); // استبدال أكثر من شرطة سفلية بشرطة واحدة
  result = result.replace(/^_|_$/g, ''); // إزالة الشرطات من البداية والنهاية
  
  return result || 'user';
}

export function generateUniqueUsername(firstName: string, existingUsernames: Set<string>): string {
  let baseUsername = transliterateArabicToEnglish(firstName);
  
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  let username = baseUsername;
  let counter = 1;
  
  // التأكد من أن اسم المستخدم فريد
  while (existingUsernames.has(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
} 