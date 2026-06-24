import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '../../components/common';
import { colors, radius, spacing, typography } from '../../theme';

const CURRENCIES = ['RUB', 'USD', 'EUR'];
const THEMES = ['system', 'light', 'dark'] as const;

export function SettingsScreen() {
  const [currency, setCurrency] = useState('RUB');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [pinLock, setPinLock] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={styles.section}>Основная валюта</Text>
        <View style={styles.chips}>
          {CURRENCIES.map(c => (
            <Pressable key={c} style={[styles.chip, currency === c && styles.chipActive]} onPress={() => setCurrency(c)}>
              <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Тема</Text>
        <View style={styles.chips}>
          {THEMES.map(t => (
            <Pressable key={t} style={[styles.chip, theme === t && styles.chipActive]} onPress={() => setTheme(t)}>
              <Text style={[styles.chipText, theme === t && styles.chipTextActive]}>
                {t === 'system' ? 'Системная' : t === 'light' ? 'Светлая' : 'Тёмная'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>PIN-код при входе</Text>
          <Switch value={pinLock} onValueChange={setPinLock} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Уведомления</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>

        <Text style={styles.version}>Версия 1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.body, color: colors.text },
  chipTextActive: { color: '#FFF', fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  switchLabel: { ...typography.body, color: colors.text },
  version: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
