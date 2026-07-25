import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Category, Transaction, TransactionType, PaymentMethod, RecurrenceFrequency } from '../types';
import { fetchCategories, createTransaction, updateTransaction } from '../api';
import { CategoryIcon } from '../components/CategoryIcon';
import { Check, CreditCard, Banknote, ArrowRightLeft } from '../components/Icons';

interface AddExpenseScreenProps {
  currencySymbol: string;
  editingTransaction?: Transaction | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  currencySymbol,
  editingTransaction,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!editingTransaction;

  const [type, setType] = useState<TransactionType>(editingTransaction?.type || 'EXPENSE');
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '');
  const [title, setTitle] = useState(editingTransaction ? editingTransaction.title : '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(editingTransaction?.categoryId || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editingTransaction?.paymentMethod || 'CARD');
  const [notes, setNotes] = useState(editingTransaction?.notes || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Recurrencia & Fecha de Facturación
  const [isRecurring, setIsRecurring] = useState<boolean>(editingTransaction?.isRecurring || false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(
    editingTransaction?.recurrenceFrequency || 'MONTHLY'
  );
  const [billingDate, setBillingDate] = useState<string>(
    editingTransaction?.billingDate
      ? editingTransaction.billingDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (!selectedCategoryId) {
        const firstMatching = cats.find((c) => c.type === type);
        if (firstMatching) {
          setSelectedCategoryId(firstMatching.id);
        }
      }
    });
  }, [type]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setTitle(editingTransaction.title);
      setSelectedCategoryId(editingTransaction.categoryId);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setIsRecurring(!!editingTransaction.isRecurring);
      setRecurrenceFrequency(editingTransaction.recurrenceFrequency || 'MONTHLY');
      if (editingTransaction.billingDate) {
        setBillingDate(editingTransaction.billingDate.split('T')[0]);
      }
    }
  }, [editingTransaction]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matching = categories.find((c) => c.type === newType);
    if (matching) {
      setSelectedCategoryId(matching.id);
    } else {
      const fallbackCat = categories.length > 0 ? categories[0] : null;
      if (fallbackCat) {
        setSelectedCategoryId(fallbackCat.id);
      }
    }
  };

  const showAlert = (titleStr: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titleStr}: ${msg}`);
    } else {
      Alert.alert(titleStr, msg);
    }
  };

  const handleSubmit = async () => {
    const cleanAmountStr = amount.replace(',', '.');
    const parsedAmount = parseFloat(cleanAmountStr);
    if (!cleanAmountStr || isNaN(parsedAmount) || parsedAmount <= 0) {
      showAlert('Error', 'Por favor ingresa un monto válido');
      return;
    }
    if (!title.trim()) {
      showAlert('Error', 'Por favor ingresa una descripción o título');
      return;
    }
    if (!selectedCategoryId) {
      showAlert('Error', 'Por favor selecciona una categoría');
      return;
    }

    setSubmitting(true);

    if (isEditing && editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: parsedAmount,
        categoryId: selectedCategoryId,
        type,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
        billingDate: isRecurring ? billingDate : undefined,
      });
    } else {
      await createTransaction({
        title: title.trim(),
        amount: parsedAmount,
        categoryId: selectedCategoryId,
        type,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
        billingDate: isRecurring ? billingDate : undefined,
      });
    }

    setSubmitting(false);

    // Reset form & notify
    setAmount('');
    setTitle('');
    setNotes('');
    onSuccess();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Editing Banner */}
      {isEditing && (
        <View style={styles.editingHeader}>
          <Text style={styles.editingTitle}>✏️ Editando Registro</Text>
          {onCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Type Toggle: Gasto vs Ingreso vs Ahorro */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'EXPENSE' && styles.activeExpenseBtn]}
          onPress={() => handleTypeChange('EXPENSE')}
        >
          <Text style={[styles.typeText, type === 'EXPENSE' && styles.activeTypeText]}>
            💸 Gasto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === 'INCOME' && styles.activeIncomeBtn]}
          onPress={() => handleTypeChange('INCOME')}
        >
          <Text style={[styles.typeText, type === 'INCOME' && styles.activeTypeText]}>
            💰 Ingreso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === 'SAVING' && styles.activeSavingBtn]}
          onPress={() => handleTypeChange('SAVING')}
        >
          <Text style={[styles.typeText, type === 'SAVING' && styles.activeTypeText]}>
            🐷 Ahorro
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#64748B"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción / Título</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ej: Comida de Gato, Mercado, Fondo de Emergencia..."
          placeholderTextColor="#64748B"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Category Selector Grid */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoryGrid}>
          {filteredCategories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}20` },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <CategoryIcon name={cat.icon} color={cat.color} size={18} />
                <Text style={[styles.categoryCardName, isSelected && { color: '#F8FAFC', fontWeight: '700' }]} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Payment Method Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Método de Pago</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'CARD' && styles.activeMethodBtn]}
            onPress={() => setPaymentMethod('CARD')}
          >
            <CreditCard size={16} color={paymentMethod === 'CARD' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.methodText, paymentMethod === 'CARD' && styles.activeMethodText]}>
              Tarjeta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'CASH' && styles.activeMethodBtn]}
            onPress={() => setPaymentMethod('CASH')}
          >
            <Banknote size={16} color={paymentMethod === 'CASH' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.methodText, paymentMethod === 'CASH' && styles.activeMethodText]}>
              Efectivo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'TRANSFER' && styles.activeMethodBtn]}
            onPress={() => setPaymentMethod('TRANSFER')}
          >
            <ArrowRightLeft size={16} color={paymentMethod === 'TRANSFER' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.methodText, paymentMethod === 'TRANSFER' && styles.activeMethodText]}>
              Transf.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pago / Registro Recurrente (Activables) */}
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={[styles.recurringToggleRow, isRecurring && styles.activeRecurringToggleRow]}
          onPress={() => setIsRecurring(!isRecurring)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.recurringToggleTitle}>🔁 Pago / Registro Recurrente</Text>
            <Text style={styles.recurringToggleSubText}>
              Activa esta opción para gastos periódicos, suscripciones o metas recurrentes.
            </Text>
          </View>
          <View style={[styles.toggleCheckbox, isRecurring && styles.toggleCheckboxChecked]}>
            {isRecurring && <Check size={14} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        {isRecurring && (
          <View style={styles.recurringConfigCard}>
            <Text style={styles.label}>Frecuencia de Repetición</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.freqScroll}>
              {[
                { id: 'WEEKLY', label: '🗓️ Semanal' },
                { id: 'MONTHLY', label: '📅 Mensual' },
                { id: 'QUARTERLY', label: '📊 Trimestral' },
                { id: 'SEMIANNUAL', label: '📈 Semestral' },
                { id: 'ANNUAL', label: '👑 Anual' },
              ].map((freq) => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.freqBtn,
                    recurrenceFrequency === freq.id && styles.activeFreqBtn,
                  ]}
                  onPress={() => setRecurrenceFrequency(freq.id as RecurrenceFrequency)}
                >
                  <Text
                    style={[
                      styles.freqText,
                      recurrenceFrequency === freq.id && styles.activeFreqText,
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { marginTop: 12 }]}>Fecha de Facturación / Próximo Cobro</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD (ej: 2026-08-05)"
              placeholderTextColor="#64748B"
              value={billingDate}
              onChangeText={setBillingDate}
            />
          </View>
        )}
      </View>

      {/* Notes Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notas Michi (Opcional)</Text>
        <TextInput
          style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
          placeholder="Agregar detalle o comentario..."
          placeholderTextColor="#64748B"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, type === 'INCOME' ? styles.submitIncomeBtn : styles.submitExpenseBtn]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitBtnText}>
            {isEditing ? 'Actualizar Transacción 🐾' : `Guardar ${type === 'INCOME' ? 'Ingreso 💰' : 'Gasto 💸'}`}
          </Text>
        )}
      </TouchableOpacity>
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
  editingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  editingTitle: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeExpenseBtn: {
    backgroundColor: '#F43F5E',
  },
  activeIncomeBtn: {
    backgroundColor: '#10B981',
  },
  activeSavingBtn: {
    backgroundColor: '#38BDF8',
  },
  typeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTypeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencyPrefix: {
    color: '#94A3B8',
    fontSize: 32,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '800',
    minWidth: 120,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryCard: {
    width: '31%',
    margin: '1%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  categoryCardName: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeMethodBtn: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF815',
  },
  methodText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeMethodText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  recurringToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeRecurringToggleRow: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF815',
  },
  recurringToggleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  recurringToggleSubText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  toggleCheckboxChecked: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF8',
  },
  recurringConfigCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  freqScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  freqBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFreqBtn: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF820',
  },
  freqText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFreqText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitExpenseBtn: {
    backgroundColor: '#F43F5E',
  },
  submitIncomeBtn: {
    backgroundColor: '#10B981',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
