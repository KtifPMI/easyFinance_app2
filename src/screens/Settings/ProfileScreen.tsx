import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Screen } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Card style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email || 'Не указан'}</Text>
        </Card>

        <Card style={styles.info}>
          <ProfileRow label="Email" value={user?.email || '-'} />
          <ProfileRow label="Дата регистрации" value="01.03.2025" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCard: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: colors.primary },
  email: { ...typography.h3, color: colors.text },
  info: { marginTop: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyBold, color: colors.text },
});
