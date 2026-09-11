# Task2Earn — تطبيق أندرويد (React Native / Expo)

تطبيق React Native حقيقي (Expo) لمنصة Task2Earn، مربوط بنفس قاعدة بيانات Supabase
المستخدمة في موقعك (نفس الجداول والـ RPC functions الموجودة فعليًا في مجلد
`supabase/` بمشروعك الأصلي — تم فحص الكود الحقيقي وليس افتراضات).

## الشاشات المتوفرة
- تسجيل دخول / إنشاء حساب / استعادة كلمة المرور (Supabase Auth)
- المهام: قائمة المهام + التفاصيل + إرسال إثبات إنجاز (مع صورة اختيارية)
- المحفظة: الرصيد + طلب سحب (USDT / D17) عبر `request_withdrawal`
- VIP: عرض الباقات + الاشتراك عبر `subscribe_vip_points`
- الإحالات: رابط دعوة + إحصائيات عبر `get_my_referral_summary` / `get_my_referrals`
- لوحة المتصدرين: عبر `get_leaderboard` / `get_my_leaderboard_rank`
- سجل المعاملات: عبر `get_my_transactions` (مع تحميل تدريجي)
- حسابي: تعديل الاسم + توثيق الهوية KYC عبر `request_kyc_verification`
  (رفع الصور لـ Storage bucket الخاص `kyc-documents` كما في الموقع)
- إشعارات، أعلن معنا (task_requests)، الشروط والأحكام، تواصل معنا

## ما لم يُبنَ بعد
- لوحة تحكم الأدمن (غير منطقية داخل تطبيق مستخدم عادي — أخبرني إن احتجتها كتطبيق منفصل)
- إشعارات Push حقيقية (الشاشة تعرض الإشعارات المخزنة بقاعدة البيانات فقط، بدون FCM)
- أيقونة/شعار مخصص للتطبيق (استخدم صورة placeholder — استبدل `assets/icon.png`)

---

## 1. المتطلبات
- Node.js 18+ و npm
- حساب [Expo](https://expo.dev) (مجاني) لبناء APK عبر EAS
- بيانات مشروع Supabase الخاص بك (URL + anon key) — نفس القيم المستخدمة بملف
  `.env.local` بمشروع الويب الأصلي.

## 2. الإعداد

```bash
cd task2earn-app
npm install
```

افتح `app.json` وضع بيانات Supabase الحقيقية بدل القيم الوهمية:

```json
"extra": {
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGciOi..."
}
```

## 3. التشغيل للتجربة (على جهازك عبر تطبيق Expo Go)

```bash
npx expo start
```

امسح رمز QR بتطبيق **Expo Go** (متوفر على Google Play) لتجربة التطبيق مباشرة
على هاتفك الأندرويد دون الحاجة لبناء APK.

## 4. بناء ملف APK حقيقي (لتثبيته يدويًا أو رفعه لمتجر Google Play)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

بعد انتهاء البناء (على سيرفرات Expo السحابية)، بيعطيك رابط تحميل ملف `.apk`
جاهز للتثبيت المباشر. لرفعه على Google Play لاحقًا، استخدم بروفايل
`production` (ينتج `.aab`).

## 5. ملاحظات مهمة
- التطبيق يستخدم **نفس صلاحيات RLS و RPC functions** الموجودة بقاعدة بياناتك
  الحالية — أي تعديل مستقبلي على الـ backend (migrations جديدة) يجب تطبيقه
  بنفس الطريقة على الموقع والتطبيق معًا.
- توثيق الهوية (KYC) والسحب يتطلبان تفعيل bucket التخزين `kyc-documents`
  و`proof-images` و`request-images` كما هو موضح في migrations مشروعك.
- الحد الأدنى للسحب حاليًا 5 USDT ويتطلب توثيق هوية "verified" — نفس شرط الموقع.
