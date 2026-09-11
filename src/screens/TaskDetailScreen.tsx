import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase, logSupabaseError, uploadImageAsync } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, Input, ErrorText, Screen } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [proof, setProof] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', taskId).single();
      if (error) logSupabaseError(error, 'loadTask');
      else setTask(data);

      if (user) {
        const { data: existing } = await supabase
          .from('submissions')
          .select('id,status')
          .eq('task_id', taskId)
          .eq('user_id', user.id)
          .in('status', ['pending', 'approved'])
          .maybeSingle();
        if (existing) setAlreadySubmitted(true);
      }
      setLoading(false);
    })();
  }, [taskId, user]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('إذن مطلوب', 'يرجى السماح بالوصول إلى الصور لإرفاق دليل الإنجاز');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!user) {
      setError('الرجاء تسجيل الدخول أولاً');
      return;
    }
    if (!proof.trim()) {
      setError('الرجاء كتابة دليل إنجاز المهمة');
      return;
    }
    setSubmitting(true);
    let imageUrl: string | null = null;
    if (imageUri) {
      imageUrl = await uploadImageAsync('proof-images', imageUri, user.id);
    }
    const { error } = await supabase.from('submissions').insert({
      task_id: taskId,
      user_id: user.id,
      proof: proof.trim(),
      image: imageUrl,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      Alert.alert('تم الإرسال', 'تم إرسال إثبات إنجاز المهمة، بانتظار مراجعة الإدارة.');
      navigation.goBack();
    }
  }

  if (loading || !task) {
    return (
      <Screen>
        <Text style={{ color: colors.muted }}>جاري التحميل...</Text>
      </Screen>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      {task.image && <Image source={{ uri: task.image }} style={styles.image} />}
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.reward}>{task.reward} USDT</Text>
      <Text style={styles.desc}>{task.description}</Text>

      {alreadySubmitted ? (
        <Card style={{ marginTop: 20 }}>
          <Text style={{ color: colors.warning, textAlign: 'right' }}>
            لقد قمت بالفعل بإرسال إثبات لهذه المهمة. بانتظار المراجعة أو تمت الموافقة عليها.
          </Text>
        </Card>
      ) : (
        <Card style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>إرسال إثبات الإنجاز</Text>
          <Input
            placeholder="اكتب رابط/وصف إثبات إنجاز المهمة"
            value={proof}
            onChangeText={setProof}
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />
          <Button
            title={imageUri ? 'تغيير الصورة' : 'إرفاق صورة (اختياري)'}
            onPress={pickImage}
            variant="outline"
            style={{ marginTop: 12 }}
          />
          {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
          <ErrorText text={error} />
          <Button title="إرسال" onPress={handleSubmit} loading={submitting} style={{ marginTop: 16 }} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: 14, backgroundColor: colors.card },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 14, textAlign: 'right' },
  reward: { color: colors.primary, fontWeight: '800', marginTop: 6, textAlign: 'right' },
  desc: { color: colors.muted, marginTop: 10, lineHeight: 20, textAlign: 'right' },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  preview: { width: '100%', height: 160, borderRadius: 10, marginTop: 10 },
});
