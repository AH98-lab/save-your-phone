import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, Zap, Clock, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function Subscribe() {
  const { t, dir } = useLanguage();

  const plans = [
    {
      id: "free",
      name: t('freePlan'),
      price: t('free'),
      popular: false,
      features: [
        t('basicScan'),
        t('threatDetection'),
        t('securityScore'),
        t('basicRecommendations')
      ],
      limitations: [
        t('limitedScans'),
        t('basicSupport')
      ]
    },
    {
      id: "premium",
      name: t('premiumPlan'),
      price: "7",
      currency: t('currency'),
      period: t('monthly'),
      popular: true,
      features: [
        t('comprehensiveScan'),
        t('realTimeProtection'),
        t('fileSystemScan'),
        t('appPermissionScan'),
        t('advancedThreatDetection'),
        t('autoFix'),
        t('prioritySupport'),
        t('weeklyReports'),
        t('customAlerts')
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/">
            <Button variant="ghost" className={`mb-4 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'}`}>
              ← {t('back')}
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('chooseYourPlan')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subscriptionDescription')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  {t('mostPopular')}
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${
                  plan.id === 'premium' 
                    ? 'from-yellow-400 to-orange-500' 
                    : 'from-gray-400 to-gray-500'
                } flex items-center justify-center`}>
                  {plan.id === 'premium' ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <Shield className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                
                <div className="text-3xl font-bold text-gray-900">
                  {plan.id === 'free' ? (
                    <span className="text-green-600">{plan.price}</span>
                  ) : (
                    <div>
                      <span>{plan.currency}</span>
                      <span className="text-4xl">{plan.price}</span>
                      <span className="text-lg text-gray-500">/{plan.period}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations?.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 border border-gray-300 rounded flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.id === 'premium'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    if (plan.id === 'premium') {
                      // Navigate to payment
                      window.location.href = '/payment';
                    } else {
                      // Continue with free plan
                      window.location.href = '/';
                    }
                  }}
                >
                  {plan.id === 'premium' ? (
                    <>
                      <Zap className={`w-5 h-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t('upgradeNow')}
                    </>
                  ) : (
                    <>
                      <Clock className={`w-5 h-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t('continueWithFree')}
                    </>
                  )}
                </Button>

                {plan.id === 'premium' && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    {t('cancelAnytime')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {t('whyUpgradeToPremium')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('advancedProtection')}</h3>
              <p className="text-gray-600">{t('advancedProtectionDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('realTimeMonitoring')}</h3>
              <p className="text-gray-600">{t('realTimeMonitoringDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('prioritySupport')}</h3>
              <p className="text-gray-600">{t('prioritySupportDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}