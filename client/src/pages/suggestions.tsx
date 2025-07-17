import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Send, ArrowLeft, MessageSquare, Star, Zap, Shield, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Suggestion {
  id: number;
  username: string;
  email?: string;
  suggestionText: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function Suggestions() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    suggestionText: "",
    category: "general"
  });

  // Fetch existing suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["/api/suggestions"],
  });

  // Submit suggestion mutation
  const submitSuggestion = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/suggestions", data);
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الاقتراح بنجاح",
        description: "شكراً لك! سنراجع اقتراحك قريباً",
      });
      setFormData({
        username: "",
        email: "",
        suggestionText: "",
        category: "general"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
    onError: () => {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال اقتراحك. حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.suggestionText) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء الاسم والاقتراح على الأقل",
        variant: "destructive",
      });
      return;
    }
    submitSuggestion.mutate(formData);
  };

  const categoryOptions = [
    { value: "general", label: "عام", icon: MessageSquare },
    { value: "features", label: "مميزات جديدة", icon: Star },
    { value: "performance", label: "تحسين الأداء", icon: Zap },
    { value: "security", label: "الأمان", icon: Shield },
    { value: "ui", label: "واجهة المستخدم", icon: Lightbulb },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">قيد المراجعة</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="text-blue-600">تمت المراجعة</Badge>;
      case 'implemented':
        return <Badge variant="outline" className="text-green-600">تم التنفيذ</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">عالية</Badge>;
      case 'medium':
        return <Badge variant="secondary">متوسطة</Badge>;
      case 'low':
        return <Badge variant="outline">منخفضة</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">الأفكار والاقتراحات</h1>
              <p className="text-gray-600">شاركنا أفكارك لتطوير تطبيق "احفظ هاتفك"</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suggestion Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                اقترح فكرة جديدة
              </CardTitle>
              <CardDescription>
                ساعدنا في تطوير التطبيق بأفكارك واقتراحاتك المبدعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">الاسم *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="اسمك أو اسم مستعار"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="للتواصل معك حول الاقتراح"
                  />
                </div>

                <div>
                  <Label htmlFor="category">فئة الاقتراح</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="suggestion">اقتراحك أو فكرتك *</Label>
                  <Textarea
                    id="suggestion"
                    value={formData.suggestionText}
                    onChange={(e) => setFormData({ ...formData, suggestionText: e.target.value })}
                    placeholder="اشرح فكرتك بالتفصيل... كيف يمكن تحسين التطبيق؟ ما المميزات التي تريد إضافتها؟"
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitSuggestion.isPending}
                >
                  {submitSuggestion.isPending ? (
                    "جاري الإرسال..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الاقتراح
                    </>
                  )}
                </Button>
              </form>

              <Alert className="mt-6">
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  <strong>نصائح لاقتراح فعال:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• كن محدداً في وصف المشكلة أو التحسين</li>
                    <li>• اشرح كيف ستفيد الفكرة المستخدمين</li>
                    <li>• اقترح حلولاً عملية قابلة للتنفيذ</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Recent Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                اقتراحات المجتمع
              </CardTitle>
              <CardDescription>
                آخر الأفكار والاقتراحات من المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion: Suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{suggestion.username}</span>
                          {getStatusBadge(suggestion.status)}
                          {getPriorityBadge(suggestion.priority)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(suggestion.createdAt).toLocaleDateString('ar')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{suggestion.suggestionText}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryOptions.find(c => c.value === suggestion.category)?.label || suggestion.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد اقتراحات حتى الآن</p>
                  <p className="text-sm">كن أول من يشارك فكرة!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Success Stories Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              أفكار تم تنفيذها
            </CardTitle>
            <CardDescription>
              اقتراحات من المجتمع ساهمت في تطوير التطبيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">محمد العراقي</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "إضافة طرق دفع محلية للعراق"
                </p>
                <Badge variant="outline" className="text-green-600">✓ تم التنفيذ</Badge>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">فاطمة أحمد</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "تحسين واجهة المسح الأمني"
                </p>
                <Badge variant="outline" className="text-green-600">✓ تم التنفيذ</Badge>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">عبدالله السعودي</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  "خفض سعر الاشتراك الشهري"
                </p>
                <Badge variant="outline" className="text-green-600">✓ تم التنفيذ</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Impact */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">تأثير المجتمع</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">47</div>
              <div className="text-sm text-gray-600">اقتراح مرسل</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2">12</div>
              <div className="text-sm text-gray-600">فكرة منفذة</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-2">18</div>
              <div className="text-sm text-gray-600">قيد المراجعة</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-2">5</div>
              <div className="text-sm text-gray-600">أيام متوسط التنفيذ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}