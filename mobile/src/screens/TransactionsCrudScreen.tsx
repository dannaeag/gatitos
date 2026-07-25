import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Transaction } from '../types';
import { fetchTransactions, deleteTransaction } from '../api';
import { ExpenseCard } from '../components/ExpenseCard';
import { ReactiveCatMascot } from '../components/ReactiveCatMascot';
import { ProceduralMagicalForest } from '../components/ProceduralMagicalForest';
import { Search, Plus, TrendingUp, TrendingDown } from '../components/Icons';

interface TransactionsCrudScreenProps {
  currencySymbol: string;
  onNavigateToAdd: () => void;
  onNavigateToEdit: (transaction: Transaction) => void;
}

export const TransactionsCrudScreen: React.FC<TransactionsCrudScreenProps> = ({
  currencySymbol,
  onNavigateToAdd,
  onNavigateToEdit,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await fetchTransactions();
    setTransactions(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('🐾 ¿Estás seguro de que deseas eliminar este registro?');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        '🐾 Eliminar Transacción',
        '¿Estás seguro de que deseas eliminar este registro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sí, Eliminar',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  // Calculate quick totals
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSaving = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else if (tx.type === 'SAVING') {
      totalSaving += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  });
  const balance = totalIncome - totalExpense - totalSaving;
  const patrimonioTotal = totalIncome - totalExpense;

  // ADHD Gamification Metrics
  const streakDays = Math.max(3, transactions.length > 0 ? 5 : 1);
  const michiLevel = Math.min(10, Math.floor(transactions.length / 2) + 1);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <ProceduralMagicalForest>
      <View style={styles.darkOverlay}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerTitleRow}>
            <Image
              source={require('../../assets/cat_black_licking.png')}
              style={styles.headerCatIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>Michi Gastos 🐾</Text>
              <Text style={styles.headerSub}>Bosque Mágico Parallax & TDAH Friendly</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtnHeader} onPress={onNavigateToAdd}>
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
          }
        >
          {/* ADHD Dopamine Streak & Level Banner */}
          <View style={styles.adhdRewardsBanner}>
            <View style={styles.rewardChip}>
              <Text style={styles.rewardChipEmoji}>🔥</Text>
              <View>
                <Text style={styles.rewardChipLabel}>Racha Diaria</Text>
                <Text style={styles.rewardChipValue}>{streakDays} días seguidos</Text>
              </View>
            </View>

            <View style={styles.rewardChip}>
              <Text style={styles.rewardChipEmoji}>⭐</Text>
              <View>
                <Text style={styles.rewardChipLabel}>Nivel Gatuno</Text>
                <Text style={styles.rewardChipValue}>Nivel {michiLevel} Guardián</Text>
              </View>
            </View>
          </View>

          {/* Animated Reactive Cat Mascot Header */}
          <ReactiveCatMascot
            totalExpense={totalExpense}
            totalIncome={totalIncome}
            monthlyLimit={1500}
          />

          {/* Summary Chips Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryChipLabel}>Disponible</Text>
              <Text style={[styles.summaryChipValue, balance < 0 ? styles.negativeText : styles.positiveText]}>
                {currencySymbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.summaryChip}>
              <View style={styles.chipHeader}>
                <TrendingUp size={14} color="#10B981" />
                <Text style={[styles.summaryChipLabel, { marginLeft: 4 }]}>Ingresos</Text>
              </View>
              <Text style={styles.incomeText}>
                +{currencySymbol}{totalIncome.toLocaleString('es-ES')}
              </Text>
            </View>

            <View style={styles.summaryChip}>
              <View style={styles.chipHeader}>
                <TrendingDown size={14} color="#F43F5E" />
                <Text style={[styles.summaryChipLabel, { marginLeft: 4 }]}>Gastos</Text>
              </View>
              <Text style={styles.expenseText}>
                -{currencySymbol}{totalExpense.toLocaleString('es-ES')}
              </Text>
            </View>

            <View style={styles.summaryChip}>
              <View style={styles.chipHeader}>
                <Text style={{ fontSize: 12 }}>🐷</Text>
                <Text style={[styles.summaryChipLabel, { marginLeft: 4 }]}>Ahorros</Text>
              </View>
              <Text style={styles.savingText}>
                +{currencySymbol}{totalSaving.toLocaleString('es-ES')}
              </Text>
            </View>
          </View>

          {/* Patrimonio Total Banner Row */}
          <View style={styles.patrimonioRowBanner}>
            <Text style={styles.patrimonioRowLabel}>💎 Patrimonio Total (Disponible + Ahorro):</Text>
            <Text style={styles.patrimonioRowValue}>
              {currencySymbol}{patrimonioTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Search & Type Filter Bar */}
          <View style={styles.filterSection}>
            <View style={styles.searchBox}>
              <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por descripción o categoría..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.typeFilterRow}>
              <TouchableOpacity
                style={[styles.filterChip, selectedType === 'ALL' && styles.activeChip]}
                onPress={() => setSelectedType('ALL')}
              >
                <Text style={[styles.filterChipText, selectedType === 'ALL' && styles.activeChipText]}>
                  🐾 Todos ({transactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, selectedType === 'EXPENSE' && styles.activeExpenseChip]}
                onPress={() => setSelectedType('EXPENSE')}
              >
                <Text style={[styles.filterChipText, selectedType === 'EXPENSE' && styles.activeChipText]}>
                  💸 Gastos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, selectedType === 'INCOME' && styles.activeIncomeChip]}
                onPress={() => setSelectedType('INCOME')}
              >
                <Text style={[styles.filterChipText, selectedType === 'INCOME' && styles.activeChipText]}>
                  💰 Ingresos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, selectedType === 'SAVING' && styles.activeSavingChip]}
                onPress={() => setSelectedType('SAVING')}
              >
                <Text style={[styles.filterChipText, selectedType === 'SAVING' && styles.activeChipText]}>
                  🐷 Ahorros
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions List */}
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Image
                source={require('../../assets/cat_black_hugging.png')}
                style={styles.catEmptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>¡No hay registros aquí!</Text>
              <Text style={styles.emptySub}>Presiona el botón + para registrar tu primer gasto o ingreso 🐾</Text>
            </View>
          ) : (
            filtered.map((tx) => (
              <ExpenseCard
                key={tx.id}
                transaction={tx}
                currencySymbol={currencySymbol}
                onEdit={onNavigateToEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollView>
      </View>
    </ProceduralMagicalForest>
  );
};

const styles = StyleSheet.create({
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 15, 30, 0.4)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.8)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCatIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  adhdRewardsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rewardChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  rewardChipEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  rewardChipLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  rewardChipValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryChipLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  summaryChipValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  positiveText: {
    color: '#F8FAFC',
  },
  negativeText: {
    color: '#F43F5E',
  },
  incomeText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  expenseText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  savingText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  patrimonioRowBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF840',
  },
  patrimonioRowLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  patrimonioRowValue: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  typeFilterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  activeChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  activeExpenseChip: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  activeIncomeChip: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activeSavingChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  catEmptyImage: {
    width: 110,
    height: 110,
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
