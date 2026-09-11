import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function LegalScreen() {
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>الشروط والأحكام</Text>
      <Text style={styles.paragraph}>
        باستخدامك للتطبيق فإنك توافق على الشروط والأحكام وسياسة الخصوصية الخاصة بالمنصة. يرجى مراجعة
        النسخة الكاملة من الشروط على موقعنا الرسمي للاطلاع على كافة التفاصيل المتعلقة بالمهام، السحب،
        وحسابات المستخدمين.
      </Text>
      <Text style={styles.title}>سياسة الخصوصية</Text>
      <Text style={styles.paragraph}>
        نحرص على حماية بياناتك الشخصية ولا نشاركها مع أي طرف ثالث إلا بموجب القانون أو بموافقتك الصريحة.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right', marginTop: 16 },
  paragraph: { color: colors.muted, marginTop: 8, lineHeight: 22, textAlign: 'right' },
});
