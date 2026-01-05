import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Trash2 } from 'lucide-react-native';
import { useTreasury } from '@/contexts/TreasuryContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { receipts, expenses, deleteReceipt, deleteExpense } = useTreasury();

  const allTransactions = [
    ...receipts.map(r => ({ ...r, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Historial</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {allTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Sin Registros</Text>
                <Text style={styles.emptyText}>No hay transacciones registradas</Text>
              </View>
            ) : (
              allTransactions.map((transaction) => {
                if (transaction.type === 'income') {
                  const receipt = transaction;
                  return (
                    <View key={`income-${receipt.id}`} style={styles.card}>
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
                        {receipt.rubros.pobres > 0 && (
                          <Text style={styles.detailText}>Pobres: ${receipt.rubros.pobres.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.agradecimiento > 0 && (
                          <Text style={styles.detailText}>Agradecimiento: ${receipt.rubros.agradecimiento.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.cultos > 0 && (
                          <Text style={styles.detailText}>Cultos: ${receipt.rubros.cultos.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.escuelaSabatica > 0 && (
                          <Text style={styles.detailText}>Escuela Sabática: ${receipt.rubros.escuelaSabatica.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.jovenes > 0 && (
                          <Text style={styles.detailText}>Jóvenes: ${receipt.rubros.jovenes.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.adolescentes > 0 && (
                          <Text style={styles.detailText}>Adolescentes: ${receipt.rubros.adolescentes.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.ninos > 0 && (
                          <Text style={styles.detailText}> Niños: ${receipt.rubros.ninos.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.educacion > 0 && (
                          <Text style={styles.detailText}>Educación: ${receipt.rubros.educacion.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.salud > 0 && (
                          <Text style={styles.detailText}>Salud: ${receipt.rubros.salud.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.obraMisionera > 0 && (
                          <Text style={styles.detailText}>Obra Misionera: ${receipt.rubros.obraMisionera.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.musica > 0 && (
                          <Text style={styles.detailText}>Música: ${receipt.rubros.musica.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.renuevaRadio > 0 && (
                          <Text style={styles.detailText}> Renueva Radio: ${receipt.rubros.renuevaRadio.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.primerSabado > 0 && (
                          <Text style={styles.detailText}>Primer Sábado: ${receipt.rubros.primerSabado.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.semanaOracion > 0 && (
                          <Text style={styles.detailText}>Semana de Oración: ${receipt.rubros.semanaOracion.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.misionExtranj > 0 && (
                          <Text style={styles.detailText}>Misión Extranjera: ${receipt.rubros.misionExtranj.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.construccion > 0 && (
                          <Text style={styles.detailText}>Construcción: ${receipt.rubros.construccion.toFixed(2)}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReceipt(receipt.id, receipt.nombre)}
                      >
                        <Trash2 size={18} color="#F44336" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  const expense = transaction;
                  return (
                    <View key={`expense-${expense.id}`} style={styles.card}>
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
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteExpense(expense.id, expense.descripcion)}
                      >
                        <Trash2 size={18} color="#F44336" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
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
});
