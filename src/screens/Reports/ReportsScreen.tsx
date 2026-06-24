import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, EmptyState, Screen } from '../../components/common';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';
import { OperationType } from '../../types';

const { width } = Dimensions.get('window');

const PERIODS = [
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' },
];

const TYPES: { key: OperationType; label: string }[] = [
  { key: 'expense', label: 'Расходы' },
  { key: 'income', label: 'Доходы' },
];

export function ReportsScreen() {
  const { operations, categories, loaded, loadAll } = useFinanceStore();
  const [period, setPeriod] = useState('month');
  const [type, setType] = useState<OperationType>('expense');

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  const filtered = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (period === 'week') { start = new Date(now); start.setDate(start.getDate() - 7); }
    else if (period === 'year') { start = new Date(now.getFullYear(), 0, 1); }
    else { start = new Date(now.getFullYear(), now.getMonth(), 1); }
    return operations.filter(o => o.type === type && new Date(o.date) >= start);
  }, [operations, period, type]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => {
      if (o.categoryId) map[o.categoryId] = (map[o.categoryId] || 0) + o.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => ({ catId, amount, category: categories.find(c => c.id === catId) }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, categories]);

  const total = filtered.reduce((s, o) => s + o.amount, 0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <Chip key={p.key} label={p.label} active={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>

        <View style={styles.typeRow}>
          {TYPES.map(t => (
            <Pressable
              key={t.key}
              style={[styles.typeBtn, type === t.key && { backgroundColor: (t.key === 'expense' ? colors.expense : colors.income) + '22', borderColor: t.key === 'expense' ? colors.expense : colors.income }]}
              onPress={() => setType(t.key)}
            >
              <Text style={[styles.typeLabel, type === t.key && { fontWeight: '700' }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>Всего</Text>
          <Text style={[styles.totalAmount, { color: type === 'expense' ? colors.expense : colors.income }]}>
            {type === 'expense' ? '-' : '+'}{formatMoney(total)}
          </Text>
        </Card>

        <Text style={styles.section}>
          По категориям {byCategory.length > 0 && `(${byCategory.length})`}
        </Text>

        {byCategory.length === 0 ? (
          <EmptyState icon="chart-bar" title="Нет данных" subtitle="Добавьте операции" />
        ) : (
          byCategory.map(({ catId, amount, category }) => {
            const pct = total > 0 ? (amount / total) * 100 : 0;
            return (
              <Pressable key={catId} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: category?.color || colors.textSecondary }]} />
                <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                  <Text style={styles.catName}>{category?.name || 'Без категории'}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: category?.color || colors.textSecondary }]} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.catAmount}>{formatMoney(amount)}</Text>
                  <Text style={styles.catPct}>{Math.round(pct)}%</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  typeLabel: { ...typography.bodyBold, color: colors.text },
  totalCard: { alignItems: 'center', paddingVertical: spacing.lg },
  totalLabel: { ...typography.caption, color: colors.textSecondary },
  totalAmount: { ...typography.h1, marginTop: spacing.xs },
  section: { ...typography.bodyBold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { ...typography.body, color: colors.text },
  barBg: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 3 },
  barFill: { height: 6, borderRadius: 3 },
  catAmount: { ...typography.bodyBold, color: colors.text },
  catPct: { ...typography.small, color: colors.textSecondary },
});
