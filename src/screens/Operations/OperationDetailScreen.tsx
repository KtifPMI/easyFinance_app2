import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen } from '../../components/common';
import { OperationsStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateLong, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<OperationsStackParamList, 'OperationDetail'>;
type Nav = NativeStackNavigationProp<OperationsStackParamList>;

export function OperationDetailScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { operations, accounts, categories, deleteOperation } = useFinanceStore();
  const operation = operations.find(o => o.id === route.params.operationId);
  if (!operation) return <Screen><Text style={styles.error}>Операция не найдена</Text></Screen>;

  const category = categories.find(c => c.id === operation.categoryId);
  const account = accounts.find(a => a.id === operation.accountId);
  const toAccount = accounts.find(a => a.id === operation.toAccountId);

  const onDelete = () => {
    Alert.alert('Удалить операцию?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        await deleteOperation(operation.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <Screen>
      <Card style={styles.amountCard}>
        <Text style={[styles.amount, { color: operation.type === 'income' ? colors.income : colors.text }]}>
          {operation.type === 'income' ? '+' : operation.type === 'expense' ? '-' : ''}
          {formatMoney(operation.amount, operation.currency)}
        </Text>
        <Text style={styles.type}>{operation.type === 'income' ? 'Доход' : operation.type === 'expense' ? 'Расход' : 'Перевод'}</Text>
      </Card>

      <Card style={styles.details}>
        <DetailRow label="Категория" value={category?.name || 'Без категории'} />
        <DetailRow label="Счёт" value={account?.name || '-'} />
        {operation.toAccountId ? <DetailRow label="На счёт" value={toAccount?.name || '-'} /> : null}
        <DetailRow label="Дата" value={formatDateLong(operation.date)} />
        {operation.comment ? <DetailRow label="Комментарий" value={operation.comment} /> : null}
      </Card>

      <Button title="Удалить" onPress={onDelete} variant="outline" style={{ marginTop: spacing.lg, borderColor: colors.danger }} />
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  amountCard: { alignItems: 'center', paddingVertical: spacing.xl },
  amount: { ...typography.h1 },
  type: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  details: { marginTop: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyBold, color: colors.text },
});
