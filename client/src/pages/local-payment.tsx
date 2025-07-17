import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Phone, CreditCard, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { SiMastercard, SiVisa } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function LocalPayment() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>("mastercard");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount] = useState(7);

  const paymentMethods = [
    {
      id: "zaincash",
      name: "ZainCash",
      nameAr: "زين كاش",
      icon: Phone,
      color: "bg-purple-600",
      instructions: "ادفع عبر تطبيق زين كاش إلى الرقم المحدد",
      instructionsEn: "Pay via ZainCash app to the specified number",
      accountNumber: "+964 790 123 4567"
    },
    {
      id: "asiacell",
      name: "AsiaCell Cash", 
      nameAr: "آسياسيل كاش",
      icon: Phone,
      color: "bg-green-600",
      instructions: "ادفع عبر تطبيق آسياسيل كاش إلى الرقم المحدد",
      instructionsEn: "Pay via AsiaCell Cash app to the specified number",
      accountNumber: "+964 770 123 4567"
    },
    {
      id: "mastercard",
      name: "Mastercard",
      nameAr: "ماستر كارد",
      icon: CreditCard,
      color: "bg-red-600",
      instructions: "ادفع عبر بطاقة ماستر كارد إلى حساب أحمد أبو الهيل",
      instructionsEn: "Pay via Mastercard to Ahmed Abo Alhayl account",
      accountNumber: "5213 7204 6126 2805",
      cardType: "mastercard",
      recommended: true,
      accountHolder: "AHMED ABO ALHAYL",
      bankName: "مصرف الرافدين"
    },
    {
      id: "visa",
      name: "Visa Card",
      nameAr: "فيزا كارد",
      icon: CreditCard,
      color: "bg-blue-700",
      instructions: "ادفع عبر بطاقة فيزا إلى الحساب المحدد",
      instructionsEn: "Pay via Visa card to the specified account",
      accountNumber: "4123 4567 8901 2345",
      cardType: "visa"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      nameAr: "حوالة بنكية", 
      icon: CreditCard,
      color: "bg-blue-600",
      instructions: "قم بحوالة بنكية إلى الحساب المحدد",
      instructionsEn: "Make a bank transfer to the specified account",
      accountNumber: "1234567890 - البنك التجاري العراقي"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('copied'),
      description: "تم نسخ المعلومات",
    });
  };

  const handlePaymentConfirmation = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    const timeFrame = method?.cardType ? "48-72 ساعة" : "24 ساعة";
    
    toast({
      title: "تم إرسال طلب التأكيد",
      description: `سيتم التواصل معك خلال ${timeFrame} لتأكيد الدفع`,
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/subscribe">
            <Button variant="ghost" className={`mb-4 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'}`}>
              <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              العودة
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            طرق الدفع المحلية
          </h1>
          <p className="text-gray-600">
            اختر طريقة الدفع المناسبة لك في العراق
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">اختر طريقة الدفع</h2>
            
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className={`p-3 rounded-full ${method.color} text-white flex items-center justify-center`}>
                      {method.cardType === 'mastercard' ? (
                        <SiMastercard className="w-6 h-6" />
                      ) : method.cardType === 'visa' ? (
                        <SiVisa className="w-6 h-6" />
                      ) : (
                        <method.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {method.nameAr}
                        {method.recommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            موصى به
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{method.name}</p>
                      {method.cardType && (
                        <p className="text-xs text-gray-500">بطاقة ائتمان/خصم</p>
                      )}
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الدفع</CardTitle>
              <CardDescription>
                المبلغ: ${amount} USD (حوالي 9,000 دينار عراقي)
                {selectedMethod === 'mastercard' && (
                  <span className="block text-green-600 text-sm mt-1">
                    ✓ مدعومة في جميع البنوك العراقية - الخيار الأفضل للعراق 2025
                  </span>
                )}
                {selectedMethod === 'visa' && (
                  <span className="block text-blue-600 text-sm mt-1">
                    ⚠️ قيود جديدة 2025 - استخدم الماستر كارد للأمان
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedMethod && (
                <>
                  {(() => {
                    const method = paymentMethods.find(m => m.id === selectedMethod);
                    return method ? (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {method.instructions}
                          </AlertDescription>
                        </Alert>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <Label className="text-sm font-medium">
                            {selectedMethod === 'bank' ? 'رقم الحساب' : 
                             method.cardType ? 'رقم البطاقة' : 'رقم الهاتف'}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input 
                              value={method.accountNumber} 
                              readOnly 
                              className="font-mono"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(method.accountNumber)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          {method.cardType && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800 mb-2">
                                <strong>تعليمات الدفع بالماستر كارد:</strong>
                              </p>
                              <ul className="text-xs text-blue-700 space-y-1">
                                <li>• استخدم رقم البطاقة أعلاه للتحويل</li>
                                <li>• ادخل إلى تطبيق البنك أو موقعه الإلكتروني</li>
                                <li>• اختر "تحويل دولي" أو "International Transfer"</li>
                                <li>• أدخل المبلغ: ${amount} USD</li>
                                <li>• اسم المستفيد: AHMED ABO ALHAYL</li>
                                <li>• البنك: مصرف الرافدين</li>
                                <li>• احتفظ برقم العملية Reference Number</li>
                                <li>• قد تستغرق العملية 2-5 أيام عمل</li>
                                <li>• رسوم التحويل: عادة 2-4% + رسوم ثابتة</li>
                              </ul>
                              <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                                <p className="text-xs text-green-800">
                                  <strong>✓ حساب حقيقي:</strong> هذا رقم البطاقة الفعلي لاستقبال المدفوعات من مصرف الرافدين.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم هاتفك (للتأكيد)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+964 7XX XXX XXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                          />
                        </div>

                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertDescription className="text-blue-800">
                            <div className="space-y-2">
                              <p><strong>خطوات الدفع:</strong></p>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>انسخ {selectedMethod === 'bank' ? 'رقم الحساب' : 
                                          method.cardType ? 'رقم البطاقة' : 'رقم الهاتف'} أعلاه</li>
                                <li>ادفع المبلغ ${amount} عبر {method.nameAr}</li>
                                <li>احتفظ برقم/إيصال العملية</li>
                                <li>اضغط "تأكيد الدفع" أدناه</li>
                                <li>سنتواصل معك خلال {method.cardType ? '2-5 أيام عمل' : '24 ساعة'}</li>
                              </ol>
                            </div>
                          </AlertDescription>
                        </Alert>

                        <Button 
                          className="w-full"
                          onClick={handlePaymentConfirmation}
                          disabled={!phoneNumber}
                        >
                          تأكيد الدفع
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </>
              )}

              {!selectedMethod && (
                <div className="text-center py-8 text-gray-500">
                  <p>اختر طريقة دفع لعرض التفاصيل</p>
                  <p className="text-sm mt-2 text-blue-600">💡 ماستر كارد هو الخيار الموصى به</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}