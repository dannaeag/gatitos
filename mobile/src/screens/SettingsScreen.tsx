import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { setApiBaseUrl, getApiBaseUrl, saveBudget } from '../api';
import { Server, DollarSign, Target, Database, Check, RefreshCw } from '../components/Icons';

interface SettingsScreenProps {
  currencySymbol: string;
  onCurrencyChange: (symbol: string) => void;
}

const CURRENCIES = [
  { symbol: '$', label: 'USD / CLP / MXN / COP ($)' },
  { symbol: '€', label: 'Euro (€)' },
  { symbol: '£', label: 'Libra Esterlina (£)' },
  { symbol: 'R$', label: 'Real Brasileño (R$)' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currencySymbol,
  onCurrencyChange,
}) => {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [budgetLimit, setBudgetLimitState] = useState('1500');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleSaveApiUrl = async () => {
    setApiBaseUrl(apiUrl);
    const activeUrl = getApiBaseUrl();
    setApiUrlState(activeUrl);
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Try /health endpoint on active normalized URL
      let res = await fetch(`${activeUrl}/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) {
        // Fallback to testing base host
        const baseUrl = activeUrl.replace(/\/api$/, '');
        res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(4000) });
      }

      if (res.ok) {
        const data = await res.json();
        setConnectionStatus(`✅ Conectado exitosamente con Render API (${data.service || 'ok'})`);
      } else {
        setConnectionStatus('⚠️ El servidor respondió pero devolvió un estado no OK');
      }
    } catch (e) {
      setConnectionStatus('⚡ Modo local / offline activo. (Verifica la URL de tu backend en Render)');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveBudget = async () => {
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido para el presupuesto');
      return;
    }

    const now = new Date();
    await saveBudget(now.getMonth() + 1, now.getFullYear(), limit);
    Alert.alert('Éxito', 'Presupuesto mensual actualizado correctamente');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Backend Server Configuration */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Server size={20} color="#38BDF8" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Conexión con Backend (Render)</Text>
        </View>

        <Text style={styles.label}>URL de la API REST</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={apiUrl}
            onChangeText={setApiUrlState}
            placeholder="https://tu-app.onrender.com/api"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.testBtn} onPress={handleSaveApiUrl} disabled={testingConnection}>
            {testingConnection ? <RefreshCw size={16} color="#FFFFFF" /> : <Text style={styles.testBtnText}>Guardar</Text>}
          </TouchableOpacity>
        </View>

        {connectionStatus && (
          <Text style={[styles.statusText, connectionStatus.includes('✅') ? styles.statusSuccess : styles.statusWarning]}>
            {connectionStatus}
          </Text>
        )}
      </View>

      {/* Monthly Budget Setup */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Target size={20} color="#F59E0B" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Límite de Presupuesto Mensual</Text>
        </View>

        <Text style={styles.label}>Define tu tope de gastos mensual</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={budgetLimit}
            onChangeText={setBudgetLimitState}
            keyboardType="decimal-pad"
            placeholder="1500"
            placeholderTextColor="#64748B"
          />
          <TouchableOpacity style={styles.testBtn} onPress={handleSaveBudget}>
            <Text style={styles.testBtnText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Currency Selector */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <DollarSign size={20} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Moneda Principal</Text>
        </View>

        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c.symbol}
            style={[styles.currencyRow, currencySymbol === c.symbol && styles.activeCurrencyRow]}
            onPress={() => onCurrencyChange(c.symbol)}
          >
            <Text style={styles.currencyLabel}>{c.label}</Text>
            {currencySymbol === c.symbol && <Check size={18} color="#10B981" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Database size={20} color="#EC4899" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Información del Sistema</Text>
        </View>
        <Text style={styles.infoText}>App: Control de Gastos v1.0.0 (iOS / Web)</Text>
        <Text style={styles.infoText}>Arquitectura: Expo React Native + Render PostgreSQL</Text>
        <Text style={styles.infoText}>Estado DB: PostgreSQL en Render ready</Text>
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
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  testBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    marginTop: 10,
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusWarning: {
    color: '#F59E0B',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#33415550',
  },
  activeCurrencyRow: {
    backgroundColor: '#10B98110',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  currencyLabel: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
});
