import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/common';
import { GoalsStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';

type Nav = NativeStackNavigationProp<GoalsStackParamList>;

export function AddGoalScreen() {
  const navigation = useNavigation<Nav>();
  const { addGoal } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [saving, setSaving] = useState(false);

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];
  const canSave = title.trim().length > 0 && Number(target) > 0;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addGoal({
        title: title.trim(),
        targetAmount: Number(target),
        currentAmount: 0,
        deadline: '',
        icon: 'star',
        color,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.label}>Название цели</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Например: MacBook Pro" placeholderTextColor={colors.textSecondary} />

        <Text style={styles.label}>Сумма (₽)</Text>
        <TextInput style={[styles.input, { fontSize: 28, fontWeight: '700', textAlign: 'center' }]} value={target} onChangeText={(v) => setTarget(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.border} />

        <Text style={styles.label}>Цвет</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <View key={c} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]}>
              <Text style={styles.colorCheck} onPress={() => setColor(c)}>{color === c ? '✓' : ' '}</Text>
            </View>
          ))}
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
  colorRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  colorDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: colors.text },
  colorCheck: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});
