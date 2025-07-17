import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, Worm, AlertTriangle, Wifi, Shield, Info, Clock, Tag, ArrowRight } from "lucide-react";
import type { Threat } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "wouter";

interface ThreatsListProps {
  threats: Threat[];
  onResolveThreat: (threatId: number) => void;
  onViewAllThreats: () => void;
}

export function ThreatsList({ threats, onResolveThreat, onViewAllThreats }: ThreatsListProps) {
  const { t, dir } = useLanguage();
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'extension':
      case 'malware':
        return <Worm className="w-5 h-5" />;
      case 'setting':
        return <AlertTriangle className="w-5 h-5" />;
      case 'network':
        return <Wifi className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-purple-600';
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical':
        return t('criticalLevel');
      case 'high':
        return t('highLevel');
      case 'medium':
        return t('mediumLevel');
      case 'low':
        return t('lowLevel');
      default:
        return t('undefined');
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-purple-200 bg-purple-50';
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="lg:col-span-2">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{t('detectedThreats')}</h3>
        
        {threats.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-success w-8 h-8" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('noThreats')}</h4>
            <p className="text-gray-600">{t('deviceSafe')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {threats.slice(0, 3).map((threat) => (
                <div
                  key={threat.id}
                  className={`rounded-lg p-4 border transition-all hover:shadow-md ${getBorderColor(threat.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex items-start ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                      <div className={`w-10 h-10 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(threat.severity)}`}>
                        {getIcon(threat.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{threat.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{threat.description}</p>
                        <div className={`flex items-center mt-2 ${dir === 'rtl' ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
                          <Badge className={`text-xs text-white px-2 py-1 ${getSeverityColor(threat.severity)}`}>
                            {getSeverityText(threat.severity)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(threat.detectedAt).toLocaleTimeString(
                              dir === 'rtl' ? 'ar-SA' : 'en-US',
                              { hour: 'numeric', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={`mt-4 flex ${dir === 'rtl' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                    <Button
                      onClick={() => onResolveThreat(threat.id)}
                      className={`${getSeverityColor(threat.severity)} text-white px-4 py-2 text-sm hover:opacity-90`}
                    >
                      {threat.severity === 'high' ? t('immediateRemoval') : t('fix')}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedThreat(threat)}>
                          {t('moreDetails')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`max-w-lg ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getIcon(threat.type)}
                            {threat.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{t('threatType')}:</span>
                            <Badge className={`text-xs text-white px-2 py-1 ${getSeverityColor(threat.severity)}`}>
                              {getSeverityText(threat.severity)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{t('detectedAt')}:</span>
                            <span className="text-sm">
                              {new Date(threat.detectedAt).toLocaleTimeString(
                                dir === 'rtl' ? 'ar-SA' : 'en-US',
                                { hour: 'numeric', minute: '2-digit' }
                              )}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{t('description')}:</span>
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {threat.description}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{t('recommendation')}:</span>
                            </div>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                              {threat.recommendation}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => onResolveThreat(threat.id)}
                              className={`${getSeverityColor(threat.severity)} text-white hover:opacity-90 flex-1`}
                            >
                              {threat.severity === 'high' ? t('immediateRemoval') : t('fix')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
            
            {threats.length > 3 && (
              <div className="text-center py-4">
                <Link href="/threats">
                  <Button variant="link" className="text-primary hover:text-blue-700 font-semibold">
                    <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    {t('viewAllThreats')} ({threats.length})
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
