import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { SecuritySettings } from "@shared/schema";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SecuritySettings | null;
  onSaveSettings: (settings: any) => void;
}

export function NotificationModal({ 
  open, 
  onOpenChange, 
  settings, 
  onSaveSettings 
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState({
    highThreats: true,
    suspiciousExtensions: true,
    networkSecurity: false,
    weeklyReports: true
  });

  useEffect(() => {
    if (settings?.notifications) {
      setNotifications(settings.notifications as any);
    }
  }, [settings]);

  const handleSave = () => {
    onSaveSettings({
      notifications,
      autoScan: settings?.autoScan ?? true,
      alertLevel: settings?.alertLevel ?? 'medium'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            إعدادات التنبيهات
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-threats" className="text-sm font-medium text-gray-700">
              تنبيهات التهديدات العالية
            </Label>
            <Switch
              id="high-threats"
              checked={notifications.highThreats}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, highThreats: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="suspicious-extensions" className="text-sm font-medium text-gray-700">
              تنبيهات الإضافات المشبوهة
            </Label>
            <Switch
              id="suspicious-extensions"
              checked={notifications.suspiciousExtensions}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, suspiciousExtensions: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="network-security" className="text-sm font-medium text-gray-700">
              تنبيهات الشبكة غير الآمنة
            </Label>
            <Switch
              id="network-security"
              checked={notifications.networkSecurity}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, networkSecurity: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-reports" className="text-sm font-medium text-gray-700">
              تقارير أسبوعية
            </Label>
            <Switch
              id="weekly-reports"
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, weeklyReports: checked }))
              }
            />
          </div>
        </div>
        
        <div className="flex space-x-3 space-x-reverse pt-4">
          <Button onClick={handleSave} className="flex-1 bg-primary text-white hover:bg-blue-700">
            حفظ الإعدادات
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
