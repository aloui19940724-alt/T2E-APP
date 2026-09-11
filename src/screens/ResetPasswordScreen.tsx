import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function ResetPasswordScreen({ navigation }: any) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    if (!email) {
      setError('الرجاء إدخال بريدك الإلكتروني');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>استعادة كلمة المرور</Text>
      {sent ? (
        <Text style={styles.subtitle}>تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.</Text>
      ) : (
        <>
          <Text style={styles.subtitle}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</Text>
          <Input placeholder="البريد الإلكتروني" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <ErrorText text={error} />
          <Button title="إرسال الرابط" onPress={handleReset} loading={loading} style={{ marginTop: 16 }} />
        </>
      )}
      <Button title="العودة لتسجيل الدخول" onPress={() => navigation.navigate('Login')} variant="outline" style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginVertical: 16 },
});
