import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { CategoryBreakdown } from '../types';

interface DonutChartProps {
  data: CategoryBreakdown[];
  size?: number;
  strokeWidth?: number;
  currencySymbol?: string;
  totalExpense: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 24,
  currencySymbol = '$',
  totalExpense,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (data.length === 0 || totalExpense === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={styles.centerSubText}>Sin gastos</Text>
          <Text style={styles.centerTotalText}>{currencySymbol}0.00</Text>
        </View>
      </View>
    );
  }

  let accumulatedAngle = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotation = accumulatedAngle;
            accumulatedAngle += (item.percentage / 100) * 360;

            return (
              <Circle
                key={item.categoryId || index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                rotation={rotation}
                origin={`${center}, ${center}`}
                fill="none"
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.centerTextContainer}>
        <Text style={styles.centerSubText}>Total Gastado</Text>
        <Text style={styles.centerTotalText}>
          {currencySymbol}{totalExpense.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSubText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerTotalText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
});
