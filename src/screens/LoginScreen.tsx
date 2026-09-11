import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>تسجيل الدخول</Text>
      <Text style={styles.subtitle}>سجّل دخولك للمتابعة وربح المزيد من المهام</Text>

      <View style={styles.form}>
        <Input
          placeholder="البريد الإلكتروني"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="كلمة المرور"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ marginTop: 12 }}
        />
        <ErrorText text={error} />

        <Button title="دخول" onPress={handleLogin} loading={loading} style={{ marginTop: 20 }} />

        <Button
          title="نسيت كلمة المرور؟"
          onPress={() => navigation.navigate('ResetPassword')}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ليس لديك حساب؟</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          {' '}
          إنشاء حساب
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  form: {},
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
