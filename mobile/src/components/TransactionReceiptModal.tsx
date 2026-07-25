import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  currencySymbol?: string;
  visible: boolean;
  onClose: () => void;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  currencySymbol = '$',
  visible,
  onClose,
  onEdit,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const isSaving = transaction.type === 'SAVING';

  const txDate = new Date(transaction.date);
  const formattedDate = txDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = txDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const methodLabels: Record<string, string> = {
    CARD: '💳 Tarjeta de Crédito / Débito',
    CASH: '💵 Efectivo',
    TRANSFER: '🏦 Transferencia Bancaria',
    OTHER: '⚙️ Otro Método',
  };

  const freqLabels: Record<string, string> = {
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    ANNUAL: 'Anual',
  };

  const typeTitle = isSaving ? 'AHORRO RESERVADO 🐷' : isIncome ? 'INGRESO RECIBIDO 💰' : 'COMPROBANTE DE GASTO 💸';
  const typeColor = isSaving ? '#38BDF8' : isIncome ? '#10B981' : '#F43F5E';
  const folioId = `TX-${transaction.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.receiptContainer}>
          {/* Top Decorative Serrated Edge */}
          <View style={styles.zigzagTop} />

          <ScrollView style={styles.receiptBody} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.storeName}>🐾 REGISTRO GATITOS API 🐾</Text>
              <Text style={styles.storeSub}>Comprobante de Transacción Michi</Text>
              <Text style={styles.folioText}>FOLIO: #{folioId}</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Type & Amount Hero */}
            <View style={styles.amountHero}>
              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20`, borderColor: typeColor }]}>
                <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeTitle}</Text>
              </View>
              <Text style={[styles.amountText, { color: typeColor }]}>
                {isSaving ? '🐷 +' : isIncome ? '+' : '-'}{currencySymbol}
                {transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.itemTitle}>{transaction.title}</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Transaction Details Table */}
            <View style={styles.detailsTable}>
              {/* Category */}
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Categoría:</Text>
                <View style={styles.categoryCell}>
                  <CategoryIcon
                    name={transaction.category?.icon || 'bag'}
                    color={transaction.category?.color || '#38BDF8'}
                    size={16}
                  />
                  <Text style={styles.rowValueText}>{transaction.category?.name || 'General'}</Text>
                </View>
              </View>

              {/* Date */}
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Fecha:</Text>
                <Text style={styles.rowValueText}>{formattedDate}</Text>
              </View>

              {/* Time */}
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Hora Exacta:</Text>
                <Text style={styles.rowValueHighlight}>🕒 {formattedTime} hrs</Text>
              </View>

              {/* Payment Method */}
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Método de Pago:</Text>
                <Text style={styles.rowValueText}>{methodLabels[transaction.paymentMethod] || 'Tarjeta'}</Text>
              </View>

              {/* Recurrence Status if active */}
              {transaction.isRecurring && (
                <View style={styles.tableRow}>
                  <Text style={styles.rowLabel}>Cobro Recurrente:</Text>
                  <Text style={styles.recurringValueText}>
                    🔁 {freqLabels[transaction.recurrenceFrequency || 'MONTHLY']}
                    {transaction.billingDate ? ` (Facturación: ${transaction.billingDate})` : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Notes if available */}
            {transaction.notes ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesHeader}>💬 Observaciones / Notas:</Text>
                <Text style={styles.notesContent}>{transaction.notes}</Text>
              </View>
            ) : null}

            <View style={styles.dashedDivider} />

            {/* Footer Barcode visual simulation */}
            <View style={styles.barcodeSection}>
              <View style={styles.barcodeLines}>
                {[12, 6, 18, 8, 14, 4, 20, 10, 6, 16, 8, 14, 4, 18, 10, 6, 12].map((h, i) => (
                  <View key={i} style={[styles.barcodeBar, { height: h * 1.5, width: i % 2 === 0 ? 3 : 2 }]} />
                ))}
              </View>
              <Text style={styles.barcodeText}>* {folioId} *</Text>
              <Text style={styles.thankYouText}>¡Gracias por mantener tus finanzas al día! 😸✨</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            {onEdit && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  onClose();
                  onEdit(transaction);
                }}
              >
                <Text style={styles.editBtnText}>✏️ Editar Registro</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕ Cerrar Boleta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#38BDF840',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  zigzagTop: {
    height: 6,
    backgroundColor: '#38BDF8',
    width: '100%',
  },
  receiptBody: {
    padding: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  storeName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  storeSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  folioText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dashedDivider: {
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  amountHero: {
    alignItems: 'center',
    marginVertical: 6,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 4,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  detailsTable: {
    width: '100%',
    marginVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  rowValueText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  rowValueHighlight: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recurringValueText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  notesSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  notesHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesContent: {
    color: '#CBD5E1',
    fontSize: 13,
    fontStyle: 'italic',
  },
  barcodeSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 4,
  },
  barcodeBar: {
    backgroundColor: '#94A3B8',
  },
  barcodeText: {
    color: '#64748B',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  thankYouText: {
    color: '#38BDF8',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1E293B',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
});
