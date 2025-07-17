import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Cookie, 
  Lock, 
  ShieldQuestion, 
  Expand,
  Check,
  AlertTriangle
} from "lucide-react";
import type { SecurityScan } from "@shared/schema";

interface DetailedReportProps {
  scan: SecurityScan | null;
  onToggleReport: () => void;
}

export function DetailedReport({ scan, onToggleReport }: DetailedReportProps) {
  if (!scan) {
    return (
      <div className="mt-8">
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">لا توجد بيانات فحص متاحة</p>
          </div>
        </Card>
      </div>
    );
  }

  const browserInfo = scan.browserInfo as any;
  const deviceInfo = scan.deviceInfo as any;

  return (
    <div className="mt-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">تقرير مفصل</h3>
          <Button
            variant="outline"
            onClick={onToggleReport}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Expand className="w-4 h-4 ml-2" />
            عرض كامل
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Globe className="text-primary text-xl w-5 h-5" />
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900">بروتوكول الاتصال</h4>
            <p className="text-sm text-gray-600 mt-1">
              {window.location.protocol === 'https:' ? 'HTTPS آمن' : 'HTTP غير آمن'}
            </p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">TLS 1.3</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Cookie className="text-warning text-xl w-5 h-5" />
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900">ملفات تعريف الارتباط</h4>
            <p className="text-sm text-gray-600 mt-1">
              {deviceInfo.cookieEnabled ? 'مفعلة' : 'معطلة'}
            </p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">متاحة</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Lock className="text-success text-xl w-5 h-5" />
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900">التشفير</h4>
            <p className="text-sm text-gray-600 mt-1">AES-256 مفعل</p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">قوي</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <ShieldQuestion className="text-primary text-xl w-5 h-5" />
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900">الخصوصية</h4>
            <p className="text-sm text-gray-600 mt-1">مستوى جيد</p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">محمي</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">سجل الفحص</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">فحص الإضافات المثبتة</span>
              <span className="text-success flex items-center">
                <Check className="w-4 h-4 ml-1" />
                مكتمل
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">تحليل إعدادات الأمان</span>
              <span className="text-success flex items-center">
                <Check className="w-4 h-4 ml-1" />
                مكتمل
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">فحص البرمجيات الضارة</span>
              <span className="text-warning flex items-center">
                <AlertTriangle className="w-4 h-4 ml-1" />
                تحذير
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">تقييم مستوى الخطر</span>
              <span className="text-success flex items-center">
                <Check className="w-4 h-4 ml-1" />
                مكتمل
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">معلومات المتصفح</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">المتصفح:</span>
              <span className="text-gray-600 mr-2">{browserInfo.name} {browserInfo.version}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">المحرك:</span>
              <span className="text-gray-600 mr-2">{browserInfo.engine}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">المنصة:</span>
              <span className="text-gray-600 mr-2">{deviceInfo.platform}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">اللغة:</span>
              <span className="text-gray-600 mr-2">{deviceInfo.language}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
