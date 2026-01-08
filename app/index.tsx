import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react-native';
import { useTreasury, useFilteredData } from '@/contexts/TreasuryContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading } = useTreasury();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const monthData = useFilteredData(firstDayOfMonth, lastDayOfMonth);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalIngresos = monthData.receipts.reduce((sum, r) => sum + r.total, 0);
  const totalEgresos = monthData.expenses.reduce((sum, e) => sum + e.monto, 0);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.subtitle}>Tesoreria</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <TrendingUp size={20} color="#4CAF50" />
                </View>
                <Text style={styles.summaryLabel}>Ingresos</Text>
                <Text style={styles.summaryAmount}>${totalIngresos.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
                  <TrendingDown size={20} color="#F44336" />
                </View>
                <Text style={styles.summaryLabel}>Egresos</Text>
                <Text style={styles.summaryAmount}>${totalEgresos.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Saldo Iglesia</Text>
              <Text style={[
                styles.balanceAmount,
                { color: monthData.subtotales.saldoIglesia >= 0 ? '#4CAF50' : '#F44336' }
                ///aqui arriba indica el color(ingreso neto) si los ingresos netos son + pues verde, si  - en rojo
              ]}>
                ${monthData.subtotales.saldoFinalIglesia.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => router.push('/new-receipt')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <TrendingUp size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Nuevo Ingreso</Text>
                <Text style={styles.actionDescription}>Registrar recibo de ingreso</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
              onPress={() => router.push('/new-expense')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <TrendingDown size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Nuevo Egreso</Text>
                <Text style={styles.actionDescription}>Registrar gasto o salida</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => router.push('/reports')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <FileText size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Reportes</Text>
                <Text style={styles.actionDescription}>Ver informes detallados</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#00BCD4' }]}
              onPress={() => router.push('/history')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Calendar size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Historial</Text>
                <Text style={styles.actionDescription}>Ver registros anteriores</Text>
              </View>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500' as const,
  },
  summaryCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A2E',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  balanceContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center' as const,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
