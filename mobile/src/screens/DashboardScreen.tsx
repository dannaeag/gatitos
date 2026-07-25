import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, AlertTriangle, Plus } from '../components/Icons';
import { MonthlySummary, Transaction } from '../types';
import { fetchSummary, fetchTransactions } from '../api';
import { DonutChart } from '../components/DonutChart';
import { ExpenseCard } from '../components/ExpenseCard';

interface DashboardScreenProps {
  currencySymbol: string;
  onNavigateToAdd: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currencySymbol,
  onNavigateToAdd,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadData = async () => {
    setLoading(true);
    const summaryData = await fetchSummary(month, year);
    const txData = await fetchTransactions(month, year);
    setSummary(summaryData);
    setRecentTransactions(txData.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
      }
    >
      {/* Month Selector Bar */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
          <ChevronLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.monthTextContainer}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
        </View>

        <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
          <ChevronRight size={22} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Hero Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Balance del Mes</Text>
        <Text style={[styles.balanceValue, (summary?.balance || 0) < 0 ? styles.negativeText : styles.positiveText]}>
          {currencySymbol}
          {(summary?.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
              <TrendingUp size={16} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={styles.statValueIncome}>
                +{currencySymbol}{(summary?.totalIncome || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#F43F5E20' }]}>
              <TrendingDown size={16} color="#F43F5E" />
            </View>
            <View>
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={styles.statValueExpense}>
                -{currencySymbol}{(summary?.totalExpense || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Budget Progress Card */}
      {summary?.monthlyLimit ? (
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.sectionTitle}>Presupuesto Mensual</Text>
            <Text style={styles.budgetPercent}>
              {summary.budgetProgressPercentage.toFixed(0)}% Utilizado
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(summary.budgetProgressPercentage, 100)}%`,
                  backgroundColor: summary.budgetProgressPercentage > 90 ? '#F43F5E' : '#38BDF8',
                },
              ]}
            />
          </View>

          <View style={styles.budgetDetailsRow}>
            <Text style={styles.budgetSubText}>
              Gastado: {currencySymbol}{summary.totalExpense.toLocaleString('es-ES')}
            </Text>
            <Text style={styles.budgetSubText}>
              Límite: {currencySymbol}{summary.monthlyLimit.toLocaleString('es-ES')}
            </Text>
          </View>

          {summary.budgetProgressPercentage >= 90 && (
            <View style={styles.warningAlert}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Has superado el 90% de tu presupuesto para este mes.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Expense Breakdown Donut Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Desglose por Categorías</Text>
        <View style={styles.chartWrapper}>
          <DonutChart
            data={summary?.categoryBreakdown || []}
            totalExpense={summary?.totalExpense || 0}
            currencySymbol={currencySymbol}
          />
        </View>

        {/* Category Legend List */}
        <View style={styles.categoryList}>
          {summary?.categoryBreakdown.map((item) => (
            <View key={item.categoryId} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <View style={[styles.dotLegend, { backgroundColor: item.color }]} />
                <Text style={styles.categoryNameText}>{item.categoryName}</Text>
              </View>
              <Text style={styles.categoryAmountText}>
                {currencySymbol}{item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ({item.percentage.toFixed(0)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions List */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <TouchableOpacity onPress={onNavigateToAdd} style={styles.addQuickBtn}>
            <Plus size={16} color="#38BDF8" />
            <Text style={styles.addQuickText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay registros en este mes</Text>
          </View>
        ) : (
          recentTransactions.map((tx) => (
            <ExpenseCard key={tx.id} transaction={tx} currencySymbol={currencySymbol} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  arrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  monthTextContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 16,
  },
  positiveText: {
    color: '#F8FAFC',
  },
  negativeText: {
    color: '#F43F5E',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  statValueIncome: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  statValueExpense: {
    color: '#F43F5E',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  budgetCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  budgetPercent: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  budgetDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSubText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FEF3C720',
    padding: 8,
    borderRadius: 8,
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  chartSection: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#33415520',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotLegend: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryNameText: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  categoryAmountText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addQuickText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
