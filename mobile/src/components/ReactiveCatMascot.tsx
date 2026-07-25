import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';

export type CatState = 'dollar' | 'licking' | 'hugging' | 'serious' | 'wrapped';

interface ReactiveCatMascotProps {
  totalExpense: number;
  totalIncome: number;
  monthlyLimit?: number | null;
  size?: number;
  standalone?: boolean;
}

export const ReactiveCatMascot: React.FC<ReactiveCatMascotProps> = ({
  totalExpense,
  totalIncome,
  monthlyLimit = 0,
  size = 150,
  standalone = false,
}) => {
  const isBudgetEnabled = monthlyLimit !== null && monthlyLimit !== undefined && monthlyLimit > 0;
  const limit = isBudgetEnabled ? monthlyLimit : 0;
  const spentRatio = isBudgetEnabled && limit > 0 ? totalExpense / limit : 0;
  const balance = totalIncome - totalExpense;

  let state: CatState = 'hugging';
  let title = 'Michi Relajado 💤';
  let subText = 'Balance en punto neutro';
  let color = '#38BDF8';

  if (!isBudgetEnabled) {
    // ── Lógica modo Presupuesto DESACTIVADO (Límite = 0) ──
    // Se evalúa exclusivamente el Balance (Rojo, Neutro, Positivo)
    if (balance < 0) {
      state = 'wrapped';
      title = 'Michi en Números Rojos 🔴';
      subText = 'Gastos superiores a ingresos';
      color = '#F43F5E';
    } else if (balance === 0) {
      state = 'hugging';
      title = 'Michi Neutro 💤';
      subText = 'Sin pérdidas ni ganancias';
      color = '#38BDF8';
    } else if (balance > 1000) {
      state = 'dollar';
      title = '¡Michi Millonario! 🤑';
      subText = 'Gran superávit de dinero';
      color = '#10B981';
    } else {
      state = 'licking';
      title = 'Michi en Positivo 😋';
      subText = 'Balance positivo a favor';
      color = '#22C55E';
    }
  } else {
    // ── Lógica modo Presupuesto ACTIVADO (Límite > 0) ──
    // Se suman las reacciones por consumo de presupuesto
    if (balance < 0 || spentRatio >= 0.95) {
      state = 'wrapped';
      title = '¡Michi Apretado! 🐍';
      subText = 'Presupuesto al límite o sobregirado';
      color = '#F43F5E';
    } else if (spentRatio >= 0.75) {
      state = 'serious';
      title = 'Michi Cauteloso 🤨';
      subText = 'Cuidando el presupuesto mensual';
      color = '#F59E0B';
    } else if (balance > 1000 || (totalIncome > 0 && totalExpense === 0)) {
      state = 'dollar';
      title = '¡Michi Millonario! 🤑';
      subText = '¡Gran superávit de dinero!';
      color = '#10B981';
    } else if (spentRatio < 0.4 || balance > 300) {
      state = 'licking';
      title = '¡Michi Satisfecho! 😋';
      subText = '¡Excelente nivel de ahorro!';
      color = '#22C55E';
    } else {
      state = 'hugging';
      title = 'Michi Relajado 💤';
      subText = 'Abrazando las monedas con calma';
      color = '#38BDF8';
    }
  }

  // Smooth floating idle bounce animation (+/- 8px, 2.4s infinite loop)
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Trigger smooth cross-fade animation on state change
  useEffect(() => {
    fadeAnim.setValue(0.2);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [state]);

  const getCatSource = () => {
    switch (state) {
      case 'dollar':
        return require('../../assets/cat_black_dollar.png');
      case 'licking':
        return require('../../assets/cat_black_licking.png');
      case 'serious':
        return require('../../assets/cat_black_serious.png');
      case 'wrapped':
        return require('../../assets/cat_black_wrapped.png');
      case 'hugging':
      default:
        return require('../../assets/cat_black_hugging.png');
    }
  };

  return (
    <Animated.View
      style={[
        styles.catWrapper,
        {
          transform: [{ translateY: bounceAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={[styles.imageContainer, { width: size, height: size }]}>
        <Image source={getCatSource()} style={styles.catImage} resizeMode="contain" />
      </View>

      {!standalone && (
        <View style={styles.textContainer}>
          <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{title}</Text>
          </View>
          <Text style={styles.subText}>{subText}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  catWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
