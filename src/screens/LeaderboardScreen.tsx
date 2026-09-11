import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { Card, EmptyState } from '../components/UI';
import { colors } from '../theme';

const TOP_N = 20;

type LeaderRow = {
  user_id?: string;
  id?: string;
  name?: string | null;
  email?: string;
  total_points?: number;
  balance?: number;
  rank?: number;
};

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [myRank, setMyRank] = useState<LeaderRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [{ data: board, error: boardError }, { data: mine, error: mineError }] = await Promise.all([
      supabase.rpc('get_leaderboard', { p_limit: TOP_N }),
      supabase.rpc('get_my_leaderboard_rank'),
    ]);
    if (boardError) logSupabaseError(boardError, 'loadLeaderboard');
    else setRows((board as LeaderRow[]) ?? []);
    if (mineError) logSupabaseError(mineError, 'loadMyRank');
    else setMyRank(((mine ?? [])[0] as LeaderRow) ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      data={rows}
      keyExtractor={(item, i) => item.user_id ?? item.id ?? String(i)}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.title}>لوحة المتصدرين</Text>
          {myRank && (
            <Card style={{ marginTop: 12, borderColor: colors.primary }}>
              <Text style={styles.myRankText}>
                ترتيبك: #{myRank.rank ?? '—'} · {myRank.total_points ?? myRank.balance ?? 0} نقطة
              </Text>
            </Card>
          )}
        </View>
      }
      ListEmptyComponent={<EmptyState text="لا توجد بيانات بعد" />}
      renderItem={({ item, index }) => (
        <Card style={styles.row}>
          <Text style={styles.rank}>#{item.rank ?? index + 1}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name || item.email || 'مستخدم'}</Text>
          <Text style={styles.score}>{item.total_points ?? item.balance ?? 0}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' },
  myRankText: { color: colors.primary, fontWeight: '700', textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  rank: { color: colors.muted, width: 40, fontWeight: '700' },
  name: { flex: 1, color: colors.text, textAlign: 'right', marginHorizontal: 8 },
  score: { color: colors.primary, fontWeight: '700' },
});
