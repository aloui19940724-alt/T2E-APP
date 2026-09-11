import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, EmptyState } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

type VipPlan = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  perks?: string[] | null;
};

export default function VipScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('vip_plans').select('*').order('price', { ascending: true });
    if (error) logSupabaseError(error, 'loadVipPlans');
    else setPlans((data as VipPlan[]) ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([load(), refreshProfile()]);
    setRefreshing(false);
  }

  const isActive = profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date();

  async function subscribe(plan: VipPlan) {
    if (!user) return;
    if (!profile || profile.balance < plan.price) {
      Alert.alert('رصيد غير كافٍ', 'يرجى شحن رصيدك أو إتمام مهام إضافية أولاً.');
      return;
    }
    Alert.alert(
      'تأكيد الاشتراك',
      `هل تريد الاشتراك في باقة ${plan.name} مقابل ${plan.price} USDT؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            const { error } = await supabase.rpc('subscribe_vip_points', { p_plan_id: plan.id });
            if (error) {
              logSupabaseError(error, 'subscribeVip');
              Alert.alert('تعذر الاشتراك', error.message);
            } else {
              await refreshProfile();
              Alert.alert('تم بنجاح', 'تم تفعيل اشتراك VIP الخاص بك.');
            }
          },
        },
      ]
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      data={plans}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.title}>باقات VIP</Text>
          <Text style={styles.subtitle}>
            {isActive
              ? `اشتراكك مفعّل حتى ${new Date(profile!.vip_expires_at!).toLocaleDateString('ar')}`
              : 'اشترك للحصول على مهام حصرية ومكافآت أعلى'}
          </Text>
        </View>
      }
      ListEmptyComponent={!loading ? <EmptyState text="لا توجد باقات VIP متاحة حالياً" /> : null}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planPrice}>{item.price} USDT / {item.duration_days} يوم</Text>
          {item.perks?.map((p, i) => (
            <Text key={i} style={styles.perk}>• {p}</Text>
          ))}
          <Button title="اشترك الآن" onPress={() => subscribe(item)} style={{ marginTop: 12 }} />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' },
  subtitle: { color: colors.muted, marginTop: 6, textAlign: 'right' },
  planName: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right' },
  planPrice: { color: colors.primary, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  perk: { color: colors.muted, marginTop: 6, textAlign: 'right' },
});
