import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ProgressBar, Screen } from '../../components/common';
import { GoalsStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, spacing, typography } from '../../theme';
import { formatDateLong, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<GoalsStackParamList, 'GoalDetail'>;
type Nav = NativeStackNavigationProp<GoalsStackParamList>;

export function GoalDetailScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { goals, deleteGoal } = useFinanceStore();
  const goal = goals.find(g => g.id === route.params.goalId);
  if (!goal) return <Screen><Text style={styles.error}>Цель не найдена</Text></Screen>;

  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  const onDelete = () => {
    Alert.alert('Удалить цель?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        await deleteGoal(goal.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <Screen>
      <Card style={styles.topCard}>
        <Text style={styles.name}>{goal.title}</Text>
        <Text style={styles.percent}>{Math.round(pct)}%</Text>
        <ProgressBar percent={Math.min(pct, 100)} color={goal.color || colors.primary} />
        <View style={styles.amountRow}>
          <Text style={styles.current}>{formatMoney(goal.currentAmount)}</Text>
          <Text style={styles.sep}>/</Text>
          <Text style={styles.target}>{formatMoney(goal.targetAmount)}</Text>
        </View>
        {goal.deadline && <Text style={styles.deadline}>До {formatDateLong(goal.deadline)}</Text>}
      </Card>

      <Button title="Удалить цель" onPress={onDelete} variant="outline" style={{ marginTop: spacing.lg, borderColor: colors.danger }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  topCard: { alignItems: 'center', paddingVertical: spacing.xl },
  name: { ...typography.h2, color: colors.text },
  percent: { ...typography.h1, color: colors.primary, marginVertical: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
  current: { ...typography.h3, color: colors.text },
  sep: { ...typography.h3, color: colors.textSecondary, marginHorizontal: spacing.sm },
  target: { ...typography.body, color: colors.textSecondary },
  deadline: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
});
