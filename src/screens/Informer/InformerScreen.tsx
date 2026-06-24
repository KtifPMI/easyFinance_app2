import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, Screen } from '../../components/common';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';

export function InformerScreen() {
  const { operations, accounts, categories, isLoading, loaded, loadAll } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  if (isLoading && !loaded) return <LoadingState />;

  const tips: { icon: string; title: string; desc: string; color: string }[] = [];

  const totalExpenses = operations.filter(o => o.type === 'expense').reduce((s, o) => s + o.amount, 0);
  const totalIncome = operations.filter(o => o.type === 'income').reduce((s, o) => s + o.amount, 0);
  const balance = accounts.reduce((s, a) => s + a.balance, 0);

  if (totalExpenses > 0) {
    tips.push({ icon: 'fire', title: 'Траты за всё время', desc: `Всего потрачено ${formatMoney(totalExpenses)}`, color: colors.expense });
  }
  if (totalIncome > 0) {
    tips.push({ icon: 'trending-up', title: 'Доходы', desc: `Всего получено ${formatMoney(totalIncome)}`, color: colors.income });
  }
  if (balance > 0) {
    tips.push({ icon: 'shield-check', title: 'Финансовая подушка', desc: `Текущий баланс ${formatMoney(balance)}`, color: colors.primary });
  }
  tips.push({ icon: 'lightbulb-outline', title: 'Совет', desc: 'Старайтесь откладывать минимум 10% от каждого дохода', color: colors.warning });
  tips.push({ icon: 'bookmark-outline', title: 'Правило 50/30/20', desc: '50% на нужды, 30% на желания, 20% на сбережения', color: colors.primary });

  return (
    <Screen>
      <FlatList
        data={tips}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <Text style={styles.header}>Полезные идеи и заметки</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + '22' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { marginBottom: spacing.sm },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  desc: { ...typography.caption, color: colors.textSecondary },
});
