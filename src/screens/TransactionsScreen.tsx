import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { Card, EmptyState } from '../components/UI';
import { colors } from '../theme';

const PAGE_SIZE = 20;

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description?: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  task_reward: 'مكافأة مهمة',
  withdrawal: 'سحب',
  referral_bonus: 'مكافأة إحالة',
  vip_purchase: 'اشتراك VIP',
};

export default function TransactionsScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (offset: number) => {
    const { data, error } = await supabase.rpc('get_my_transactions', {
      p_limit: PAGE_SIZE,
      p_offset: offset,
    });
    if (error) {
      logSupabaseError(error, 'loadTransactions');
      return [];
    }
    const rows = (data as Transaction[]) ?? [];
    setHasMore(rows.length === PAGE_SIZE);
    return rows;
  }, []);

  useEffect(() => {
    loadPage(0).then(setItems);
  }, [loadPage]);

  async function onRefresh() {
    setRefreshing(true);
    const rows = await loadPage(0);
    setItems(rows);
    setRefreshing(false);
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const rows = await loadPage(items.length);
    setItems((prev) => [...prev, ...rows]);
    setLoadingMore(false);
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      data={items}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={<Text style={styles.title}>سجل المعاملات</Text>}
      ListEmptyComponent={<EmptyState text="لا توجد معاملات بعد" />}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.desc}>{item.description || TYPE_LABEL[item.type] || item.type}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString('ar')}</Text>
          </View>
          <Text style={[styles.amount, { color: item.amount >= 0 ? colors.primary : colors.danger }]}>
            {item.amount >= 0 ? '+' : ''}{item.amount} USDT
          </Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right', marginBottom: 12 },
  desc: { color: colors.text, textAlign: 'right' },
  date: { color: colors.muted, fontSize: 11, marginTop: 4, textAlign: 'right' },
  amount: { fontWeight: '700' },
});
