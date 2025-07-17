// Hijri calendar utilities using Umm al-Qura calendar system
export interface DateInfo {
  hijri: string;
  gregorian: string;
}

// Hijri months in Arabic
const hijriMonths = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

// Hijri months in English
const hijriMonthsEn = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
  'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

// Hijri months in French
const hijriMonthsFr = [
  'Mouharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani', 'Joumada al-awwal', 'Joumada al-thani',
  'Rajab', 'Chaaban', 'Ramadan', 'Chawwal', 'Dhou al-qi\'dah', 'Dhou al-hijjah'
];

// Basic Hijri conversion algorithm (approximate)
function gregorianToHijri(gregorianDate: Date): { year: number; month: number; day: number } {
  const HIJRI_EPOCH = 1948439.5; // Julian day of 1 Muharram 1 AH
  const TROPICAL_YEAR = 365.24219;
  const LUNAR_YEAR = 354.36708;

  const julianDay = gregorianToJulianDay(gregorianDate);
  const daysSinceHijriEpoch = julianDay - HIJRI_EPOCH;
  
  // Approximate Hijri year
  let hijriYear = Math.floor(daysSinceHijriEpoch / LUNAR_YEAR) + 1;
  
  // Calculate start of Hijri year
  const startOfHijriYear = hijriYearToJulianDay(hijriYear);
  let daysIntoYear = julianDay - startOfHijriYear;
  
  if (daysIntoYear < 0) {
    hijriYear--;
    daysIntoYear = julianDay - hijriYearToJulianDay(hijriYear);
  }
  
  // Calculate month and day
  let hijriMonth = 1;
  let daysInMonth = 30;
  
  while (daysIntoYear >= daysInMonth) {
    daysIntoYear -= daysInMonth;
    hijriMonth++;
    daysInMonth = hijriMonth % 2 === 1 ? 30 : 29;
    
    // Adjust for leap year
    if (hijriMonth === 12 && isHijriLeapYear(hijriYear)) {
      daysInMonth = 30;
    }
  }
  
  const hijriDay = Math.floor(daysIntoYear) + 1;
  
  return { year: hijriYear, month: hijriMonth, day: hijriDay };
}

function gregorianToJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function hijriYearToJulianDay(hijriYear: number): number {
  return Math.floor((hijriYear - 1) * 354.36708 + 1948439.5);
}

function isHijriLeapYear(hijriYear: number): boolean {
  return ((hijriYear * 11 + 14) % 30) < 11;
}

export function formatDate(date: Date, language: 'ar' | 'en' | 'fr' = 'ar'): DateInfo {
  const hijriDate = gregorianToHijri(date);
  
  let hijriMonthNames: string[];
  switch (language) {
    case 'en':
      hijriMonthNames = hijriMonthsEn;
      break;
    case 'fr':
      hijriMonthNames = hijriMonthsFr;
      break;
    default:
      hijriMonthNames = hijriMonths;
  }
  
  const hijriFormatted = language === 'ar' 
    ? `${hijriDate.day} ${hijriMonthNames[hijriDate.month - 1]} ${hijriDate.year}هـ`
    : `${hijriDate.day} ${hijriMonthNames[hijriDate.month - 1]} ${hijriDate.year} AH`;
  
  let gregorianFormatted: string;
  switch (language) {
    case 'en':
      gregorianFormatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      break;
    case 'fr':
      gregorianFormatted = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      break;
    default:
      gregorianFormatted = date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  }
  
  return {
    hijri: hijriFormatted,
    gregorian: gregorianFormatted
  };
}

export function formatDateTimeWithBoth(date: Date, language: 'ar' | 'en' | 'fr' = 'ar'): string {
  const dateInfo = formatDate(date, language);
  
  const timeFormatted = date.toLocaleTimeString(
    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
    {
      hour: 'numeric',
      minute: '2-digit'
    }
  );
  
  switch (language) {
    case 'en':
      return `Gregorian: ${dateInfo.gregorian}\nHijri: ${dateInfo.hijri}\nTime: ${timeFormatted}`;
    case 'fr':
      return `Grégorien: ${dateInfo.gregorian}\nHijri: ${dateInfo.hijri}\nHeure: ${timeFormatted}`;
    default:
      return `الميلادي: ${dateInfo.gregorian}\nالهجري: ${dateInfo.hijri}\nالوقت: ${timeFormatted}`;
  }
}