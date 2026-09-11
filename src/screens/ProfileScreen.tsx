import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI';
import Button from '../components/Button';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }: any) {
  const { profile, user, signOut } = useAuth();

  function confirmSignOut() {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من رغبتك بتسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تسجيل الخروج', style: 'destructive', onPress: signOut },
    ]);
  }

  const isVip = profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date();

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.name || user?.email || '?')[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile?.name || 'مستخدم'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {profile?.user_number != null && <Text style={styles.number}>رقم العضوية: #{profile.user_number}</Text>}
        {isVip && <Text style={styles.vipBadge}>VIP نشط</Text>}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Row label="الرصيد" value={`${profile?.balance ?? 0} USDT`} />
      </Card>

      <MenuItem title="حسابي والإعدادات" onPress={() => navigation.navigate('Account')} />
      <MenuItem title="التحقق من الهوية (KYC)" onPress={() => navigation.navigate('Account')} />
      <MenuItem title="سجل المعاملات" onPress={() => navigation.navigate('Transactions')} />
      <MenuItem title="اقترح مهمة / أعلن معنا" onPress={() => navigation.navigate('Advertise')} />
      <MenuItem title="الشروط والأحكام" onPress={() => navigation.navigate('Legal')} />
      <MenuItem title="تواصل معنا" onPress={() => navigation.navigate('Contact')} />

      <Button title="تسجيل الخروج" onPress={confirmSignOut} variant="danger" style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Card style={styles.menuItem}>
      <Text style={styles.menuText} onPress={onPress}>{title}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#04140F', fontSize: 26, fontWeight: '800' },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  email: { color: colors.muted, marginTop: 2 },
  number: { color: colors.muted, marginTop: 4, fontSize: 12 },
  vipBadge: { color: '#04140F', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8, fontWeight: '700', fontSize: 12, overflow: 'hidden' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.primary, fontWeight: '700' },
  menuItem: { marginBottom: 10 },
  menuText: { color: colors.text, textAlign: 'right', fontSize: 15 },
});
