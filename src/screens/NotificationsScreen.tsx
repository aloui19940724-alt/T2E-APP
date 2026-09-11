import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, EmptyState } from '../components/UI';
import { colors } from '../theme';

type Notif = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) logSupabaseError(error, 'loadNotifications');
    else setItems((data as Notif[]) ?? []);
  }, [user]);

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
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>الإشعارات</Text>}
      ListEmptyComponent={<EmptyState text="لا توجد إشعارات" />}
      renderItem={({ item }) => (
        <Card style={[styles.card, !item.read && { borderColor: colors.primary }]}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleString('ar')}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right', marginBottom: 12 },
  card: { marginBottom: 10 },
  notifTitle: { color: colors.text, fontWeight: '700', textAlign: 'right' },
  notifBody: { color: colors.muted, marginTop: 4, textAlign: 'right' },
  date: { color: colors.muted, fontSize: 11, marginTop: 6, textAlign: 'right' },
});
