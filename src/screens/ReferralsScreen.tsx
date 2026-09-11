import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Share } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, EmptyState } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

type ReferralSummary = {
  referral_code?: string;
  total_referrals?: number;
  total_earned?: number;
};

type ReferralRow = {
  id: string;
  referred_email?: string;
  status?: string;
  reward?: number;
  created_at: string;
};

export default function ReferralsScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const referralCode = summary?.referral_code ?? user?.id?.slice(0, 8) ?? '';
  const referralLink = `https://task2earn.app/signup?ref=${referralCode}`;

  const load = useCallback(async () => {
    const [{ data: summaryData, error: summaryError }, { data: referralsData, error: referralsError }] =
      await Promise.all([
        supabase.rpc('get_my_referral_summary'),
        supabase.rpc('get_my_referrals'),
      ]);
    if (summaryError) logSupabaseError(summaryError, 'loadReferralSummary');
    else setSummary(((summaryData ?? [])[0] as ReferralSummary) ?? null);
    if (referralsError) logSupabaseError(referralsError, 'loadReferrals');
    else setReferrals((referralsData as ReferralRow[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function shareLink() {
    try {
      await Share.share({ message: `انضم إليّ في Task2Earn واربح المال من إنجاز المهام: ${referralLink}` });
    } catch (e) {
      // ignore share cancellation
    }
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      data={referrals}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.title}>الإحالات</Text>
          <Card style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={styles.codeLabel}>رابط الدعوة الخاص بك</Text>
            <Text style={styles.code} selectable>{referralLink}</Text>
            <Button title="مشاركة الرابط" onPress={shareLink} style={{ marginTop: 12, alignSelf: 'stretch' }} />
          </Card>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{summary?.total_referrals ?? referrals.length}</Text>
              <Text style={styles.statLabel}>عدد الإحالات</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{summary?.total_earned ?? 0}</Text>
              <Text style={styles.statLabel}>إجمالي الأرباح</Text>
            </Card>
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState text="لم تقم بدعوة أي شخص بعد" />}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
          <Text style={styles.email}>{item.referred_email ?? 'مستخدم جديد'}</Text>
          <Text style={{ color: colors.primary }}>{item.reward ? `${item.reward} USDT` : item.status ?? ''}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' },
  codeLabel: { color: colors.muted, fontSize: 13 },
  code: { color: colors.primary, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  statsRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  email: { color: colors.text },
});
