import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ProgressBar, Screen } from '../../components/common';
import { OperationListItem } from '../../components/operations/OperationListItem';
import { BudgetStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';
import { getBudgetProgress } from '../../utils/calc';

type Props = NativeStackScreenProps<BudgetStackParamList, 'BudgetDetail'>;
type Nav = NativeStackNavigationProp<BudgetStackParamList>;

export function BudgetDetailScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { budgets, operations, accounts, categories, deleteBudget } = useFinanceStore();
  const budget = budgets.find(b => b.id === route.params.budgetId);
  if (!budget) return <Screen><Text style={styles.error}>Бюджет не найден</Text></Screen>;

  const category = categories.find(c => c.id === budget.categoryId);
  const progress = getBudgetProgress(budget);

  const relatedOps = operations.filter(o => o.categoryId === budget.categoryId && o.type === 'expense').slice(0, 20);

  const getCategory = (catId?: string) => categories.find(c => c.id === catId);
  const getAccount = (accId?: string) => accounts.find(a => a.id === accId);

  const onDelete = () => {
    Alert.alert('Удалить бюджет?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        await deleteBudget(budget.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.name}>{budget.name || category?.name}</Text>
        <Text style={styles.period}>{budget.period === 'monthly' ? 'Ежемесячно' : 'Еженедельно'}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.spent}>{formatMoney(progress.spent)}</Text>
          <Text style={styles.limit}>/ {formatMoney(budget.limit)}</Text>
        </View>
        <ProgressBar percent={Math.min(progress.percent, 100)} color={progress.percent > 100 ? colors.danger : progress.percent > 75 ? colors.warning : colors.success} />
        <Text style={styles.percent}>{Math.round(progress.percent)}%</Text>
      </Card>

      <Text style={styles.section}>Операции по категории</Text>
      <FlatList
        data={relatedOps}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<EmptyState title="Нет операций" />}
        renderItem={({ item }) => (
          <OperationListItem
            operation={item}
            category={getCategory(item.categoryId)}
            account={getAccount(item.accountId)}
            toAccount={getAccount(item.toAccountId)}
          />
        )}
      />

      <Button title="Удалить бюджет" onPress={onDelete} variant="outline" style={{ marginTop: spacing.lg, borderColor: colors.danger }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  name: { ...typography.h2, color: colors.text },
  period: { ...typography.caption, color: colors.textSecondary },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md },
  spent: { ...typography.h1, color: colors.text },
  limit: { ...typography.h3, color: colors.textSecondary },
  percent: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  section: { ...typography.bodyBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
});
