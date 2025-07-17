# احفظ هاتفك - Save Your Phone 📱🔒

تطبيق أمان شامل لحماية الأجهزة الذكية من التهديدات والبرمجيات الضارة

## 🌟 المميزات الرئيسية

### 🔍 فحص أمني شامل
- كشف البرمجيات الضارة والتهديدات
- تحليل أمان المتصفح والإضافات
- فحص الشبكة والاتصالات
- تقييم إعدادات الخصوصية

### 💰 نموذج تجاري مرن
- **مجاني**: 2 فحوصات تجريبية
- **مدفوع**: $7/شهر للفحوصات غير المحدودة
- دعم مدفوعات Stripe عالمياً
- حلول دفع محلية للعراق (ZainCash, AsiaCell Cash)

### 🌍 دعم متعدد اللغات
- العربية (الواجهة الأساسية)
- الإنجليزية
- الفرنسية

### 🎯 واجهة حديثة
- تصميم متجاوب لجميع الأجهزة
- مكونات shadcn/ui احترافية
- ثيم مظلم/فاتح
- تجربة مستخدم سلسة

## 🚀 التقنيات المستخدمة

### Frontend
- **React 18** + TypeScript
- **Vite** للبناء السريع
- **Tailwind CSS** للتصميم
- **shadcn/ui** للمكونات
- **TanStack Query** لإدارة البيانات

### Backend  
- **Express.js** + TypeScript
- **PostgreSQL** + Drizzle ORM
- **Stripe** للمدفوعات
- **Session Management** آمن

### Deployment
- **Vercel** (مقترح)
- **Railway** (مع قاعدة بيانات)
- **Render** (مجاني)
- **Docker** (لأي منصة)

## 📦 التثبيت والتشغيل

### متطلبات
- Node.js 20+
- PostgreSQL
- npm أو yarn

### خطوات التثبيت
```bash
# استنسخ المشروع
git clone https://github.com/AH98-lab/save-your-phone.git
cd save-your-phone

# تثبيت Dependencies
npm install

# إعداد قاعدة البيانات
cp .env.example .env
# أضف DATABASE_URL و SESSION_SECRET

# تشغيل Migration
npm run db:push

# تشغيل التطبيق
npm run dev
```

## 🌐 النشر السريع

### Vercel (الأسرع)
```bash
npm run build
npx vercel --prod
```

### Railway (مع قاعدة بيانات)
1. اربط GitHub repository
2. أضف PostgreSQL service
3. أضف متغيرات البيئة
4. نشر تلقائي

### Docker
```bash
docker-compose up -d
```

## 🔧 متغيرات البيئة

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-very-secret-key-here
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_... (اختياري)
VITE_STRIPE_PUBLIC_KEY=pk_live_... (اختياري)
```

## 📊 إحصائيات المشروع

- **📁 الملفات**: 50+ ملف منظم
- **⚡ الأداء**: CSS 71.9KB, JS 464.3KB (مضغوط)
- **🔒 الأمان**: HTTPS + تشفير قواعد البيانات
- **🌍 التوفر**: 99.9% uptime متوقع

## 💼 النموذج التجاري

### إيرادات متوقعة
- **شهر 1**: 10 مشترك × $7 = $70
- **شهر 3**: 100 مشترك × $7 = $700
- **شهر 6**: 1000 مشترك × $7 = $7000

### السوق المستهدف
- مستخدمو الهواتف الذكية
- الشركات الصغيرة والمتوسطة
- المهتمون بالأمان الرقمي
- السوق العربي والعالمي

## 🎯 المميزات القادمة

- [ ] تطبيق موبايل أصلي (Android/iOS)
- [ ] ذكاء اصطناعي لكشف التهديدات
- [ ] تقارير أمنية مفصلة
- [ ] مزامنة متعددة الأجهزة
- [ ] دعم لغات إضافية

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push وإنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل

- **الموقع**: [قريباً]
- **الدعم**: [قريباً]
- **التحديثات**: [قريباً]

---

**🚀 المشروع جاهز للانطلاق التجاري الفوري!**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AH98-lab/save-your-phone)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/AH98-lab/save-your-phone)