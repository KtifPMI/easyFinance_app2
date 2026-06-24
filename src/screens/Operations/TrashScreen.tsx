import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/common';
import { OperationListItem } from '../../components/operations/OperationListItem';
import { useFinanceStore } from '../../store/financeStore';
import { colors, spacing, typography } from '../../theme';

export function TrashScreen() {
  const navigation = useNavigation();
  const { operations, accounts, categories } = useFinanceStore();

  const deleted = useMemo(() => operations.filter(o => o.isDeleted), [operations]);

  const getCategory = (catId?: string) => categories.find(c => c.id === catId);
  const getAccount = (accId?: string) => accounts.find(a => a.id === accId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={deleted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<EmptyState icon="delete-outline" title="Корзина пуста" />}
        renderItem={({ item }) => (
          <OperationListItem
            operation={item}
            category={getCategory(item.categoryId)}
            account={getAccount(item.accountId)}
            toAccount={getAccount(item.toAccountId)}
            onPress={() => {}}
          />
        )}
      />
    </View>
  );
}
