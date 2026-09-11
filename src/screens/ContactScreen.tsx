import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Card, Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function ContactScreen() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  function send() {
    if (!message.trim()) {
      setError('الرجاء كتابة رسالتك');
      return;
    }
    setError(null);
    const mailto = `mailto:support@task2earn.app?subject=${encodeURIComponent(
      'استفسار من التطبيق'
    )}&body=${encodeURIComponent(message)}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('تعذر فتح البريد', 'يرجى التواصل معنا مباشرة عبر support@task2earn.app')
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>تواصل معنا</Text>
      <Card style={{ marginTop: 16 }}>
        <Input
          placeholder="اكتب رسالتك هنا..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <ErrorText text={error} />
        <Button title="إرسال" onPress={send} style={{ marginTop: 14 }} />
      </Card>
      <Text style={styles.altText}>أو راسلنا مباشرة عبر: support@task2earn.app</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' },
  altText: { color: colors.muted, marginTop: 16, textAlign: 'center' },
});
