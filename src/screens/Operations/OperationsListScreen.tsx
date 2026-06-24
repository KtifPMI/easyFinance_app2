import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../components/common/Chip';
import { EmptyState, LoadingState } from '../../components/common';
import { OperationListItem } from '../../components/operations/OperationListItem';
import { OperationsStackParamList, RootStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { OperationType } from '../../types';
import { formatMoney, formatSignedMoney, groupByDay, formatDayLabel } from '../../utils/format';
import { getTotalBalance } from '../../utils/calc';

type Nav = NativeStackNavigationProp<OperationsStackParamList & RootStackParamList>;

const TYPE_LABELS: Record<OperationType | 'all', string> = {
  all: 'Все', expense: 'Расходы', income: 'Доходы', transfer: 'Переводы',
};

export function OperationsListScreen() {
  const navigation = useNavigation<Nav>();
  const { operations, accounts, categories, isLoading, loaded, loadAll } = useFinanceStore();
  const [typeFilter, setTypeFilter] = useState<OperationType | 'all'>('all');

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  const filtered = useMemo(
    () => (typeFilter === 'all' ? operations : operations.filter(o => o.type === typeFilter)),
    [operations, typeFilter]
  );

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  const getCategory = (catId?: string) => categories.find(c => c.id === catId);
  const getAccount = (accId?: string) => accounts.find(a => a.id === accId);

  const totalBalance = getTotalBalance(accounts);
  const monthIncome = operations.filter(o => o.type === 'income').reduce((s, o) => s + o.amount, 0);
  const monthExpense = operations.filter(o => o.type === 'expense').reduce((s, o) => s + o.amount, 0);

  if (isLoading && !loaded) return <LoadingState />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Баланс: {formatMoney(totalBalance)}</Text>
          <Text style={styles.headerSub}>
            {formatSignedMoney(monthIncome)} / {formatSignedMoney(-monthExpense)}
          </Text>
        </View>
        <Pressable style={styles.trashBtn} onPress={() => navigation.navigate('Trash')}>
          <MaterialCommunityIcons name="delete-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        {(Object.keys(TYPE_LABELS) as (OperationType | 'all')[]).map(key => (
          <Chip key={key} label={TYPE_LABELS[key]} active={typeFilter === key} onPress={() => setTypeFilter(key)} />
        ))}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} colors={[colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="inbox-outline" title="Нет операций" subtitle="Добавьте первую операцию" />}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.dayLabel}>{formatDayLabel(item.date)}</Text>
            {item.items.map(op => (
              <OperationListItem
                key={op.id}
                operation={op}
                category={getCategory(op.categoryId)}
                account={getAccount(op.accountId)}
                toAccount={getAccount(op.toAccountId)}
                onPress={() => navigation.navigate('OperationDetail', { operationId: op.id })}
              />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { ...typography.h3, color: colors.text },
  headerSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  trashBtn: { padding: spacing.sm },
  filters: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  dayLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs },
});
