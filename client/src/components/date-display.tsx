import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/dates";
import { Calendar, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DateDisplayProps {
  date: Date;
  showTime?: boolean;
}

export function DateDisplay({ date, showTime = true }: DateDisplayProps) {
  const { language, t, dir } = useLanguage();
  const dateInfo = formatDate(date, language as 'ar' | 'en' | 'fr');
  
  const timeFormatted = showTime ? date.toLocaleTimeString(
    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
    {
      hour: 'numeric',
      minute: '2-digit'
    }
  ) : null;

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Gregorian Date */}
          <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'ar' ? 'ميلادي' : language === 'fr' ? 'Grégorien' : 'Gregorian'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {dateInfo.gregorian}
              </div>
            </div>
          </div>

          {/* Hijri Date */}
          <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
            <CalendarDays className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'ar' ? 'هجري' : 'Hijri'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {dateInfo.hijri}
              </div>
            </div>
          </div>

          {/* Time */}
          {timeFormatted && (
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'} border-t border-gray-200 pt-3`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {language === 'ar' ? 'الوقت' : language === 'fr' ? 'Heure' : 'Time'}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {timeFormatted}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}