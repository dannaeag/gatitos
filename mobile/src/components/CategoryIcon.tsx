import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ShoppingCart,
  Utensils,
  Home,
  Zap,
  Car,
  Film,
  Activity,
  Tv,
  Briefcase,
  TrendingUp,
  PieChart,
  PlusCircle,
  Book,
  ShoppingBag,
  HelpCircle,
} from './Icons';

interface CategoryIconProps {
  name: string;
  color: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, color, size = 20 }) => {
  const getIcon = () => {
    switch (name.toLowerCase()) {
      case 'shopping-cart':
      case 'mercado':
        return <ShoppingCart size={size} color="#FFFFFF" />;
      case 'utensils':
      case 'restaurantes':
        return <Utensils size={size} color="#FFFFFF" />;
      case 'home':
      case 'vivienda':
        return <Home size={size} color="#FFFFFF" />;
      case 'zap':
      case 'servicios':
        return <Zap size={size} color="#FFFFFF" />;
      case 'car':
      case 'transporte':
        return <Car size={size} color="#FFFFFF" />;
      case 'film':
      case 'entretenimiento':
        return <Film size={size} color="#FFFFFF" />;
      case 'activity':
      case 'salud':
        return <Activity size={size} color="#FFFFFF" />;
      case 'tv':
      case 'suscripciones':
        return <Tv size={size} color="#FFFFFF" />;
      case 'briefcase':
      case 'salario':
        return <Briefcase size={size} color="#FFFFFF" />;
      case 'trending-up':
      case 'ventas':
        return <TrendingUp size={size} color="#FFFFFF" />;
      case 'pie-chart':
      case 'inversiones':
        return <PieChart size={size} color="#FFFFFF" />;
      case 'book':
        return <Book size={size} color="#FFFFFF" />;
      case 'bag':
        return <ShoppingBag size={size} color="#FFFFFF" />;
      default:
        return <HelpCircle size={size} color="#FFFFFF" />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color, width: size * 2, height: size * 2, borderRadius: size }]}>
      {getIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
