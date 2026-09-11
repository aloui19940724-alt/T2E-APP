import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { supabase, uploadImageAsync } from '../lib/supabase';
import { Card, Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function AdvertiseScreen() {
  const { user } = useAuth();
  const [taskType, setTaskType] = useState('');
  const [platform, setPlatform] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [txHash, setTxHash] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  }

  async function submit() {
    setError(null);
    if (!user) return;
    if (!taskType || !platform || !targetUrl || !txHash || !imageUri) {
      setError('الرجاء تعبئة جميع الحقول وإرفاق صورة إثبات الدفع');
      return;
    }
    setSubmitting(true);
    const imageUrl = await uploadImageAsync('request-images', imageUri, user.id);
    const { error } = await supabase.from('task_requests').insert({
      user_id: user.id,
      task_type: taskType,
      platform,
      target_url: targetUrl,
      tx_hash: txHash,
      image: imageUrl,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      Alert.alert('تم الإرسال', 'تم إرسال طلب المهمة الإعلانية للمراجعة.');
      setTaskType('');
      setPlatform('');
      setTargetUrl('');
      setTxHash('');
      setImageUri(null);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>أعلن معنا</Text>
      <Text style={styles.subtitle}>اطلب نشر مهمة إعلانية جديدة على المنصة</Text>
      <Card style={{ marginTop: 16 }}>
        <Input placeholder="نوع المهمة (متابعة، إعجاب، اشتراك...)" value={taskType} onChangeText={setTaskType} />
        <Input placeholder="المنصة (تويتر، تيليجرام...)" value={platform} onChangeText={setPlatform} style={{ marginTop: 10 }} />
        <Input placeholder="رابط الهدف" value={targetUrl} onChangeText={setTargetUrl} style={{ marginTop: 10 }} />
        <Input placeholder="رقم عملية الدفع (Tx Hash)" value={txHash} onChangeText={setTxHash} style={{ marginTop: 10 }} />
        <Button title={imageUri ? 'تم إرفاق الصورة' : 'إرفاق إثبات الدفع'} onPress={pickImage} variant="outline" style={{ marginTop: 10 }} />
        <ErrorText text={error} />
        <Button title="إرسال الطلب" onPress={submit} loading={submitting} style={{ marginTop: 14 }} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' },
  subtitle: { color: colors.muted, marginTop: 6, textAlign: 'right' },
});
