import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Screen } from '../../components/common';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { formatMoney } from '../../utils/format';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function AiAssistantScreen() {
  const { accounts, operations, budgets } = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: 'Привет! Я AI-ассистент. Спроси меня о своих финансах, например: "Сколько я потратил?" или "Какой мой баланс?"', isUser: false },
  ]);
  const [input, setInput] = useState('');

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const totalIncome = operations.filter(o => o.type === 'income').reduce((s, o) => s + o.amount, 0);
    const totalExpense = operations.filter(o => o.type === 'expense').reduce((s, o) => s + o.amount, 0);
    const budgetCount = budgets.length;
    const overBudget = budgets.filter(b => {
      const spent = operations.filter(o => o.categoryId === b.categoryId && o.type === 'expense').reduce((s, o) => s + o.amount, 0);
      return spent > b.limit;
    }).length;
    return { totalBalance, totalIncome, totalExpense, budgetCount, overBudget };
  }, [accounts, operations, budgets]);

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('баланс') || q.includes('сколько денег') || q.includes('всего')) {
      return `Общий баланс по всем счетам: ${formatMoney(stats.totalBalance)}`;
    }
    if (q.includes('потрат') || q.includes('расход') || q.includes('трат')) {
      return `Всего потрачено: ${formatMoney(stats.totalExpense)}`;
    }
    if (q.includes('доход') || q.includes('заработ') || q.includes('получил')) {
      return `Всего получено: ${formatMoney(stats.totalIncome)}`;
    }
    if (q.includes('бюджет') || q.includes('лимит')) {
      if (stats.budgetCount === 0) return 'У вас пока нет бюджетов. Создайте первый!';
      return `У вас ${stats.budgetCount} бюджет${stats.budgetCount > 1 ? 'ов' : ''}. ${stats.overBudget > 0 ? `${stats.overBudget} превышен${stats.overBudget > 1 ? 'ы' : ''}.` : 'Все в пределах лимитов.'}`;
    }
    if (q.includes('анализ') || q.includes('итог') || q.includes('отчёт')) {
      return `Общий доход: ${formatMoney(stats.totalIncome)}, расходы: ${formatMoney(stats.totalExpense)}, баланс: ${formatMoney(stats.totalBalance)}`;
    }
    return 'Я понимаю вопросы про баланс, расходы, доходы, бюджеты и общий анализ. Попробуйте спросить иначе!';
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text, isUser: true }]);
    setInput('');
    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: response, isUser: false }]);
    }, 500);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.botBubble]}>
              <Text style={[styles.bubbleText, item.isUser && { color: '#FFF' }]}>{item.text}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Спросите о финансах..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={sendMessage}
          />
          <MaterialCommunityIcons name="send" size={24} color={colors.primary} onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  botBubble: { backgroundColor: colors.card, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  bubbleText: { ...typography.body, color: colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md, backgroundColor: colors.card },
  input: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, ...typography.body, color: colors.text, backgroundColor: colors.background },
});
