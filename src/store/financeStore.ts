import { create } from 'zustand'
import {
  mockAccounts, mockBudgets, mockCategories, mockEvents, mockGoals,
  mockOperations, mockRecommendations, mockTags,
} from '../services/api/mockData'
import { Account, Budget, Category, FinancialEvent, Goal, Operation, Recommendation, Tag } from '../types'

let localAccounts: Account[] = [...mockAccounts]
let localOperations: Operation[] = [...mockOperations]
let localCategories: Category[] = [...mockCategories]
let localBudgets: Budget[] = [...mockBudgets]
let localGoals: Goal[] = [...mockGoals]
let localEvents: FinancialEvent[] = [...mockEvents]

const genId = () => Math.random().toString(36).slice(2, 10)

interface FinanceState {
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  operations: Operation[]
  budgets: Budget[]
  goals: Goal[]
  events: FinancialEvent[]
  recommendations: Recommendation[]
  isLoading: boolean
  error: string | null
  loaded: boolean

  loadAll: () => Promise<void>
  refresh: () => Promise<void>
  addOperation: (op: Omit<Operation, 'id'>) => Promise<void>
  updateOperation: (id: string, patch: Partial<Operation>) => Promise<void>
  deleteOperation: (id: string) => Promise<void>
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: mockAccounts,
  categories: mockCategories,
  tags: mockTags,
  operations: mockOperations,
  budgets: mockBudgets,
  goals: mockGoals,
  events: mockEvents,
  recommendations: mockRecommendations,
  isLoading: false,
  error: null,
  loaded: true,

  loadAll: async () => {
    set({ isLoading: false, error: null, loaded: true })
  },

  refresh: async () => {
    set({ isLoading: false, error: null, loaded: true })
  },

  addOperation: async (op) => {
    const newOp: Operation = { ...op, id: genId() }
    localOperations = [newOp, ...localOperations]
    if (op.type === 'expense') {
      localAccounts = localAccounts.map(a => a.id === op.accountId ? { ...a, balance: a.balance - op.amount } : a)
      localBudgets = localBudgets.map(b => b.categoryId === op.categoryId ? { ...b, spent: b.spent + op.amount } : b)
    } else if (op.type === 'income') {
      localAccounts = localAccounts.map(a => a.id === op.accountId ? { ...a, balance: a.balance + op.amount } : a)
    } else if (op.type === 'transfer') {
      localAccounts = localAccounts.map(a => {
        if (a.id === op.accountId) return { ...a, balance: a.balance - op.amount }
        if (a.id === op.toAccountId) return { ...a, balance: a.balance + op.amount }
        return a
      })
    }
    set({
      operations: localOperations.filter(o => !o.isDeleted),
      accounts: [...localAccounts],
      budgets: [...localBudgets],
    })
  },

  updateOperation: async (id, patch) => {
    localOperations = localOperations.map(o => o.id === id ? { ...o, ...patch } : o)
    set({ operations: localOperations.filter(o => !o.isDeleted) })
  },

  deleteOperation: async (id) => {
    const op = localOperations.find(o => o.id === id)
    if (op && !op.isDeleted) {
      if (op.type === 'expense') {
        localAccounts = localAccounts.map(a => a.id === op.accountId ? { ...a, balance: a.balance + op.amount } : a)
      } else if (op.type === 'income') {
        localAccounts = localAccounts.map(a => a.id === op.accountId ? { ...a, balance: a.balance - op.amount } : a)
      } else if (op.type === 'transfer') {
        localAccounts = localAccounts.map(a => {
          if (a.id === op.accountId) return { ...a, balance: a.balance + op.amount }
          if (a.id === op.toAccountId) return { ...a, balance: a.balance - op.amount }
          return a
        })
      }
    }
    localOperations = localOperations.map(o => o.id === id ? { ...o, isDeleted: true } : o)
    set({ operations: localOperations.filter(o => !o.isDeleted), accounts: [...localAccounts] })
  },

  addBudget: async (b) => {
    const newBudget: Budget = { ...b, id: genId(), spent: 0 }
    localBudgets = [...localBudgets, newBudget]
    set({ budgets: [...localBudgets] })
  },

  deleteBudget: async (id) => {
    localBudgets = localBudgets.map(b => b.id === id ? { ...b, isDeleted: true } : b)
    set({ budgets: localBudgets.filter(b => !b.isDeleted) })
  },

  addGoal: async (goal) => {
    const g: Goal = { ...goal, id: genId() }
    localGoals = [...localGoals, g]
    set({ goals: [...localGoals] })
  },

  updateGoal: async (id, patch) => {
    localGoals = localGoals.map(g => g.id === id ? { ...g, ...patch } : g)
    set({ goals: [...localGoals] })
  },

  deleteGoal: async (id) => {
    localGoals = localGoals.filter(g => g.id !== id)
    set({ goals: [...localGoals] })
  },
}))
