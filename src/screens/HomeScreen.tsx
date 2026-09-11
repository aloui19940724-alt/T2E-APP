import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, Image } from 'react-native';
import { supabase, logSupabaseError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, EmptyState, Screen } from '../components/UI';
import { colors } from '../theme';

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: string;
  image: string | null;
  vip_only?: boolean;
};

export default function HomeScreen({ navigation }: any) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) {
      logSupabaseError(error, 'loadTasks');
    } else {
      setTasks((data as Task[]) ?? []);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTasks().finally(() => setLoading(false));
  }, [loadTasks]);

  async function onRefresh() {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }

  return (
    <Screen style={{ padding: 0 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً 👋</Text>
          <Text style={styles.balance}>
            الرصيد: <Text style={{ color: colors.primary, fontWeight: '800' }}>{profile?.balance ?? 0} USDT</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <EmptyState text="لا توجد مهام متاحة حالياً" /> : null}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
            <Card style={{ marginBottom: 12, flexDirection: 'row-reverse', alignItems: 'center' }}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]} />
              )}
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.reward}>{item.reward} USDT</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { color: colors.text, fontSize: 20, fontWeight: '800' },
  balance: { color: colors.muted, marginTop: 4, fontSize: 14 },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.border },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  taskTitle: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'right' },
  taskDesc: { color: colors.muted, fontSize: 12, marginTop: 2, textAlign: 'right' },
  reward: { color: colors.primary, fontWeight: '800', marginTop: 6, textAlign: 'right' },
});
