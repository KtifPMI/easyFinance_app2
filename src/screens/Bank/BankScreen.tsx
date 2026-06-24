import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, Screen } from '../../components/common';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';

export function BankScreen() {
  const { accounts, isLoading, loaded, loadAll } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  if (isLoading && !loaded) return <LoadingState />;

  return (
    <Screen>
      <FlatList
        data={accounts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} colors={[colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="bank-outline" title="Нет счетов" subtitle="Добавьте счёт в настройках" />}
        ListHeaderComponent={() => {
          const total = accounts.reduce((s, a) => s + a.balance, 0);
          return (
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>Общий баланс</Text>
              <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
            </Card>
          );
        }}
        renderItem={({ item }) => (
          <Pressable style={styles.row}>
            <View style={[styles.icon, { backgroundColor: (item.color || colors.primary) + '22' }]}>
              <MaterialCommunityIcons name="bank" size={24} color={item.color || colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.type === 'card' ? 'Карта' : item.type === 'cash' ? 'Наличные' : 'Счёт'}</Text>
            </View>
            <Text style={styles.balance}>{formatMoney(item.balance)}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  totalLabel: { ...typography.caption, color: colors.textSecondary },
  totalAmount: { ...typography.h1, marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.bodyBold, color: colors.text },
  type: { ...typography.small, color: colors.textSecondary },
  balance: { ...typography.bodyBold, color: colors.text },
});
