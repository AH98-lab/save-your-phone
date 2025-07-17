import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Puzzle, 
  Shield, 
  Fan, 
  ChevronLeft,
  RefreshCw,
  Lock,
  ShieldQuestion,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SecuritySidebarProps {
  securityScore: number;
  onQuickAction: (action: string) => void;
}

export function SecuritySidebar({ securityScore, onQuickAction }: SecuritySidebarProps) {
  const { t, dir } = useLanguage();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return t('excellent');
    if (score >= 60) return t('needsImprovement');
    return t('highRisk');
  };

  const strokeDasharray = `${securityScore}, 100`;

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('securityPoints')}</h3>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2"></circle>
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke={getScoreStroke(securityScore)} 
                strokeWidth="2" 
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{t('outOf100')}</p>
          <p className={`font-semibold mt-2 ${getScoreColor(securityScore)}`}>
            {getScoreText(securityScore)}
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('quickActions')}</h3>
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
            onClick={() => onQuickAction(t('updateBrowser'))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              <span className="text-sm">{t('updateBrowser')}</span>
              <Globe className="w-4 h-4 text-primary" />
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
            onClick={() => onQuickAction(t('checkExtensions'))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              <span className="text-sm">{t('checkExtensions')}</span>
              <Puzzle className="w-4 h-4 text-primary" />
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
            onClick={() => onQuickAction(t('enableFirewall'))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              <span className="text-sm">{t('enableFirewall')}</span>
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
            onClick={() => onQuickAction(t('clearCache'))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
              <span className="text-sm">{t('clearCache')}</span>
              <Fan className="w-4 h-4 text-primary" />
            </div>
          </Button>
        </div>
      </Card>

      {/* Security Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('securityTips')}</h3>
        <div className="space-y-4">
          <div className={`${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-success bg-green-50 p-3 rounded`}>
            <h4 className="font-semibold text-green-800 text-sm">{t('strongPasswords')}</h4>
            <p className="text-green-700 text-xs mt-1">{t('strongPasswordsDesc')}</p>
          </div>
          
          <div className={`${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-warning bg-yellow-50 p-3 rounded`}>
            <h4 className="font-semibold text-yellow-800 text-sm">{t('twoFactorAuth')}</h4>
            <p className="text-yellow-700 text-xs mt-1">{t('twoFactorAuthDesc')}</p>
          </div>
          
          <div className={`${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-primary bg-blue-50 p-3 rounded`}>
            <h4 className="font-semibold text-blue-800 text-sm">{t('updateSystem')}</h4>
            <p className="text-blue-700 text-xs mt-1">{t('updateSystemDesc')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
