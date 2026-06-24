import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, ProgressBar } from '../../components/common';
import { BudgetStackParamList, GoalsStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';
import { getBudgetProgress } from '../../utils/calc';

type Nav = NativeStackNavigationProp<BudgetStackParamList & GoalsStackParamList>;

export function PlanScreen() {
  const navigation = useNavigation<Nav>();
  const { budgets, goals, categories, isLoading, loaded, loadAll } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  const budgetItems = useMemo(
    () => budgets.map(b => ({ ...b, ...getBudgetProgress(b) })),
    [budgets]
  );

  if (isLoading && !loaded) return <LoadingState />;

  const sections: { title: string; data: any[]; type: 'budget' | 'goal' }[] = [];
  if (budgetItems.length > 0) sections.push({ title: 'Бюджеты', data: budgetItems, type: 'budget' });
  if (goals.length > 0) sections.push({ title: 'Цели', data: goals, type: 'goal' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={sections}
        keyExtractor={s => s.title}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} colors={[colors.primary]} />}
        ListEmptyComponent={
          <EmptyState icon="target" title="Нет бюджетов и целей" subtitle="Добавьте бюджет на категорию или поставьте цель">
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('AddBudget' as any)}>
                <Text style={styles.emptyBtnText}>Бюджет</Text>
              </Pressable>
              <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('AddGoal')}>
                <Text style={styles.emptyBtnText}>Цель</Text>
              </Pressable>
            </View>
          </EmptyState>
        }
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddBudget' as any)}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
              <Text style={styles.addLabel}>Бюджет</Text>
            </Pressable>
            <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddGoal')}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
              <Text style={styles.addLabel}>Цель</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: section }) => (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((item: any) => {
              if (section.type === 'budget') {
                const pct = item.percent;
                const cat = categories.find(c => c.id === item.categoryId);
                return (
                  <Pressable key={item.id} onPress={() => navigation.navigate('BudgetDetail' as any, { budgetId: item.id })}>
                    <Card>
                      <View style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name || cat?.name}</Text>
                          <Text style={[styles.itemAmount, { color: pct > 100 ? colors.danger : pct > 75 ? colors.warning : colors.success }]}>
                          {formatMoney(item.spent || 0)} / {formatMoney(item.limit)}
                        </Text>
                      </View>
                      <ProgressBar percent={Math.min(pct, 100)} color={pct > 100 ? colors.danger : pct > 75 ? colors.warning : colors.success} />
                    </Card>
                  </Pressable>
                );
              }
              const goalPct = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
              return (
                <Pressable key={item.id} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}>
                  <Card>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemAmount}>{Math.round(goalPct)}%</Text>
                    </View>
                    <ProgressBar percent={Math.min(goalPct, 100)} color={item.color || colors.primary} />
                    <Text style={styles.goalAmount}>{formatMoney(item.currentAmount)} / {formatMoney(item.targetAmount)}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.xs },
  addLabel: { ...typography.bodyBold, color: colors.primary },
  sectionTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { ...typography.bodyBold, color: colors.text },
  itemAmount: { ...typography.caption },
  goalAmount: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  emptyBtn: { backgroundColor: colors.primary + '22', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  emptyBtnText: { ...typography.bodyBold, color: colors.primary },
});
