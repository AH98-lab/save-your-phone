import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Skull, Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SecurityOverviewProps {
  securityStats: {
    safe: number;
    warnings: number;
    threats: number;
  };
  lastScanTime: string;
  onStartScan: () => void;
  isScanning: boolean;
}

export function SecurityOverview({
  securityStats,
  lastScanTime,
  onStartScan,
  isScanning
}: SecurityOverviewProps) {
  const { t, dir } = useLanguage();
  
  return (
    <div className="mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('securityOverview')}</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 bg-warning rounded-full ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></div>
            <span className="text-warning font-semibold">{t('needsAttention')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="text-success text-2xl w-8 h-8" />
            </div>
            <div className="text-2xl font-bold text-success">{securityStats.safe}</div>
            <div className="text-sm text-gray-600">{t('safeItems')}</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="text-warning text-2xl w-8 h-8" />
            </div>
            <div className="text-2xl font-bold text-warning">{securityStats.warnings}</div>
            <div className="text-sm text-gray-600">{t('warnings')}</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-danger bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Skull className="text-danger text-2xl w-8 h-8" />
            </div>
            <div className="text-2xl font-bold text-danger">{securityStats.threats}</div>
            <div className="text-sm text-gray-600">{t('threats')}</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-primary text-2xl w-8 h-8" />
            </div>
            <div className="text-lg font-bold text-gray-900">{lastScanTime}</div>
            <div className="text-sm text-gray-600">{t('lastScan')}</div>
          </div>
        </div>
        
        <Button 
          onClick={onStartScan}
          disabled={isScanning}
          className="w-full bg-primary text-white py-3 hover:bg-blue-700 font-semibold"
        >
          {isScanning ? (
            <>
              <RotateCcw className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
              {t('scanning')}
            </>
          ) : (
            <>
              <RotateCcw className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('startNewScan')}
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
