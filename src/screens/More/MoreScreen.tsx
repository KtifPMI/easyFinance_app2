import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common';
import { MoreStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

const SECTIONS: { icon: string; label: string; screen: keyof MoreStackParamList; color?: string }[][] = [
  [
    { icon: 'chart-pie', label: 'Отчёты', screen: 'Reports' },
    { icon: 'wallet-outline', label: 'Бюджеты', screen: 'Budget' },
    { icon: 'calendar-month', label: 'Календарь', screen: 'Calendar' },
    { icon: 'trophy-outline', label: 'Цели', screen: 'Goals' },
  ],
  [
    { icon: 'bank-outline', label: 'Связанные счета', screen: 'Bank' },
    { icon: 'lightbulb-outline', label: 'Идеи / Информер', screen: 'Informer' },
    { icon: 'star-outline', label: 'Рекомендации', screen: 'Recommendations' },
    { icon: 'robot-outline', label: 'AI-ассистент', screen: 'AiAssistant' },
  ],
  [
    { icon: 'cog-outline', label: 'Настройки', screen: 'Settings' },
    { icon: 'account-outline', label: 'Профиль', screen: 'Profile' },
  ],
];

export function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    Alert.alert('Выйти?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {SECTIONS.map((group, gi) => (
          <View key={gi} style={styles.section}>
            {group.map((item) => (
              <Pressable key={item.screen} style={styles.row} onPress={() => navigation.navigate(item.screen as any)}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color || colors.primary} />
                <Text style={styles.label}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable style={[styles.row, { marginTop: spacing.lg }]} onPress={onLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
          <Text style={[styles.label, { color: colors.danger }]}>Выйти</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.card, borderRadius: radius.md, marginBottom: spacing.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, ...typography.body, color: colors.text },
});
