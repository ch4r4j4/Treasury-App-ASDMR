import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Trash2, CheckSquare, Square, Filter } from 'lucide-react-native';
import { useTreasury } from '@/contexts/TreasuryContext';
import DatePickerInput from '@/components/DatePickerInput';

export default function HistoryScreen() {
  const router = useRouter();
  const { receipts, expenses, deleteReceipt, deleteExpense } = useTreasury();
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  // Calcular fechas según filtro de tiempo
  const getFilteredDates = () => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (timeFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      start = weekAgo.toISOString().split('T')[0];
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      start = monthAgo.toISOString().split('T')[0];
    }

    return { start, end };
  };

  const allTransactions = [
    ...receipts.map(r => ({ ...r, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ]
    .filter(t => {
      // Filtro por tipo
      if (filterType === 'income') return t.type === 'income';
      if (filterType === 'expense') return t.type === 'expense';
      return true;
    })
    .filter(t => {
      // Filtro por tiempo rápido
      if (timeFilter !== 'all') {
        const { start, end } = getFilteredDates();
        return t.fecha >= start && t.fecha <= end;
      }
      
      // Filtro por rango de fechas personalizado
      if (startDate && endDate) {
        return t.fecha >= startDate && t.fecha <= endDate;
      }
      if (startDate) {
        return t.fecha >= startDate;
      }
      if (endDate) {
        return t.fecha <= endDate;
      }
      
      return true;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const toggleSelection = (id: string, type: 'income' | 'expense') => {
    const key = `${type}::${id}`; // ✅ Usar :: en lugar de - para evitar conflictos
    const newSelected = new Set(selectedIds);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allKeys = new Set(allTransactions.map(t => `${t.type}::${t.id}`));
    setSelectedIds(allKeys);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => { // ✅ Hacer async
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
          onPress: async () => { // ✅ Hacer async
            try {
              // ✅ Esperar a que TODAS las eliminaciones terminen
              const deletePromises: Promise<void>[] = [];
              
              selectedIds.forEach(key => {
                const [type, id] = key.split('::'); // ✅ Split usando ::
                if (type === 'income') {
                  deletePromises.push(deleteReceipt(id));
                } else if (type === 'expense') {
                  deletePromises.push(deleteExpense(id));
                }
              });

              // ✅ Esperar a que TODAS terminen
              await Promise.all(deletePromises);
              
              setSelectedIds(new Set());
              setSelectionMode(false);
              Alert.alert('✅ Éxito', `${selectedIds.size} registro(s) eliminado(s) correctamente`);
            } catch (error) {
              console.error('Error eliminando registros:', error);
              Alert.alert('Error', 'Hubo un problema al eliminar algunos registros');
            }
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
          
          {/* Botones de acción */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowDateFilters(!showDateFilters)}
              style={styles.iconButton}
            >
              <Filter size={22} color={showDateFilters ? '#2196F3' : '#666'} />
            </TouchableOpacity>
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

          {/* Filtros de tiempo rápido */}
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'all' && styles.filterButtonActive]}
              onPress={() => {
                setTimeFilter('all');
                setStartDate('');
                setEndDate('');
              }}
            >
              <Text style={[styles.filterButtonText, timeFilter === 'all' && styles.filterButtonTextActive]}>
                Todo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'week' && styles.filterButtonActive]}
              onPress={() => {
                setTimeFilter('week');
                setStartDate('');
                setEndDate('');
              }}
            >
              <Text style={[styles.filterButtonText, timeFilter === 'week' && styles.filterButtonTextActive]}>
                Última Semana
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'month' && styles.filterButtonActive]}
              onPress={() => {
                setTimeFilter('month');
                setStartDate('');
                setEndDate('');
              }}
            >
              <Text style={[styles.filterButtonText, timeFilter === 'month' && styles.filterButtonTextActive]}>
                Último Mes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filtros de fecha personalizada */}
          {showDateFilters && (
            <View style={styles.dateFiltersContainer}>
              <DatePickerInput
                label="Desde"
                value={startDate || new Date().toISOString().split('T')[0]}
                onChangeDate={(date) => {
                  setStartDate(date);
                  setTimeFilter('all');
                }}
                style={{ marginBottom: 0, flex: 1 }}
              />
              
              <DatePickerInput
                label="Hasta"
                value={endDate || new Date().toISOString().split('T')[0]}
                onChangeDate={(date) => {
                  setEndDate(date);
                  setTimeFilter('all');
                }}
                style={{ marginBottom: 0, flex: 1 }}
              />
            </View>
          )}
        </View>

        {/* Barra de selección */}
        {selectionMode && (
          <View style={styles.selectionBar}>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedIds.size} de {allTransactions.length} seleccionado(s)
              </Text>
              <TouchableOpacity onPress={selectedIds.size === allTransactions.length ? deselectAll : selectAll}>
                <Text style={styles.selectAllText}>
                  {selectedIds.size === allTransactions.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Text>
              </TouchableOpacity>
            </View>
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
                const key = `${transaction.type}::${transaction.id}`; // ✅ Usar ::
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
                            +S/{receipt.total.toFixed(2)}
                          </Text>
                        </View>
                        
                        <View style={styles.cardDetails}>
                          {receipt.rubros.primicia > 0 && <Text style={styles.detailText}>Primicia: S/{receipt.rubros.primicia.toFixed(2)}</Text>}
                          {receipt.rubros.diezmo > 0 && <Text style={styles.detailText}>Diezmo: S/{receipt.rubros.diezmo.toFixed(2)}</Text>}
                          {receipt.rubros.pobres > 0 && <Text style={styles.detailText}>Pobres: S/{receipt.rubros.pobres.toFixed(2)}</Text>}
                          {receipt.rubros.agradecimiento > 0 && <Text style={styles.detailText}>Agradecimiento: S/{receipt.rubros.agradecimiento.toFixed(2)}</Text>}
                          {receipt.rubros.escuelaSabatica > 0 && <Text style={styles.detailText}>Escuela Sabática: S/{receipt.rubros.escuelaSabatica.toFixed(2)}</Text>}
                          {receipt.rubros.jovenes > 0 && <Text style={styles.detailText}>Jóvenes: S/{receipt.rubros.jovenes.toFixed(2)}</Text>}
                          {receipt.rubros.adolescentes > 0 && <Text style={styles.detailText}>Adolescentes: S/{receipt.rubros.adolescentes.toFixed(2)}</Text>}
                          {receipt.rubros.ninos > 0 && <Text style={styles.detailText}>Niños: S/{receipt.rubros.ninos.toFixed(2)}</Text>}
                          {receipt.rubros.educacion > 0 && <Text style={styles.detailText}>Educación: S/{receipt.rubros.educacion.toFixed(2)}</Text>}
                          {receipt.rubros.salud > 0 && <Text style={styles.detailText}>Salud: S/{receipt.rubros.salud.toFixed(2)}</Text>}
                          {receipt.rubros.obraMisionera > 0 && <Text style={styles.detailText}>Obra Mis: S/{receipt.rubros.obraMisionera.toFixed(2)}</Text>}
                          {receipt.rubros.musica > 0 && <Text style={styles.detailText}>Música: S/{receipt.rubros.musica.toFixed(2)}</Text>}
                          {receipt.rubros.renuevaRadio > 0 && <Text style={styles.detailText}>Renueva TV/Rad: S/{receipt.rubros.renuevaRadio.toFixed(2)}</Text>}
                          {receipt.rubros.primerSabado > 0 && <Text style={styles.detailText}>1er Sábado: S/{receipt.rubros.primerSabado.toFixed(2)}</Text>}
                          {receipt.rubros.semanaOracion > 0 && <Text style={styles.detailText}>Semana Orac.: S/{receipt.rubros.semanaOracion.toFixed(2)}</Text>}
                          {receipt.rubros.misionExtranj > 0 && <Text style={styles.detailText}>Mis Extranjera: S/{receipt.rubros.misionExtranj.toFixed(2)}</Text>}
                          {receipt.rubros.construccion > 0 && <Text style={styles.detailText}>Construcción: S/{receipt.rubros.construccion.toFixed(2)}</Text>}
                          {receipt.rubros.cultos > 0 && <Text style={styles.detailText}>Cultos: S/{receipt.rubros.cultos.toFixed(2)}</Text>}
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
                            -S/{expense.monto.toFixed(2)}
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
  background: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  filtersContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  filterButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#F5F7FA', borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#2196F3' },
  filterButtonText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterButtonTextActive: { color: '#FFFFFF' },
  dateFiltersContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 20, paddingVertical: 12 },
  selectionInfo: { flex: 1 },
  selectionText: { fontSize: 14, fontWeight: '600', color: '#1976D2', marginBottom: 4 },
  selectAllText: { fontSize: 12, color: '#2196F3', textDecorationLine: 'underline' },
  deleteSelectedButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F44336', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  deleteSelectedText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#999' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, flexDirection: 'row' },
  cardSelected: { borderWidth: 2, borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  checkbox: { marginRight: 12, justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#999' },
  cardAmount: { fontSize: 20, fontWeight: '800' },
  cardDetails: { paddingLeft: 52, marginBottom: 12 },
  detailText: { fontSize: 13, color: '#666', marginBottom: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#FFEBEE', borderRadius: 10, marginTop: 4 },
  deleteText: { fontSize: 14, fontWeight: '600', color: '#F44336', marginLeft: 6 },
});