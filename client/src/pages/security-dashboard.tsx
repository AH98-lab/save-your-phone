import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, Settings, Shield, Crown, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { SecurityOverview } from "@/components/security-overview";
import { ThreatsList } from "@/components/threats-list";
import { SecuritySidebar } from "@/components/security-sidebar";
import { DetailedReport } from "@/components/detailed-report";
import { NotificationModal } from "@/components/notification-modal";
import { LanguageSelector } from "@/components/language-selector";
import { DeviceInfoDisplay } from "@/components/device-info";

import { securityScanner } from "@/lib/security-scanner";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

import type { SecurityScan, Threat, SecuritySettings } from "@shared/schema";

export default function SecurityDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [userId] = useState(1); // Mock user ID for demo
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language, dir } = useLanguage();

  // Check free scan eligibility
  const { data: scanEligibility } = useQuery({
    queryKey: ['/api/check-free-scan', userId],
  });

  // Fetch latest security scan
  const { data: latestScan, isLoading: scanLoading } = useQuery<SecurityScan>({
    queryKey: ['/api/security-scan/latest'],
  });

  // Fetch active threats
  const { data: threats = [], isLoading: threatsLoading } = useQuery<Threat[]>({
    queryKey: ['/api/threats'],
  });

  // Fetch security settings
  const { data: settings } = useQuery<SecuritySettings>({
    queryKey: ['/api/security-settings'],
  });

  // Perform security scan mutation with free trial logic
  const performScanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/security-actions/scan', { userId });
      return response.json();
    },
    onSuccess: () => {
      setIsScanning(false);
      queryClient.invalidateQueries({ queryKey: ['/api/security-scan/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/check-free-scan', userId] });
      toast({
        title: "تم الفحص بنجاح",
        description: "تم فحص جهازك وكشف التهديدات الأمنية",
      });
    },
    onError: (error: any) => {
      setIsScanning(false);
      
      // Check if user needs subscription
      if (error.message?.includes('403') || error.message?.includes('requiresSubscription')) {
        toast({
          title: "التجارب المجانية منتهية",
          description: "اشترك الآن مقابل 7$ شهرياً للاستمرار",
          variant: "destructive",
        });
      } else {
        toast({
          title: "فشل الفحص",
          description: "حدث خطأ أثناء فحص جهازك",
          variant: "destructive",
        });
      }
    },
  });

  // Create threats mutation
  const createThreatsMutation = useMutation({
    mutationFn: async (threats: any[]) => {
      const promises = threats.map(threat =>
        apiRequest('POST', '/api/threats', threat)
      );
      return Promise.all(promises);
    },
  });

  // Resolve threat mutation
  const resolveThreatMutation = useMutation({
    mutationFn: async (threatId: number) => {
      const response = await apiRequest('PATCH', `/api/threats/${threatId}/resolve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
      toast({
        title: t('threatResolved'),
        description: t('threatResolvedDesc'),
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('PUT', '/api/security-settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security-settings'] });
      toast({
        title: t('settingsSaved'),
        description: t('settingsSavedDesc'),
      });
    },
  });

  const handleStartScan = async () => {
    // Check if user can perform scan
    if (!scanEligibility?.canPerformFreeScan && scanEligibility?.subscriptionStatus !== 'active') {
      toast({
        title: "تجارب مجانية منتهية",
        description: "تحتاج إلى اشتراك للمتابعة",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    performScanMutation.mutate();
  };

  const getSubscriptionPrompt = () => {
    if (!scanEligibility) return null;
    
    const { canPerformFreeScan, freeScansUsed, freeScansLimit, subscriptionStatus } = scanEligibility;
    
    if (subscriptionStatus === 'active') {
      return (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Crown className="w-5 h-5" />
            <span className="font-medium">مشترك بريميوم نشط</span>
          </div>
          <p className="text-sm text-green-600 mt-1">استمتع بفحوصات أمنية غير محدودة وحماية متقدمة</p>
        </div>
      );
    }
    
    if (!canPerformFreeScan) {
      return (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-amber-800">انتهت التجارب المجانية</h3>
              <p className="text-sm text-amber-600 mt-1">
                لقد استخدمت {freeScansUsed} من {freeScansLimit} فحوصات مجانية
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/subscribe">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  اشترك الآن - 7$
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">التجربة المجانية</h3>
            <p className="text-sm text-blue-600 mt-1">
              متبقي {freeScansLimit - freeScansUsed} من {freeScansLimit} فحوصات مجانية
            </p>
          </div>
          <Link href="/subscribe">
            <Button variant="outline" size="sm">
              اشترك للحصول على فحوصات غير محدودة
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const handleStartScanOriginal = async () => {
    setIsScanning(true);
    try {
      const scanResult = await securityScanner.scanDevice();
      
      // Create scan record
      const scanData = {
        userId: null,
        deviceInfo: scanResult.deviceInfo,
        browserInfo: scanResult.browserInfo,
        threats: scanResult.threats,
        securityScore: scanResult.securityScore,
        isActive: true,
      };

      const newScan = await createScanMutation.mutateAsync(scanData);

      // Create threat records
      if (scanResult.threats.length > 0) {
        const threatData = scanResult.threats.map(threat => ({
          scanId: newScan.id,
          type: threat.type,
          severity: threat.severity,
          title: threat.title,
          description: threat.description,
          recommendation: threat.recommendation,
          isResolved: false,
        }));

        await createThreatsMutation.mutateAsync(threatData);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResolveThreat = (threatId: number) => {
    resolveThreatMutation.mutate(threatId);
  };

  const handleFixAllThreats = async () => {
    setIsFixingAll(true);
    try {
      const promises = threats.map(threat => 
        resolveThreatMutation.mutateAsync(threat.id)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error fixing all threats:', error);
    } finally {
      setIsFixingAll(false);
    }
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: t('quickAction'),
      description: `${t('quickAction')}: ${action}`,
    });
  };

  const handleDownloadReport = () => {
    if (!latestScan) return;
    
    const reportData = {
      scan: latestScan,
      threats: threats,
      generatedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const securityStats = {
    safe: latestScan ? 15 - threats.length : 0,
    warnings: threats.filter(t => t.severity === 'medium').length,
    threats: threats.filter(t => t.severity === 'high').length,
  };

  const lastScanTime = latestScan 
    ? new Date(latestScan.scanDate).toLocaleTimeString(
        language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
        {
          hour: 'numeric',
          minute: '2-digit'
        }
      )
    : t('lastScan');

  if (scanLoading || threatsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
              <Shield className="text-primary text-2xl w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
              <LanguageSelector />
              <Link href="/suggestions">
                <Button variant="outline">
                  <Lightbulb className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  اقتراحاتك
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600">
                  <Crown className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  اشترك الآن - 7$
                </Button>
              </Link>
              <Button onClick={handleDownloadReport} className="bg-primary text-white hover:bg-blue-700">
                <Download className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('downloadReport')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNotificationModal(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        {getSubscriptionPrompt()}

        {/* Security Overview */}
        <SecurityOverview
          securityStats={securityStats}
          lastScanTime={lastScanTime}
          onStartScan={handleStartScan}
          isScanning={isScanning}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Threats List */}
          <div className="lg:col-span-2">
            <ThreatsList
              threats={threats}
              onResolveThreat={handleResolveThreat}
              onViewAllThreats={() => {}}
            />
            
            {/* Fix All Threats Button */}
            {threats.length > 1 && (
              <div className="mt-4">
                <Button 
                  onClick={handleFixAllThreats}
                  disabled={isFixingAll}
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                >
                  <Shield className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {isFixingAll ? t('fixingAllThreats') : t('fixAllThreats')}
                </Button>
              </div>
            )}
          </div>

          {/* Security Sidebar and Device Info */}
          <div className="lg:col-span-1 space-y-6">
            <SecuritySidebar
              securityScore={latestScan?.securityScore || 0}
              onQuickAction={handleQuickAction}
            />
            <DeviceInfoDisplay 
              deviceInfo={latestScan?.deviceInfo || null}
            />
          </div>
        </div>

        {/* Detailed Report */}
        <DetailedReport
          scan={latestScan || null}
          onToggleReport={() => {}}
        />
      </main>

      {/* Notification Modal */}
      <NotificationModal
        open={showNotificationModal}
        onOpenChange={setShowNotificationModal}
        settings={settings || null}
        onSaveSettings={(newSettings) => updateSettingsMutation.mutate(newSettings)}
      />
    </div>
  );
}
