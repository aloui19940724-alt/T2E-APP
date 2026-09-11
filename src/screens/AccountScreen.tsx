import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { supabase, uploadKycImageAsync, logSupabaseError } from '../lib/supabase';
import { Card, Input, ErrorText } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

type DocType = 'cin' | 'passport' | 'permis';

export default function AccountScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [country, setCountry] = useState('');
  const [docType, setDocType] = useState<DocType>('cin');
  const needsBackPhoto = docType === 'cin' || docType === 'permis';

  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  async function saveName() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('users').update({ name }).eq('id', user.id);
    setSaving(false);
    if (error) setError(error.message);
    else {
      await refreshProfile();
      Alert.alert('تم الحفظ', 'تم تحديث الاسم بنجاح');
    }
  }

  async function pickKyc(side: 'front' | 'back') {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) {
      if (side === 'front') setFrontUri(result.assets[0].uri);
      else setBackUri(result.assets[0].uri);
    }
  }

  async function submitKyc() {
    setKycError(null);
    if (!user) return;
    if (!fullName.trim() || !idNumber.trim()) {
      setKycError('الرجاء إدخال الاسم الكامل ورقم الهوية');
      return;
    }
    if (!country) {
      setKycError('الرجاء إدخال بلد الإقامة');
      return;
    }
    if (!frontUri) {
      setKycError('الرجاء إرفاق صورة الوجه الأمامي للوثيقة');
      return;
    }
    if (needsBackPhoto && !backUri) {
      setKycError('هذا النوع من الوثائق يتطلب صورة الوجه الخلفي أيضاً');
      return;
    }
    setKycSubmitting(true);
    try {
      const frontPath = await uploadKycImageAsync(frontUri, user.id, 'front');
      if (!frontPath) throw new Error('تعذر رفع صورة الوجه الأمامي');
      let backPath: string | null = null;
      if (needsBackPhoto && backUri) {
        backPath = await uploadKycImageAsync(backUri, user.id, 'back');
        if (!backPath) throw new Error('تعذر رفع صورة الوجه الخلفي');
      }

      const { error } = await supabase.rpc('request_kyc_verification', {
        p_full_name: fullName.trim(),
        p_id_number: idNumber.trim(),
        p_document_image: frontPath,
        p_country: country,
        p_document_type: docType,
        p_document_image_back: needsBackPhoto ? backPath : null,
      });
      if (error) throw error;

      Alert.alert('تم الإرسال', 'تم إرسال طلب التحقق من الهوية، بانتظار المراجعة.');
      setFullName('');
      setIdNumber('');
      setCountry('');
      setFrontUri(null);
      setBackUri(null);
      await refreshProfile();
    } catch (err: any) {
      logSupabaseError(err, 'submitKyc');
      setKycError(err.message ?? 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setKycSubmitting(false);
    }
  }

  const kycStatus = profile?.kyc_status ?? 'none';
  const kycLabel: Record<string, string> = {
    none: 'غير موثّق',
    pending: 'قيد المراجعة',
    verified: 'موثّق ✅',
    rejected: 'مرفوض — يمكنك إعادة المحاولة',
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
        <Input placeholder="الاسم الكامل" value={name} onChangeText={setName} />
        <ErrorText text={error} />
        <Button title="حفظ" onPress={saveName} loading={saving} style={{ marginTop: 12 }} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>التحقق من الهوية (KYC)</Text>
        <Text style={styles.hint}>الحالة الحالية: {kycLabel[kycStatus] ?? kycStatus}</Text>

        {kycStatus !== 'verified' && (
          <>
            <Input placeholder="الاسم الكامل كما في الوثيقة" value={fullName} onChangeText={setFullName} style={{ marginTop: 10 }} />
            <Input placeholder="رقم الهوية" value={idNumber} onChangeText={setIdNumber} style={{ marginTop: 10 }} />
            <Input placeholder="البلد" value={country} onChangeText={setCountry} style={{ marginTop: 10 }} />

            <View style={styles.docTypeRow}>
              {(['cin', 'passport', 'permis'] as DocType[]).map((t) => (
                <Text
                  key={t}
                  onPress={() => setDocType(t)}
                  style={[styles.docTypeOption, docType === t && styles.docTypeOptionActive]}
                >
                  {t === 'cin' ? 'بطاقة هوية' : t === 'passport' ? 'جواز سفر' : 'رخصة قيادة'}
                </Text>
              ))}
            </View>

            <Button title={frontUri ? 'تم اختيار الوجه الأمامي' : 'اختيار صورة الوجه الأمامي'} onPress={() => pickKyc('front')} variant="outline" style={{ marginTop: 10 }} />
            {needsBackPhoto && (
              <Button title={backUri ? 'تم اختيار الوجه الخلفي' : 'اختيار صورة الوجه الخلفي'} onPress={() => pickKyc('back')} variant="outline" style={{ marginTop: 10 }} />
            )}
            <ErrorText text={kycError} />
            <Button title="إرسال طلب التحقق" onPress={submitKyc} loading={kycSubmitting} style={{ marginTop: 14 }} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  hint: { color: colors.muted, fontSize: 12, textAlign: 'right', marginBottom: 6 },
  docTypeRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  docTypeOption: {
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    marginLeft: 6,
    marginBottom: 6,
  },
  docTypeOptionActive: {
    color: '#04140F',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    fontWeight: '700',
  },
});
