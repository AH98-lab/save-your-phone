import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Battery, Wifi, HardDrive, Monitor, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DeviceInfo } from "@/lib/security-scanner";

interface DeviceInfoProps {
  deviceInfo: DeviceInfo | null;
}

export function DeviceInfoDisplay({ deviceInfo }: DeviceInfoProps) {
  const { t, dir } = useLanguage();

  if (!deviceInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {t('loadingDashboard')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return 'bg-gray-500';
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDeviceAgeColor = (age: string) => {
    switch (age) {
      case 'حديث': return 'bg-green-100 text-green-800';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800';
      case 'قديم': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={dir === 'rtl' ? 'text-right' : 'text-left'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          {t('deviceInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Age */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('deviceAge')}:</span>
          <Badge className={getDeviceAgeColor(deviceInfo.deviceAge)}>
            {deviceInfo.deviceAge}
          </Badge>
        </div>

        {/* OS Version */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('osVersion')}:</span>
          <span className="text-sm font-medium">{deviceInfo.osVersion}</span>
        </div>

        {/* Battery Level */}
        {deviceInfo.batteryLevel && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Battery className="w-4 h-4" />
              {t('batteryLevel')}:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${getBatteryColor(deviceInfo.batteryLevel)}`}
                  style={{ width: `${deviceInfo.batteryLevel}%` }}
                />
              </div>
              <span className="text-sm font-medium">{deviceInfo.batteryLevel}%</span>
            </div>
          </div>
        )}

        {/* Connection Type */}
        {deviceInfo.connectionType && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              {t('connectionType')}:
            </span>
            <Badge variant="outline">{deviceInfo.connectionType}</Badge>
          </div>
        )}

        {/* Device Memory */}
        {deviceInfo.deviceMemory && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              {t('deviceMemory')}:
            </span>
            <span className="text-sm font-medium">{deviceInfo.deviceMemory} GB</span>
          </div>
        )}

        {/* Screen Resolution */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            الدقة:
          </span>
          <span className="text-sm font-medium">{deviceInfo.screenResolution}</span>
        </div>

        {/* Platform */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            المنصة:
          </span>
          <span className="text-sm font-medium">{deviceInfo.platform}</span>
        </div>

        {/* Security Score */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">{t('securityScore')}:</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={deviceInfo.securityScore >= 70 ? '#10B981' : deviceInfo.securityScore >= 50 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="2"
                    strokeDasharray={`${deviceInfo.securityScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-900">{deviceInfo.securityScore}</span>
                </div>
              </div>
              <span className="text-sm text-blue-700">{t('outOf100')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}