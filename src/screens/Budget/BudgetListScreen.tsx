import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, ProgressBar } from '../../components/common';
import { BudgetStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';
import { getBudgetProgress } from '../../utils/calc';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<BudgetStackParamList>;

export function BudgetListScreen() {
  const navigation = useNavigation<Nav>();
  const { budgets, categories, isLoading, loaded, loadAll } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  const items = useMemo(
    () => budgets.map(b => ({ ...b, ...getBudgetProgress(b) })),
    [budgets]
  );

  if (isLoading && !loaded) return <LoadingState />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} colors={[colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="wallet-outline" title="Нет бюджетов" subtitle="Добавьте бюджет на категорию" />}
        ListHeaderComponent={
          <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddBudget')}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
            <Text style={styles.addLabel}>Новый бюджет</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('BudgetDetail', { budgetId: item.id })}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name || categories.find(c => c.id === item.categoryId)?.name}</Text>
                <Text style={[styles.status, { color: item.percent > 100 ? colors.danger : item.percent > 75 ? colors.warning : colors.success }]}>
                  {formatMoney(item.spent)} / {formatMoney(item.limit)}
                </Text>
              </View>
              <ProgressBar percent={Math.min(item.percent, 100)} color={item.percent > 100 ? colors.danger : item.percent > 75 ? colors.warning : colors.success} />
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: spacing.md },
  addLabel: { ...typography.bodyBold, color: colors.primary, marginLeft: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  name: { ...typography.bodyBold, color: colors.text },
  status: { ...typography.caption },
});
