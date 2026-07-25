import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Transaction, TransactionType } from '../types';
import { fetchTransactions, deleteTransaction } from '../api';
import { ExpenseCard } from '../components/ExpenseCard';
import { Search, Filter, Calendar } from '../components/Icons';

interface HistoryScreenProps {
  currencySymbol: string;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ currencySymbol }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTransactions(month, year);
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.container}>
      {/* Search & Filter Bar */}
      <View style={styles.headerBar}>
        <View style={styles.searchBox}>
          <Search size={18} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o categoría..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'ALL' && styles.activeChip]}
            onPress={() => setSelectedType('ALL')}
          >
            <Text style={[styles.filterChipText, selectedType === 'ALL' && styles.activeChipText]}>
              Todos ({transactions.length})
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
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySub}>No se encontraron transacciones registradas</Text>
          </View>
        ) : (
          filtered.map((tx) => (
            <ExpenseCard
              key={tx.id}
              transaction={tx}
              currencySymbol={currencySymbol}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBar: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
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
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});
