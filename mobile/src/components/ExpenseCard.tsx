import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Trash2 } from './Icons';
import { TransactionReceiptModal } from './TransactionReceiptModal';

interface ExpenseCardProps {
  transaction: Transaction;
  currencySymbol?: string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  transaction,
  currencySymbol = '$',
  onEdit,
  onDelete,
}) => {
  const [showReceipt, setShowReceipt] = useState(false);

  const isIncome = transaction.type === 'INCOME';
  const isSaving = transaction.type === 'SAVING';

  const txDate = new Date(transaction.date);
  const formattedDate = txDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = txDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const freqLabels: Record<string, string> = {
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    ANNUAL: 'Anual',
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setShowReceipt(true)}
      >
        <View style={styles.leftSection}>
          <View style={styles.iconWrapper}>
            <CategoryIcon
              name={transaction.category?.icon || 'bag'}
              color={transaction.category?.color || '#64748B'}
              size={18}
            />
            <Text style={styles.catBadge}>{isSaving ? '🐷' : isIncome ? '🐱' : '🐾'}</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {transaction.title}
            </Text>
            <View style={styles.subDetails}>
              <Text style={styles.categoryName}>
                {transaction.category?.name || 'General'}
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.date}>{formattedDate} {formattedTime}</Text>
            </View>

            {transaction.isRecurring && (
              <Text style={styles.recurringTag}>
                🔁 Recurrente ({freqLabels[transaction.recurrenceFrequency || 'MONTHLY'] || 'Mensual'})
                {transaction.billingDate ? ` • Cobro: ${transaction.billingDate}` : ''}
              </Text>
            )}

            {transaction.notes ? (
              <Text style={styles.notesText} numberOfLines={1}>
                💬 {transaction.notes}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.amount, isSaving ? styles.savingText : isIncome ? styles.incomeText : styles.expenseText]}>
            {isSaving ? '🐷 +' : isIncome ? '+' : '-'}{currencySymbol}
            {transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          <View style={styles.actionsRow}>
            {/* View Receipt Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowReceipt(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionEmoji}>🧾</Text>
            </TouchableOpacity>

            {onEdit && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onEdit(transaction)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.actionEmoji}>✏️</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onDelete(transaction.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color="#F43F5E" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal Boleta / Comprobante */}
      <TransactionReceiptModal
        transaction={transaction}
        currencySymbol={currencySymbol}
        visible={showReceipt}
        onClose={() => setShowReceipt(false)}
        onEdit={onEdit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    position: 'relative',
  },
  catBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 12,
  },
  details: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  subDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    color: '#64748B',
    marginHorizontal: 4,
    fontSize: 12,
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
  },
  notesText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  incomeText: {
    color: '#22C55E',
  },
  savingText: {
    color: '#38BDF8',
  },
  expenseText: {
    color: '#F43F5E',
  },
  recurringTag: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    backgroundColor: '#38BDF815',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  actionBtn: {
    marginLeft: 8,
    padding: 3,
  },
  actionEmoji: {
    fontSize: 14,
  },
});
