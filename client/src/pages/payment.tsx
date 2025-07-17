import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Lock, Shield, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// Stripe Checkout Form Component
function StripeCheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}?payment=success`,
        },
      });

      if (error) {
        toast({
          title: t('paymentFailed'),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('paymentFailed'),
        description: t('paymentError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={!stripe || loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('processing')}
          </div>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            {t('subscribeToPremium')} - $19.99/{t('month')}
          </>
        )}
      </Button>
    </form>
  );
}

// Legacy Form for when Stripe is not configured
function LegacyPaymentForm() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          subscriptionType: 'premium',
          email: formData.email
        }),
      });

      if (!response.ok) throw new Error('Subscription failed');

      toast({
        title: t('paymentSuccessful'),
        description: t('welcomeToPremium'),
      });

      setTimeout(() => window.location.href = '/', 1500);
      
    } catch (error) {
      toast({
        title: t('paymentFailed'),
        description: t('paymentError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailAddress')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">{t('cardNumber')}</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cvv">{t('cvv')}</Label>
            <Input
              id="cvv"
              name="cvv"
              placeholder="123"
              value={formData.cvv}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardholderName">{t('cardholderName')}</Label>
          <Input
            id="cardholderName"
            name="cardholderName"
            placeholder={t('fullName')}
            value={formData.cardholderName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>{t('demoMode')}</strong> - {t('demoPaymentNotice')}
        </AlertDescription>
      </Alert>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          {t('securePaymentNotice')}
        </AlertDescription>
      </Alert>

      <Button 
        type="submit" 
        className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('processing')}
          </div>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            {t('subscribeToPremium')} - $19.99/{t('month')}
          </>
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        {t('termsAgreement')}
      </p>
    </form>
  );
}

export default function Payment() {
  const { t, dir } = useLanguage();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Check if Stripe is configured
        if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY || !stripePromise) {
          setStripeConfigured(false);
          setLoading(false);
          return;
        }

        setStripeConfigured(true);

        // Create subscription with Stripe
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'user@example.com', // You can get this from user input
            userId: 1
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create subscription');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Payment initialization error:', error);
        setStripeConfigured(false);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/subscribe">
            <Button variant="ghost" className={`mb-4 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'}`}>
              <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('back')}
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('completeYourSubscription')}
          </h1>
          <p className="text-gray-600">
            {stripeConfigured ? t('securePaymentProcessing') : t('demoPaymentNotice')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('paymentInformation')}
              </CardTitle>
              <CardDescription>
                {stripeConfigured ? t('enterPaymentDetails') : t('demoMode')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {stripeConfigured && clientSecret && stripePromise ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#3b82f6',
                      }
                    }
                  }}
                >
                  <StripeCheckoutForm clientSecret={clientSecret} />
                </Elements>
              ) : (
                <>
                  <LegacyPaymentForm />
                  
                  {/* Iraq-specific payment notice */}
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="space-y-2">
                        <p><strong>{t('iraqPaymentSolution')}</strong></p>
                        <div className="text-sm">
                          <p>• ZainCash - محفظة زين النقدية</p>
                          <p>• AsiaCell Cash - محفظة آسياسيل النقدية</p>
                          <p>• Mastercard - ماستر كارد</p>
                          <p>• Visa Card - فيزا كارد</p>
                          <p>• حوالات بنكية محلية</p>
                        </div>
                        <p className="text-sm mt-2">
                          <Link href="/local-payment">
                            <Button variant="outline" size="sm" className="mt-2">
                              عرض طرق الدفع المحلية
                            </Button>
                          </Link>
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Plan Details */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('premiumPlan')}</h3>
                    <p className="text-sm text-gray-600">{t('monthly')}</p>
                  </div>
                </div>
              </div>

              {/* Features Included */}
              <div className="space-y-3">
                <h4 className="font-medium">{t('includedFeatures')}:</h4>
                {[
                  t('comprehensiveScan'),
                  t('realTimeProtection'),
                  t('fileSystemScan'),
                  t('appPermissionScan'),
                  t('prioritySupport'),
                  t('weeklyReports')
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('subscriptionFee')}</span>
                  <span>$19.99</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('tax')}</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('total')}</span>
                  <span>$19.99/{t('month')}</span>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {t('moneyBackGuarantee')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}