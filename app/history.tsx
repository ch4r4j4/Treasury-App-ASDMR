import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Trash2, CheckSquare, Square } from 'lucide-react-native';
import { useTreasury } from '@/contexts/TreasuryContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { receipts, expenses, deleteReceipt, deleteExpense } = useTreasury();
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchDate, setSearchDate] = useState('');

  const allTransactions = [
    ...receipts.map(r => ({ ...r, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ]
    .filter(t => {
      if (filterType === 'income') return t.type === 'income';
      if (filterType === 'expense') return t.type === 'expense';
      return true;
    })
    .filter(t => {
      if (!searchDate) return true;
      return t.fecha.includes(searchDate);
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const toggleSelection = (id: string, type: 'income' | 'expense') => {
    const key = `${type}-${id}`;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      Alert.alert('Aviso', 'No hay registros seleccionados');
      return;
    }

    Alert.alert(
      'Eliminar Seleccionados',
      `¿Está seguro de eliminar ${selectedIds.size} registro(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach(key => {
              const [type, id] = key.split('-');
              if (type === 'income') {
                deleteReceipt(id);
              } else {
                deleteExpense(id);
              }
            });
            setSelectedIds(new Set());
            setSelectionMode(false);
            Alert.alert('Éxito', 'Registros eliminados correctamente');
          },
        },
      ]
    );
  };

  const handleDeleteReceipt = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar Recibo',
      `¿Está seguro de eliminar el recibo de ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteReceipt(id),
        },
      ]
    );
  };

  const handleDeleteExpense = (id: string, descripcion: string) => {
    Alert.alert(
      'Eliminar Egreso',
      `¿Está seguro de eliminar el egreso "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Historial</Text>
          
          {/* Botón de selección múltiple */}
          <TouchableOpacity 
            onPress={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds(new Set());
            }}
            style={styles.iconButton}
          >
            <Trash2 size={22} color={selectionMode ? '#F44336' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'income' && styles.filterButtonActive]}
              onPress={() => setFilterType('income')}
            >
              <Text style={[styles.filterButtonText, filterType === 'income' && styles.filterButtonTextActive]}>
                Ingresos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'expense' && styles.filterButtonActive]}
              onPress={() => setFilterType('expense')}
            >
              <Text style={[styles.filterButtonText, filterType === 'expense' && styles.filterButtonTextActive]}>
                Egresos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Búsqueda por fecha */}
          <TextInput
            style={styles.searchInput}
            value={searchDate}
            onChangeText={setSearchDate}
            placeholder="Buscar por fecha (2025-01)"
            placeholderTextColor="#999"
          />
        </View>

        {/* Botón de eliminar seleccionados */}
        {selectionMode && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              {selectedIds.size} seleccionado(s)
            </Text>
            <TouchableOpacity
              style={styles.deleteSelectedButton}
              onPress={handleDeleteSelected}
            >
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.deleteSelectedText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {allTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Sin Registros</Text>
                <Text style={styles.emptyText}>No hay transacciones registradas</Text>
              </View>
            ) : (
              allTransactions.map((transaction) => {
                const key = `${transaction.type}-${transaction.id}`;
                const isSelected = selectedIds.has(key);

                if (transaction.type === 'income') {
                  const receipt = transaction;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.card, isSelected && styles.cardSelected]}
                      onPress={() => selectionMode && toggleSelection(receipt.id, 'income')}
                      activeOpacity={selectionMode ? 0.7 : 1}
                    >
                      {selectionMode && (
                        <View style={styles.checkbox}>
                          {isSelected ? (
                            <CheckSquare size={24} color="#2196F3" />
                          ) : (
                            <Square size={24} color="#CCC" />
                          )}
                        </View>
                      )}
                      
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <View style={[styles.typeIcon, { backgroundColor: '#E8F5E9' }]}>
                            <TrendingUp size={20} color="#4CAF50" />
                          </View>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{receipt.nombre}</Text>
                            <Text style={styles.cardDate}>{receipt.fecha} • {receipt.iglesia}</Text>
                          </View>
                          <Text style={[styles.cardAmount, { color: '#4CAF50' }]}>
                            +${receipt.total.toFixed(2)}
                          </Text>
                        </View>
                        
                        <View style={styles.cardDetails}>
                          {receipt.rubros.primicia > 0 && (
                            <Text style={styles.detailText}>Primicia: ${receipt.rubros.primicia.toFixed(2)}</Text>
                          )}
                          {receipt.rubros.diezmo > 0 && (
                            <Text style={styles.detailText}>Diezmo: ${receipt.rubros.diezmo.toFixed(2)}</Text>
                          )}
                          {/* ... resto de rubros ... */}
                        </View>
                        
                        {!selectionMode && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteReceipt(receipt.id, receipt.nombre)}
                          >
                            <Trash2 size={18} color="#F44336" />
                            <Text style={styles.deleteText}>Eliminar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                } else {
                  const expense = transaction;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.card, isSelected && styles.cardSelected]}
                      onPress={() => selectionMode && toggleSelection(expense.id, 'expense')}
                      activeOpacity={selectionMode ? 0.7 : 1}
                    >
                      {selectionMode && (
                        <View style={styles.checkbox}>
                          {isSelected ? (
                            <CheckSquare size={24} color="#2196F3" />
                          ) : (
                            <Square size={24} color="#CCC" />
                          )}
                        </View>
                      )}
                      
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                          <View style={[styles.typeIcon, { backgroundColor: '#FFEBEE' }]}>
                            <TrendingDown size={20} color="#F44336" />
                          </View>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{expense.descripcion}</Text>
                            <Text style={styles.cardDate}>{expense.fecha}</Text>
                          </View>
                          <Text style={[styles.cardAmount, { color: '#F44336' }]}>
                            -${expense.monto.toFixed(2)}
                          </Text>
                        </View>
                        
                        {!selectionMode && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteExpense(expense.id, expense.descripcion)}
                          >
                            <Trash2 size={18} color="#F44336" />
                            <Text style={styles.deleteText}>Eliminar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 60,
    alignItems: 'center' as const,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: '#999',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  cardDetails: {
    paddingLeft: 52,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  deleteButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F44336',
    marginLeft: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkbox: {
    marginRight: 12,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  cardContent: {
    flex: 1,
  },
});
