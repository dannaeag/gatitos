import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { fetchTransactions, fetchBudget, saveBudget } from '../api';
import { ReactiveCatMascot } from '../components/ReactiveCatMascot';
import { MichiClanStreak } from '../components/MichiClanStreak';
import { Transaction } from '../types';

interface MichiPreviewScreenProps {
  currencySymbol: string;
}

export const MichiPreviewScreen: React.FC<MichiPreviewScreenProps> = ({ currencySymbol }) => {
  const { width: windowWidth } = useWindowDimensions();
  // Stage is capped at 500px on wide web screens
  const stageWidth = Platform.OS === 'web' && windowWidth > 640 ? 500 : windowWidth;
  // 80% of stage width — 10% padding each side — square
  const catSize = Math.round(stageWidth * 0.8);
  // Glow ring is 20% larger than the cat
  const glowSize = Math.round(catSize * 1.2);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0); // 0 = Desactivado por defecto
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState('0');

  // Glow pulse animation
  const glowPulse     = useRef(new Animated.Value(0.55)).current;
  const glowScale     = useRef(new Animated.Value(1.0)).current;
  const glowInnerOpac = useRef(new Animated.Value(0.07)).current;
  const sparkle1      = useRef(new Animated.Value(0)).current;
  const sparkle2      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTransactions().then(setTransactions);
    const now = new Date();
    fetchBudget(now.getMonth() + 1, now.getFullYear()).then((limit) => {
      const validLimit = limit && limit > 0 ? limit : 0;
      setMonthlyLimit(validLimit);
      setTempBudgetInput(validLimit.toString());
    });

    // Soft breathing glow opacity
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.80, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.40, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Inner glow fill pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowInnerOpac, { toValue: 0.18, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowInnerOpac, { toValue: 0.05, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Gentle scale breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.08, duration: 2200, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 0.96, duration: 2200, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      ])
    ).start();

    // Sparkle orbit loops
    Animated.loop(
      Animated.timing(sparkle1, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(sparkle2, { toValue: 1, duration: 4800, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const handleSaveBudgetLimit = async () => {
    const parsed = parseFloat(tempBudgetInput);
    const newLimit = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    const now = new Date();
    await saveBudget(now.getMonth() + 1, now.getFullYear(), newLimit);
    setMonthlyLimit(newLimit);
    setIsEditingBudget(false);
  };

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') { totalIncome += tx.amount; }
    else { totalExpense += tx.amount; }
  });
  const balance = totalIncome - totalExpense;
  const isBudgetActive = monthlyLimit > 0;
  const spentRatio = isBudgetActive ? totalExpense / monthlyLimit : 0;
  const progressPct = isBudgetActive ? Math.min(Math.round(spentRatio * 100), 100) : 0;

  // Glow color tied to financial state
  let glowColor = '#38BDF8'; // default: cyan / neutro
  if (!isBudgetActive) {
    if (balance < 0) glowColor = '#F43F5E';       // Rojo (Números rojos)
    else if (balance === 0) glowColor = '#38BDF8'; // Cyan (Neutro 0)
    else if (balance > 1000) glowColor = '#10B981';// Verde Esmeralda (Millonario)
    else glowColor = '#22C55E';                    // Verde Lima (Positivo)
  } else {
    if (balance < 0 || spentRatio >= 0.95) glowColor = '#F43F5E';        // Rojo (Apretado / Sobregiro)
    else if (spentRatio >= 0.75) glowColor = '#F59E0B';                 // Ámbar (Cauteloso)
    else if (balance > 1000 || totalExpense === 0) glowColor = '#10B981';// Verde Esmeralda (Millonario)
    else if (spentRatio < 0.4 || balance > 300) glowColor = '#22C55E';  // Verde Lima (Satisfecho)
    else glowColor = '#38BDF8';                                         // Cyan (Relajado)
  }

  // Sparkle rotation interpolations
  const spin1 = sparkle1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = sparkle2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      {/* Cat + Glow effects container */}
      <View style={[styles.catScene, { width: glowSize, height: glowSize }]}>

        {/* Outer soft glow ring */}
        <Animated.View style={[
          styles.glowRing,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            borderColor: glowColor,
            opacity: glowPulse,
            transform: [{ scale: glowScale }],
          }
        ]} />

        {/* Inner solid glow circle */}
        <Animated.View style={[
          styles.glowInner,
          {
            width: Math.round(glowSize * 0.75),
            height: Math.round(glowSize * 0.75),
            borderRadius: glowSize * 0.75 / 2,
            backgroundColor: glowColor,
            opacity: glowInnerOpac,
            transform: [{ scale: glowScale }],
          }
        ]} />

        {/* Sparkle orbit 1 */}
        <Animated.View style={[styles.sparkleOrbit, { transform: [{ rotate: spin1 }] }]}>
          <View style={[styles.sparkle, { top: 0, left: '50%', marginLeft: -6, backgroundColor: glowColor }]} />
          <View style={[styles.sparkle, { bottom: 0, left: '50%', marginLeft: -6, backgroundColor: '#ffffff', opacity: 0.9 }]} />
          <View style={[styles.sparkle, { top: '50%', left: 0, marginTop: -6, backgroundColor: glowColor, width: 10, height: 10, borderRadius: 5 }]} />
          <View style={[styles.sparkle, { top: '50%', right: 0, marginTop: -6, backgroundColor: '#ffffff', opacity: 0.9, width: 10, height: 10, borderRadius: 5 }]} />
        </Animated.View>

        {/* Sparkle orbit 2 */}
        <Animated.View style={[styles.sparkleOrbit, { transform: [{ rotate: spin2 }] }]}>
          <View style={[styles.sparkle, { top: '15%', right: '5%', backgroundColor: '#ffffff', width: 12, height: 12, borderRadius: 6, opacity: 0.85 }]} />
          <View style={[styles.sparkle, { bottom: '15%', left: '5%', backgroundColor: glowColor, width: 12, height: 12, borderRadius: 6 }]} />
        </Animated.View>

        {/* The actual cat mascot */}
        <View style={[styles.catCenter, { width: catSize, height: catSize }]}>
          <ReactiveCatMascot
            totalExpense={totalExpense}
            totalIncome={totalIncome}
            monthlyLimit={monthlyLimit}
            size={catSize}
            standalone={true}
          />
        </View>
      </View>

      {/* Racha y Escuadrón Michi */}
      <MichiClanStreak transactions={transactions} />

      {/* Card de BALANCE TOTAL y PRESUPUESTO OPCIONAL */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceHeaderLabel}>BALANCE TOTAL</Text>
        <Text style={[styles.balanceAmountText, balance < 0 ? styles.negativeText : styles.positiveText]}>
          {currencySymbol}{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.incomeBreakdownText}>
            + {currencySymbol}{totalIncome.toLocaleString('es-ES')} Ingresos
          </Text>
          <Text style={styles.breakdownBullet}>•</Text>
          <Text style={styles.expenseBreakdownText}>
            - {currencySymbol}{totalExpense.toLocaleString('es-ES')} Gastos
          </Text>
        </View>

        {/* Sección de Presupuesto Opcional */}
        <View style={styles.budgetProgressSection}>
          {isBudgetActive && (
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: spentRatio >= 0.95 ? '#F43F5E' : spentRatio >= 0.75 ? '#F59E0B' : '#38BDF8'
                }
              ]} />
            </View>
          )}

          {/* Límite editable u Opcional (0 = Desactivado) */}
          {isEditingBudget ? (
            <View style={styles.editBudgetRow}>
              <Text style={styles.budgetEditLabel}>Límite ({currencySymbol}):</Text>
              <TextInput
                style={styles.budgetInput}
                value={tempBudgetInput}
                onChangeText={setTempBudgetInput}
                keyboardType="numeric"
                placeholder="0 = Sin límite"
                placeholderTextColor="#64748B"
                autoFocus
              />
              <TouchableOpacity style={styles.saveBudgetBtn} onPress={handleSaveBudgetLimit}>
                <Text style={styles.saveBudgetBtnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBudgetBtn} onPress={() => setIsEditingBudget(false)}>
                <Text style={styles.cancelBudgetBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.budgetDisplayRow} onPress={() => setIsEditingBudget(true)}>
              <Text style={styles.budgetDisplayText}>
                Presupuesto: {isBudgetActive ? (
                  <Text style={styles.budgetValueText}>{currencySymbol}{monthlyLimit.toLocaleString('es-ES')}</Text>
                ) : (
                  <Text style={styles.budgetDisabledText}>Sin Límite (Opcional - Pon 0 para desactivar)</Text>
                )}
              </Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  catScene: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
  },
  glowInner: {
    position: 'absolute',
  },
  sparkleOrbit: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginBottom: 10,
  },
  balanceHeaderLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  balanceAmountText: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  positiveText: { color: '#38BDF8' },
  negativeText: { color: '#F43F5E' },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  incomeBreakdownText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  breakdownBullet:     { color: '#64748B', marginHorizontal: 8 },
  expenseBreakdownText:{ color: '#F43F5E', fontSize: 13, fontWeight: '700' },
  budgetProgressSection: {
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  budgetDisplayText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  budgetValueText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  budgetDisabledText: {
    color: '#64748B',
    fontStyle: 'italic',
  },
  editIcon: {
    fontSize: 12,
    marginLeft: 6,
  },
  editBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  budgetEditLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 6,
  },
  budgetInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 90,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  saveBudgetBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
  },
  saveBudgetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBudgetBtn: {
    marginLeft: 6,
    padding: 4,
  },
  cancelBudgetBtnText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
