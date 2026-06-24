import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { OperationsListScreen } from '../screens/Operations/OperationsListScreen';
import { OperationDetailScreen } from '../screens/Operations/OperationDetailScreen';
import { TrashScreen } from '../screens/Operations/TrashScreen';
import { PlanScreen } from '../screens/Budget/PlanScreen';
import { BudgetDetailScreen } from '../screens/Budget/BudgetDetailScreen';
import { AddBudgetScreen } from '../screens/Budget/AddBudgetScreen';
import { GoalsListScreen } from '../screens/Goals/GoalsListScreen';
import { GoalDetailScreen } from '../screens/Goals/GoalDetailScreen';
import { AddGoalScreen } from '../screens/Goals/AddGoalScreen';
import { CalendarScreen } from '../screens/Calendar/CalendarScreen';
import { ReportsScreen } from '../screens/Reports/ReportsScreen';
import { MoreScreen } from '../screens/More/MoreScreen';
import { BankScreen } from '../screens/Bank/BankScreen';
import { RecommendationsScreen } from '../screens/Recommendations/RecommendationsScreen';
import { InformerScreen } from '../screens/Informer/InformerScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { ProfileScreen } from '../screens/Settings/ProfileScreen';
import { AiAssistantScreen } from '../screens/AiAssistant/AiAssistantScreen';

import {
  BudgetStackParamList, CalendarStackParamList, GoalsStackParamList,
  HomeStackParamList, MainTabParamList,
  MoreStackParamList, OperationsStackParamList, ReportsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OperationsStack = createNativeStackNavigator<OperationsStackParamList>();
const PlanStack = createNativeStackNavigator<BudgetStackParamList & GoalsStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'EasyFinance' }} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Цель' }} />
    </HomeStack.Navigator>
  );
}

function OperationsStackNavigator() {
  return (
    <OperationsStack.Navigator>
      <OperationsStack.Screen name="OperationsList" component={OperationsListScreen} options={{ title: 'Операции' }} />
      <OperationsStack.Screen name="OperationDetail" component={OperationDetailScreen} options={{ title: 'Операция' }} />
      <OperationsStack.Screen name="Trash" component={TrashScreen} options={{ title: 'Корзина' }} />
    </OperationsStack.Navigator>
  );
}

function PlanStackNavigator() {
  return (
    <PlanStack.Navigator>
      <PlanStack.Screen name="BudgetMain" component={PlanScreen} options={{ title: 'Бюджет и цели' }} />
      <PlanStack.Screen name="BudgetDetail" component={BudgetDetailScreen} options={{ title: 'Бюджет' }} />
      <PlanStack.Screen name="AddBudget" component={AddBudgetScreen} options={{ title: 'Новый бюджет', presentation: 'modal' }} />
      <PlanStack.Screen name="GoalsMain" component={GoalsListScreen} options={{ title: 'Цели' }} />
      <PlanStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Цель' }} />
      <PlanStack.Screen name="AddGoal" component={AddGoalScreen} options={{ title: 'Новая цель', presentation: 'modal' }} />
    </PlanStack.Navigator>
  );
}

function CalendarStackNavigator() {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} options={{ title: 'Календарь' }} />
      <CalendarStack.Screen name="OperationDetail" component={OperationDetailScreen} options={{ title: 'Операция' }} />
    </CalendarStack.Navigator>
  );
}

function ReportsStackNavigator() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportsMain" component={ReportsScreen} options={{ title: 'Отчёты' }} />
    </ReportsStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="MoreMain" component={MoreScreen} options={{ title: 'Ещё' }} />
      <MoreStack.Screen name="Bank" component={BankScreen} options={{ title: 'EasyBank' }} />
      <MoreStack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: 'Рекомендации' }} />
      <MoreStack.Screen name="Informer" component={InformerScreen} options={{ title: 'Информер' }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
      <MoreStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
      <MoreStack.Screen name="AiAssistant" component={AiAssistantScreen} options={{ title: 'ИИ-ассистент' }} />
    </MoreStack.Navigator>
  );
}

const icons: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  HomeTab: 'home-variant',
  OperationsTab: 'format-list-bulleted',
  PlanTab: 'target',
  CalendarTab: 'calendar-month',
  ReportsTab: 'chart-pie',
  MoreTab: 'menu',
};

const labels: Record<keyof MainTabParamList, string> = {
  HomeTab: 'Главная',
  OperationsTab: 'Учёт',
  PlanTab: 'План',
  CalendarTab: 'Календарь',
  ReportsTab: 'Отчёты',
  MoreTab: 'Ещё',
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabel: labels[route.name as keyof MainTabParamList],
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={icons[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="OperationsTab" component={OperationsStackNavigator} />
      <Tab.Screen name="PlanTab" component={PlanStackNavigator} />
      <Tab.Screen name="CalendarTab" component={CalendarStackNavigator} />
      <Tab.Screen name="ReportsTab" component={ReportsStackNavigator} />
      <Tab.Screen name="MoreTab" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}
