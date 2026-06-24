import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, EmptyState, Screen } from '../../components/common';
import { OperationListItem } from '../../components/operations/OperationListItem';
import { RootStackParamList } from '../../navigation/types';
import { useFinanceStore } from '../../store/financeStore';
import { colors, radius, spacing, typography } from '../../theme';
import { OperationType } from '../../types';
import { formatDateLong, formatMoney, formatSignedMoney } from '../../utils/format';
import { getCalendarDays, getDayKey, getTotalBalance } from '../../utils/calc';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

export function CalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { operations, accounts, categories, isLoading, loaded, loadAll } = useFinanceStore();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(getDayKey(today));

  useEffect(() => {
    if (!loaded) loadAll();
  }, [loaded]);

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const dayTotals = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    operations.forEach(op => {
      const key = getDayKey(new Date(op.date));
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (op.type === 'income') map[key].income += op.amount;
      else if (op.type === 'expense') map[key].expense += op.amount;
    });
    return map;
  }, [operations]);

  const selectedOps = useMemo(
    () => operations.filter(o => getDayKey(new Date(o.date)) === selectedDate),
    [operations, selectedDate]
  );

  const isToday = (d: Date) => getDayKey(d) === getDayKey(today);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const getCategory = (catId?: string) => categories.find(c => c.id === catId);
  const getAccount = (accId?: string) => accounts.find(a => a.id === accId);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={prevMonth}><MaterialCommunityIcons name="chevron-left" size={28} color={colors.primary} /></Pressable>
        <Text style={styles.monthTitle}>{MONTHS_RU[month]} {year}</Text>
        <Pressable onPress={nextMonth}><MaterialCommunityIcons name="chevron-right" size={28} color={colors.primary} /></Pressable>
      </View>

      <View style={styles.weekRow}>
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d, i) => {
          const key = d ? getDayKey(d) : '';
          const totals = key ? dayTotals[key] : undefined;
          const sel = key === selectedDate;
          return (
            <Pressable
              key={i}
              style={[styles.dayCell, !d && { opacity: 0 }, sel && styles.daySelected, d && isToday(d) && !sel && styles.dayToday]}
              onPress={() => d && setSelectedDate(getDayKey(d))}
            >
              <Text style={[styles.dayNumber, sel && { color: '#FFF' }, d && isToday(d) && { color: colors.primary, fontWeight: '700' }]}>{d?.getDate()}</Text>
              {totals ? (
                <View style={styles.totals}>
                  {totals.income > 0 && <Text style={styles.incomeDot}>●</Text>}
                  {totals.expense > 0 && <Text style={styles.expenseDot}>●</Text>}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectedInfo}>
        <Text style={styles.selectedDate}>{selectedDate}</Text>
        {dayTotals[selectedDate] && (
          <Text style={styles.selectedTotal}>
            +{formatMoney(dayTotals[selectedDate]?.income || 0)} / -{formatMoney(dayTotals[selectedDate]?.expense || 0)}
          </Text>
        )}
      </View>

      <FlatList
        data={selectedOps}
        keyExtractor={o => o.id}
        ListEmptyComponent={<EmptyState icon="calendar-blank" title="Нет операций в этот день" />}
        renderItem={({ item }) => (
          <OperationListItem
            operation={item}
            category={getCategory(item.categoryId)}
            account={getAccount(item.accountId)}
            toAccount={getAccount(item.toAccountId)}
            onPress={() => navigation.navigate('OperationDetail', { operationId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  monthTitle: { ...typography.h3, color: colors.text },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.sm },
  weekDay: { ...typography.caption, color: colors.textSecondary, width: '14.28%', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm },
  daySelected: { backgroundColor: colors.primary, borderRadius: radius.round },
  dayToday: { backgroundColor: colors.primary + '22' },
  dayNumber: { ...typography.body, color: colors.text },
  totals: { flexDirection: 'row', gap: 2 },
  incomeDot: { color: colors.income, fontSize: 6 },
  expenseDot: { color: colors.expense, fontSize: 6 },
  selectedInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.md },
  selectedDate: { ...typography.bodyBold, color: colors.text },
  selectedTotal: { ...typography.caption, color: colors.textSecondary },
});
