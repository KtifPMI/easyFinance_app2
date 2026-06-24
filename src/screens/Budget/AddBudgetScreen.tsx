import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip } from '../../components/common';
import { BudgetStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<BudgetStackParamList>;

export function AddBudgetScreen() {
  const navigation = useNavigation<Nav>();
  const { categories, addBudget } = useFinanceStore();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [saving, setSaving] = useState(false);

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense' && !c.parentId), [categories]);

  const canSave = Number(limit) > 0 && categoryId;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addBudget({ name: name || undefined, limit: Number(limit), period, categoryId: categoryId! });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.label}>Название (необязательно)</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Например: Продукты" placeholderTextColor={colors.textSecondary} />

        <Text style={styles.label}>Лимит (₽)</Text>
        <TextInput style={[styles.input, { fontSize: 28, fontWeight: '700', textAlign: 'center' }]} value={limit} onChangeText={(v) => setLimit(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.border} />

        <Text style={styles.label}>Категория</Text>
        <View style={styles.catGrid}>
          {expenseCategories.map(cat => (
            <Pressable key={cat.id} style={[styles.catItem, categoryId === cat.id && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]} onPress={() => setCategoryId(cat.id)}>
              <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
              <Text style={styles.catLabel}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Период</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Chip label="Ежемесячно" active={period === 'monthly'} onPress={() => setPeriod('monthly')} />
          <Chip label="Еженедельно" active={period === 'weekly'} onPress={() => setPeriod('weekly')} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Сохранить" onPress={onSave} disabled={!canSave} loading={saving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm },
  input: { height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, backgroundColor: colors.card, ...typography.body, color: colors.text },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  catItem: { width: '25%', alignItems: 'center', marginBottom: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
  catLabel: { ...typography.small, color: colors.text, marginTop: spacing.xs },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});
