import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingState, Screen } from '../../components/common';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';

export function RecommendationsScreen() {
  const { recommendations, loadAll, isLoading, loaded } = useFinanceStore();

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  if (isLoading && !loaded) return <LoadingState />;

  return (
    <Screen>
      <FlatList
        data={recommendations}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="star-outline" title="Нет рекомендаций" subtitle="Появятся после анализа трат" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: (item.type === 'tip' ? colors.primary : item.type === 'alert' ? colors.warning : colors.danger) + '22' }]}>
                <MaterialCommunityIcons
                  name={item.type === 'tip' ? 'lightbulb-outline' : item.type === 'risk' ? 'alert-outline' : 'close-circle-outline'}
                  size={24}
                  color={item.type === 'tip' ? colors.primary : item.type === 'risk' ? colors.warning : colors.danger}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                {item.amount != null && (
                  <Text style={[styles.amount, { color: item.amount > 0 ? colors.income : colors.expense }]}>
                    {item.amount! > 0 ? '+' : ''}{formatMoney(item.amount!)}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.bodyBold, color: colors.text, marginBottom: 2 },
  desc: { ...typography.caption, color: colors.textSecondary },
  amount: { ...typography.bodyBold, marginTop: spacing.xs },
});
