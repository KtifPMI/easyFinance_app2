import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, ProgressBar } from '../../components/common';
import { GoalsStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';

type Nav = NativeStackNavigationProp<GoalsStackParamList>;

export function GoalsListScreen() {
  const navigation = useNavigation<Nav>();
  const { goals, isLoading, loaded, loadAll } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  if (isLoading && !loaded) return <LoadingState />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} colors={[colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="trophy-outline" title="Нет целей" subtitle="Поставьте финансовую цель" />}
        ListHeaderComponent={
          <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddGoal')}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
            <Text style={styles.addLabel}>Новая цель</Text>
          </Pressable>
        }
        renderItem={({ item }) => {
          const pct = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
          return (
            <Pressable onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}>
              <Card>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.status}>{Math.round(pct)}%</Text>
                </View>
                <ProgressBar percent={Math.min(pct, 100)} color={item.color || colors.primary} />
                <Text style={styles.amount}>
                  {formatMoney(item.currentAmount)} / {formatMoney(item.targetAmount)}
                </Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: spacing.md },
  addLabel: { ...typography.bodyBold, color: colors.primary, marginLeft: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  name: { ...typography.bodyBold, color: colors.text },
  status: { ...typography.h3, color: colors.textSecondary },
  amount: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
