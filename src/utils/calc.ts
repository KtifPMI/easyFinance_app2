import { Account, Budget, Operation } from '../types';

export interface FinHealthIndicators {
  finState: number;
  money: number;
  budget: number;
  debt: number;
  savings: number;
}

export function calcFinHealth(
  accounts: Account[],
  operations: Operation[],
  budgets: Budget[]
): FinHealthIndicators {
  const now = new Date();
  const { start, end } = getMonthRange(now);
  const monthOps = operations.filter(o => !o.isDeleted && isInPeriod(o.date, start, end));

  const monthIncome = sumByType(monthOps, 'income');
  const monthExpense = sumByType(monthOps, 'expense');
  const totalBalance = getTotalBalance(accounts);

  const avgExpense = monthExpense || 1;
  const liquidityMonths = totalBalance / avgExpense;
  const money = Math.min(100, Math.round(liquidityMonths / 3 * 100));

  let budgetScore = 100;
  const totalPlanned = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  if (totalPlanned > 0) {
    const ratio = totalSpent / totalPlanned;
    budgetScore = Math.max(0, Math.min(100, Math.round((2 - ratio) * 50)));
  }

  const debtScore = 100;

  let savings = 0;
  if (monthIncome > 0) {
    const savingsRate = (monthIncome - monthExpense) / monthIncome;
    savings = Math.max(0, Math.min(100, Math.round(savingsRate / 0.2 * 100)));
  }

  const finState = Math.round((money + budgetScore + debtScore + savings) / 4);

  return { finState, money, budget: budgetScore, debt: debtScore, savings };
}

export function isInPeriod(dateIso: string, start: Date, end: Date): boolean {
  const d = new Date(dateIso);
  return d >= start && d <= end;
}

export function getMonthRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export function sumByType(operations: Operation[], type: 'income' | 'expense'): number {
  return operations.filter((o) => o.type === type && !o.isDeleted).reduce((sum, o) => sum + o.amount, 0);
}

export function getTotalBalance(accounts: { balance: number; includeInTotal: boolean }[]): number {
  return accounts.filter((a) => a.includeInTotal).reduce((sum, a) => sum + a.balance, 0);
}

export function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getBudgetProgress(budget: Budget): { spent: number; percent: number } {
  const limit = budget.limit || 1;
  return { spent: budget.spent, percent: (budget.spent / limit) * 100 };
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const offset = startDay === 0 ? 6 : startDay - 1;
  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}
