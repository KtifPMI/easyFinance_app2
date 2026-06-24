export type OperationType = 'expense' | 'income' | 'transfer';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  plan: 'free' | 'premium';
  avatarUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  type?: 'card' | 'cash' | 'account';
  includeInTotal: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: OperationType;
  icon: string;
  color: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;
  currency: string;
  date: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  tagIds?: string[];
  comment?: string;
  isDeleted?: boolean;
}

export interface Budget {
  id: string;
  name?: string;
  categoryId: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
  isDeleted?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  monthlyRecommendation?: number;
}

export interface FinancialEvent {
  id: string;
  title: string;
  date: string;
  amount?: number;
  type: OperationType | 'reminder';
  isRecurring: boolean;
  recurrenceRule?: string;
}

export interface BankConnection {
  id: string;
  bankName: string;
  logo?: string;
  status: 'connected' | 'error' | 'syncing';
  lastSyncAt?: string;
  errorMessage?: string;
  accountsCount: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'risk' | 'optimization';
  severity: 'low' | 'medium' | 'high';
  amount?: number;
}

export interface ReportPoint {
  label: string;
  value: number;
  color?: string;
}

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
