import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, Input, ErrorText, EmptyState } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

const MIN_WITHDRAWAL = 5; // USDT

type Withdrawal = {
  id: string;
  amount: number;
  payment_details: string;
  payment_method?: 'USDT' | 'D17' | null;
  status: 'pending' | 'processed' | 'rejected';
  created_at: string;
};

export default function WalletScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'D17'>('USDT');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const kycStatus = profile?.kyc_status ?? 'none';
  const isVerified = kycStatus === 'verified';

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) logSupabaseError(error, 'loadWithdrawals');
    else setWithdrawals((data as Withdrawal[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([load(), refreshProfile()]);
    setRefreshing(false);
  }

  async function handleWithdraw() {
    setError(null);
    if (!profile || profile.balance < MIN_WITHDRAWAL) {
      setError(`الحد الأدنى للسحب هو ${MIN_WITHDRAWAL} USDT`);
      return;
    }
    if (!isVerified) {
      setError('يجب توثيق هويتك (KYC) قبل طلب السحب — من صفحة "حسابي والإعدادات"');
      return;
    }
    if (!paymentDetails.trim()) {
      setError(paymentMethod === 'USDT' ? 'الرجاء إدخال عنوان محفظة USDT (BEP20)' : 'الرجاء إدخال رقم D17');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc('request_withdrawal', {
      p_payment_details: paymentDetails.trim(),
      p_payment_method: paymentMethod,
    });
    setSubmitting(false);
    if (error) {
      logSupabaseError(error, 'withdrawals:create');
      setError(error.message);
    } else {
      setPaymentDetails('');
      Alert.alert('تم الإرسال', 'تم إرسال طلب السحب وسيتم مراجعته من الإدارة.');
      await Promise.all([load(), refreshProfile()]);
    }
  }

  const statusLabel: Record<string, string> = {
    pending: 'قيد المراجعة',
    processed: 'تمت المعالجة',
    rejected: 'مرفوض',
  };
  const statusColor: Record<string, string> = {
    pending: colors.warning,
    processed: colors.primary,
    rejected: colors.danger,
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      data={withdrawals}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Card style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
            <Text style={styles.balanceValue}>{profile?.balance ?? 0} USDT</Text>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>طلب سحب</Text>
            {!isVerified && (
              <Text style={styles.kycWarning}>
                السحب يتطلب توثيق الهوية (KYC) أولاً — يمكنك إتمامه من صفحة حسابي.
              </Text>
            )}
            <View style={styles.methodRow}>
              <Text
                onPress={() => setPaymentMethod('USDT')}
                style={[styles.methodOption, paymentMethod === 'USDT' && styles.methodOptionActive]}
              >
                USDT
              </Text>
              <Text
                onPress={() => setPaymentMethod('D17')}
                style={[styles.methodOption, paymentMethod === 'D17' && styles.methodOptionActive]}
              >
                D17
              </Text>
            </View>
            <Input
              placeholder={paymentMethod === 'USDT' ? 'عنوان محفظة USDT (BEP20)' : 'رقم D17'}
              value={paymentDetails}
              onChangeText={setPaymentDetails}
              style={{ marginTop: 10 }}
            />
            <ErrorText text={error} />
            <Button title="إرسال طلب السحب" onPress={handleWithdraw} loading={submitting} style={{ marginTop: 14 }} />
          </Card>

          <Text style={styles.sectionTitle}>سجل عمليات السحب</Text>
        </View>
      }
      ListEmptyComponent={<EmptyState text="لا توجد عمليات سحب بعد" />}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.amount}>{item.amount} USDT</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('ar')}</Text>
          </View>
          <Text style={{ color: statusColor[item.status], fontWeight: '700' }}>{statusLabel[item.status]}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  balanceLabel: { color: colors.muted, fontSize: 13 },
  balanceValue: { color: colors.primary, fontSize: 30, fontWeight: '800', marginTop: 6 },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  kycWarning: { color: colors.warning, fontSize: 12, textAlign: 'right', marginBottom: 8 },
  methodRow: { flexDirection: 'row-reverse', gap: 8 },
  methodOption: {
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginLeft: 8,
  },
  methodOptionActive: {
    color: '#04140F',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    fontWeight: '700',
  },
  amount: { color: colors.text, fontWeight: '700' },
  date: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
