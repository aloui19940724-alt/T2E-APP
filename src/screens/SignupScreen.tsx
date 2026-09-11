import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    setError(null);
    if (!email || !password) {
      setError('الرجاء تعبئة جميع الحقول');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>تحقق من بريدك الإلكتروني</Text>
        <Text style={styles.subtitle}>
          أرسلنا رابط تأكيد إلى بريدك الإلكتروني. فعّل حسابك ثم سجّل الدخول.
        </Text>
        <Button title="الذهاب لتسجيل الدخول" onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>إنشاء حساب جديد</Text>
      <Text style={styles.subtitle}>ابدأ بربح المال عبر إنجاز المهام</Text>

      <Input placeholder="البريد الإلكتروني" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="كلمة المرور" secureTextEntry value={password} onChangeText={setPassword} style={{ marginTop: 12 }} />
      <Input placeholder="تأكيد كلمة المرور" secureTextEntry value={confirm} onChangeText={setConfirm} style={{ marginTop: 12 }} />
      <ErrorText text={error} />

      <Button title="إنشاء حساب" onPress={handleSignup} loading={loading} style={{ marginTop: 20 }} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>لديك حساب بالفعل؟</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          {' '}
          تسجيل الدخول
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
