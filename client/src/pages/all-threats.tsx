import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Shield, AlertTriangle, Wifi, Worm, Info, Clock, Tag, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import type { Threat } from "@shared/schema";

export default function AllThreats() {
  const { t, dir } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  const { data: threats = [], isLoading } = useQuery<Threat[]>({
    queryKey: ['/api/threats'],
  });

  const resolveThreatMutation = useMutation({
    mutationFn: async (threatId: number) => {
      const response = await fetch(`/api/threats/${threatId}/resolve`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to resolve threat');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
    },
  });

  const resolveAllThreatsMutation = useMutation({
    mutationFn: async () => {
      const promises = threats.map(threat => 
        fetch(`/api/threats/${threat.id}/resolve`, {
          method: 'PATCH',
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threats'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'extension':
      case 'malware':
        return <Worm className="w-5 h-5" />;
      case 'setting':
      case 'privacy':
        return <AlertTriangle className="w-5 h-5" />;
      case 'network':
        return <Wifi className="w-5 h-5" />;
      case 'permissions':
        return <Shield className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-purple-600';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
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

  if (isLoading) {
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
                  {t('back')}
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{t('allThreats')}</h1>
            </div>
            {threats.length > 0 && (
              <Button 
                onClick={() => resolveAllThreatsMutation.mutate()}
                disabled={resolveAllThreatsMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <CheckCircle className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('fixAllThreats')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {threats.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600 w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noThreats')}</h3>
              <p className="text-gray-600">{t('deviceSafe')}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('threatsSummary')} ({threats.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('criticalLevel')}: {threats.filter(t => t.severity === 'critical').length} | 
                    {t('highLevel')}: {threats.filter(t => t.severity === 'high').length} | 
                    {t('mediumLevel')}: {threats.filter(t => t.severity === 'medium').length} | 
                    {t('lowLevel')}: {threats.filter(t => t.severity === 'low').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {threats.map((threat) => (
                <Card key={threat.id} className={`border transition-all hover:shadow-md ${getBorderColor(threat.severity)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`flex items-start ${dir === 'rtl' ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
                        <div className={`w-12 h-12 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(threat.severity)}`}>
                          {getIcon(threat.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{threat.title}</h3>
                          <p className="text-gray-600 mb-3">{threat.description}</p>
                          
                          <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'space-x-6 space-x-reverse' : 'space-x-6'}`}>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs text-white px-2 py-1 ${getSeverityColor(threat.severity)}`}>
                                {getSeverityText(threat.severity)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(threat.detectedAt).toLocaleTimeString(
                                dir === 'rtl' ? 'ar-SA' : 'en-US',
                                { hour: 'numeric', minute: '2-digit' }
                              )}
                            </div>
                          </div>

                          {threat.recommendation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                              <h4 className="text-sm font-medium text-blue-900 mb-1">{t('recommendation')}:</h4>
                              <p className="text-sm text-blue-800">{threat.recommendation}</p>
                            </div>
                          )}

                          <div className={`flex ${dir === 'rtl' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                            {threat.autoFixAvailable && (
                              <Button
                                size="sm"
                                onClick={() => resolveThreatMutation.mutate(threat.id)}
                                disabled={resolveThreatMutation.isPending}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                <Shield className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                {t('autoFix')}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveThreatMutation.mutate(threat.id)}
                              disabled={resolveThreatMutation.isPending}
                            >
                              {t('manualFix')}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {t('moreDetails')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className={`max-w-lg ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getIcon(threat.type)}
                                    {threat.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {t('threatDetails')}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{t('severity')}:</span>
                                    <Badge className={`text-xs text-white px-2 py-1 ${getSeverityColor(threat.severity)}`}>
                                      {getSeverityText(threat.severity)}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{t('detectedAt')}:</span>
                                    <span className="text-sm">
                                      {new Date(threat.detectedAt).toLocaleString(
                                        dir === 'rtl' ? 'ar-SA' : 'en-US'
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

                                  {threat.recommendation && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">{t('recommendation')}:</span>
                                      </div>
                                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        {threat.recommendation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}