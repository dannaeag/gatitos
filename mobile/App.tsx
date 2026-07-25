import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ProceduralMagicalForest } from './src/components/ProceduralMagicalForest';
import { MichiPreviewScreen } from './src/screens/MichiPreviewScreen';
import { TransactionsCrudScreen } from './src/screens/TransactionsCrudScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { Transaction } from './src/types';
import { PlusCircle, History, Sparkles, Settings, X } from './src/components/Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Ocurrió un error al cargar la vista</Text>
          <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'history' | 'settings'>('preview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setShowAddModal(true);
  };

  const handleSuccessForm = () => {
    setEditingTx(null);
    setShowAddModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ErrorBoundary>
      <View style={styles.rootContainer}>
        {/* Global Animated Procedural Magical Forest Background */}
        <ProceduralMagicalForest>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            {/* Main Screen Body */}
            <View style={styles.body}>
              {activeTab === 'preview' ? (
                /* Pestaña Izquierda: Preview Limpio sin Tarjetas - Solo Gato Centrado y Letras sobre el Gato */
                <MichiPreviewScreen key={refreshTrigger} currencySymbol={currencySymbol} />
              ) : activeTab === 'history' ? (
                /* Pestaña Derecha: Historial y Tarjetas de Transacciones */
                <TransactionsCrudScreen
                  key={refreshTrigger}
                  currencySymbol={currencySymbol}
                  onNavigateToAdd={handleOpenAdd}
                  onNavigateToEdit={handleOpenEdit}
                />
              ) : (
                /* Pestaña Ajustes */
                <SettingsScreen
                  currencySymbol={currencySymbol}
                  onCurrencyChange={(newSymbol) => setCurrencySymbol(newSymbol)}
                />
              )}
            </View>

            {/* Floating Glassmorphism Bottom Navigation Bar */}
            <View style={styles.tabBar}>
              {/* Botón Izquierdo: Preview Centrado del Gato + Bosque Mágico */}
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('preview')}
              >
                <Sparkles
                  size={22}
                  color={activeTab === 'preview' ? '#38BDF8' : '#94A3B8'}
                />
                <Text style={[styles.tabLabel, activeTab === 'preview' && styles.activeTabLabel]}>
                  Preview Gato
                </Text>
              </TouchableOpacity>

              {/* Botón Central: Agregar Dinero */}
              <TouchableOpacity style={styles.tabItem} onPress={handleOpenAdd}>
                <View style={styles.addTabIconBg}>
                  <PlusCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.tabLabel, { color: '#38BDF8', fontWeight: '700' }]}>
                  Agregar
                </Text>
              </TouchableOpacity>

              {/* Botón Derecho: Tarjetas e Historial de Registros */}
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('history')}
              >
                <History
                  size={22}
                  color={activeTab === 'history' ? '#38BDF8' : '#94A3B8'}
                />
                <Text style={[styles.tabLabel, activeTab === 'history' && styles.activeTabLabel]}>
                  Registros
                </Text>
              </TouchableOpacity>
            </View>

            {/* Translucent Floating Form Modal over Magical Forest */}
            <Modal
              visible={showAddModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowAddModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentCard}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalHeaderTitle}>
                      {editingTx ? '✏️ Editando Registro' : '➕ Registrar Dinero'}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeModalBtn}
                      onPress={() => setShowAddModal(false)}
                    >
                      <X size={20} color="#F8FAFC" />
                    </TouchableOpacity>
                  </View>

                  <AddExpenseScreen
                    currencySymbol={currencySymbol}
                    editingTransaction={editingTx}
                    onSuccess={handleSuccessForm}
                    onCancel={() => setShowAddModal(false)}
                  />
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </ProceduralMagicalForest>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#070F1E',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    height: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.8)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  addTabIconBg: {
    backgroundColor: '#38BDF8',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 15, 30, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    height: '84%',
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#F43F5E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDetails: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
