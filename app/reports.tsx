import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Download, FileText, Settings } from 'lucide-react-native';
import { useTreasury, useFilteredData } from '@/contexts/TreasuryContext';
import SaldoInicialModal from '@/components/SaldoInicialModal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateMonthlyPdfHtml, generateAnnualPdfHtml } from '@/utils/pdfTemplates';

export default function ReportsScreen() {
  const router = useRouter();
  const { setSaldoInicial, getSaldoInicialPorPeriodo, receipts, expenses } = useTreasury();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const reportData = useFilteredData(startDate, endDate);
  const periodo = startDate.substring(0, 7);
  const currentSaldo = getSaldoInicialPorPeriodo(periodo);

  const handleSaveSaldo = (saldo: number) => {
    setSaldoInicial(periodo, saldo);
    Alert.alert('Éxito', 'Saldo inicial guardado correctamente');
  };

  const handleDownloadMonthlyPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const html = generateMonthlyPdfHtml(reportData, startDate, endDate);
      
      const { uri } = await Print.printToFileAsync({ 
        html,
        width: 612,
        height: 792,
      });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `reporte_mensual_${startDate}_${endDate}.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
        } else {
          Alert.alert('Éxito', 'PDF mensual generado correctamente');
        }
      }
    } catch (error) {
      console.error('Error generando PDF mensual:', error);
      Alert.alert('Error', 'No se pudo generar el PDF mensual');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadAnnualPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      const year = parseInt(startDate.substring(0, 4));
      const monthsData = [];
      let runningBalance = currentSaldo;

      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(year, i, 1);
        const monthStart = monthDate.toISOString().split('T')[0];
        const monthEnd = new Date(year, i + 1, 0).toISOString().split('T')[0];
        
        const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const monthReceipts = receipts.filter(r => r.fecha >= monthStart && r.fecha <= monthEnd);
        const monthExpenses = expenses.filter(e => e.fecha >= monthStart && e.fecha <= monthEnd);
        
        const monthTotales = monthReceipts.reduce(
          (acc, receipt) => ({
            pobres: acc.pobres + (receipt.rubros.pobres ?? 0),
            agradecimiento: acc.agradecimiento + (receipt.rubros.agradecimiento ?? 0),
            escuelaSabatica: acc.escuelaSabatica + (receipt.rubros.escuelaSabatica ?? 0),
            jovenes: acc.jovenes + (receipt.rubros.jovenes ?? 0),
            adolescentes: acc.adolescentes + (receipt.rubros.adolescentes ?? 0),
            ninos: acc.ninos + (receipt.rubros.ninos ?? 0),
            educacion: acc.educacion + (receipt.rubros.educacion ?? 0),
            salud: acc.salud + (receipt.rubros.salud ?? 0),
            obraMisionera: acc.obraMisionera + (receipt.rubros.obraMisionera ?? 0),
            musica: acc.musica + (receipt.rubros.musica ?? 0),
            construccion: acc.construccion + (receipt.rubros.construccion ?? 0),
            cultos: acc.cultos + (receipt.rubros.cultos ?? 0),
          }),
          {
            pobres: 0,
            agradecimiento: 0,
            escuelaSabatica: 0,
            jovenes: 0,
            adolescentes: 0,
            ninos: 0,
            educacion: 0,
            salud: 0,
            obraMisionera: 0,
            musica: 0,
            construccion: 0,
            cultos: 0,
          }
        );

        const monthIglesiaTotal = 
          monthTotales.pobres * 0.45 +
          monthTotales.agradecimiento * 0.45 +
          monthTotales.escuelaSabatica * 0.45 +
          monthTotales.jovenes * 0.45 +
          monthTotales.adolescentes * 0.45 +
          monthTotales.ninos * 0.45 +
          monthTotales.educacion * 0.45 +
          monthTotales.salud * 0.45 +
          monthTotales.obraMisionera * 0.45 +
          monthTotales.musica * 0.45 +
          monthTotales.construccion * 0.9 +
          monthTotales.cultos * 0.9;

        const monthEgresos = monthExpenses.reduce((sum, e) => sum + e.monto, 0);
        
        const saldoInicialMes = i === 0 ? currentSaldo : runningBalance;
        const saldoFinalMes = saldoInicialMes + monthIglesiaTotal - monthEgresos;
        runningBalance = saldoFinalMes;

        monthsData.push({
          mes: monthName,
          saldoInicial: saldoInicialMes,
          ingresos: monthIglesiaTotal,
          egresos: monthEgresos,
          saldoFinal: saldoFinalMes,
        });
      }
      
      const html = generateAnnualPdfHtml(year, currentSaldo, monthsData);
      
      const { uri } = await Print.printToFileAsync({ 
        html,
        width: 612,
        height: 792,
      });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `reporte_anual_${year}.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
        } else {
          Alert.alert('Éxito', 'PDF anual generado correctamente');
        }
      }
    } catch (error) {
      console.error('Error generando PDF anual:', error);
      Alert.alert('Error', 'No se pudo generar el PDF anual');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Reportes</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => setShowSaldoModal(true)} 
              style={styles.iconButton}
            >
              <Settings size={22} color="#9C27B0" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Saldo Inicial Card */}
            <View style={styles.saldoCard}>
              <Text style={styles.saldoLabel}>Saldo Inicial del Período</Text>
              <Text style={styles.saldoAmount}>${currentSaldo.toFixed(2)}</Text>
              <TouchableOpacity 
                style={styles.configureSaldoButton}
                onPress={() => setShowSaldoModal(true)}
              >
                <Settings size={16} color="#9C27B0" />
                <Text style={styles.configureSaldoText}>Configurar</Text>
              </TouchableOpacity>
            </View>

            {/* Date Range Selection */}
            <View style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Calendar size={20} color="#9C27B0" />
                <Text style={styles.dateSectionTitle}>Rango de Fechas</Text>
              </View>
              
              <View style={styles.dateRow}>
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateLabel}>Desde</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateLabel}>Hasta</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* PDF Buttons */}
            <View style={styles.pdfSection}>
              <Text style={styles.sectionTitle}>Generar Reportes</Text>
              
              <TouchableOpacity 
                style={[styles.pdfButton, styles.monthlyButton]}
                onPress={handleDownloadMonthlyPdf}
                disabled={isGeneratingPdf}
              >
                <Download size={24} color="#FFFFFF" />
                <View style={styles.pdfButtonContent}>
                  <Text style={styles.pdfButtonTitle}>Reporte Mensual</Text>
                  <Text style={styles.pdfButtonSubtitle}>PDF detallado del período seleccionado</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pdfButton, styles.annualButton]}
                onPress={handleDownloadAnnualPdf}
                disabled={isGeneratingPdf}
              >
                <FileText size={24} color="#FFFFFF" />
                <View style={styles.pdfButtonContent}>
                  <Text style={styles.pdfButtonTitle}>Reporte Anual</Text>
                  <Text style={styles.pdfButtonSubtitle}>PDF con resumen del año completo</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Balance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Balance del Período (Arqueo)</Text>
              <View style={styles.balanceCard}>
                <View style={[styles.balanceRow, { backgroundColor: '#E3F2FD', padding: 16, borderRadius: 12, marginBottom: 8 }]}>
                  <Text style={[styles.balanceLabel, { color: '#1976D2', fontWeight: '700' }]}>
                    📊 Saldo Inicial (Arqueo Anterior)
                  </Text>
                  <Text style={[styles.balanceAmount, { color: '#1976D2' }]}>
                    ${reportData.saldoInicial.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.balanceRow}>
                  <Text style={[styles.balanceLabel, { color: '#4CAF50' }]}>+ Total Iglesia</Text>
                  <Text style={[styles.balanceAmount, { color: '#4CAF50' }]}>
                    +${reportData.subtotales.iglesia.total.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.balanceRow}>
                  <Text style={[styles.balanceLabel, { color: '#F44336' }]}>- Total Egresos</Text>
                  <Text style={[styles.balanceAmount, { color: '#F44336' }]}>
                    -${reportData.subtotales.totalEgresos.toFixed(2)}
                  </Text>
                </View>
                
                <View style={[
                  styles.balanceRow, 
                  styles.finalBalanceRow,
                  { 
                    backgroundColor: reportData.subtotales.saldoIglesia >= 0 ? '#E8F5E9' : '#FFEBEE',
                    padding: 16,
                    borderRadius: 12,
                    marginTop: 12
                  }
                ]}>
                  <View>
                    <Text style={styles.finalBalanceLabel}>🎯 Saldo Final</Text>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      (Nuevo Saldo Inicial)
                    </Text>
                  </View>
                  <Text style={[
                    styles.finalBalanceAmount,
                    { color: reportData.subtotales.saldoIglesia >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ${reportData.subtotales.saldoIglesia.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ El Saldo Final de este período se convertirá automáticamente en el Saldo Inicial del siguiente arqueo.
                </Text>
              </View>
            </View>

            {/* Receipts Detail */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalle de Recibos ({reportData.receipts.length})</Text>
              {reportData.receipts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hay recibos en este rango de fechas</Text>
                </View>
              ) : (
                <View style={styles.tableContainer}>
                  {reportData.receipts.map((receipt) => (
                    <View key={receipt.id} style={styles.receiptRow}>
                      <View style={styles.receiptHeader}>
                        <Text style={styles.receiptName}>{receipt.nombre}</Text>
                        <Text style={styles.receiptTotal}>${receipt.total.toFixed(2)}</Text>
                      </View>
                      <Text style={styles.receiptDate}>{receipt.fecha} • {receipt.iglesia}</Text>
                      <View style={styles.receiptRubros}>
                        {receipt.rubros.diezmo > 0 && (
                          <Text style={styles.receiptRubro}>Diezmo: ${receipt.rubros.diezmo.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.agradecimiento > 0 && (
                          <Text style={styles.receiptRubro}>Agradec.: ${receipt.rubros.agradecimiento.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.cultos > 0 && (
                          <Text style={styles.receiptRubro}>Cultos: ${receipt.rubros.cultos.toFixed(2)}</Text>
                        )}
                        {receipt.rubros.escuelaSabatica > 0 && (
                          <Text style={styles.receiptRubro}>E.S.: ${receipt.rubros.escuelaSabatica.toFixed(2)}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <SaldoInicialModal
        visible={showSaldoModal}
        onClose={() => setShowSaldoModal(false)}
        onSave={handleSaveSaldo}
        currentSaldo={currentSaldo}
        periodo={periodo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  saldoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  saldoLabel: { fontSize: 14, color: '#1976D2', fontWeight: '600', marginBottom: 8 },
  saldoAmount: { fontSize: 32, fontWeight: '800', color: '#1565C0', marginBottom: 12 },
  configureSaldoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  configureSaldoText: { fontSize: 14, fontWeight: '600', color: '#9C27B0' },
  dateSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateSectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginLeft: 8 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateInputGroup: { flex: 1 },
  dateLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  dateInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pdfSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 12,
  },
  monthlyButton: { backgroundColor: '#2196F3' },
  annualButton: { backgroundColor: '#9C27B0' },
  pdfButtonContent: { flex: 1 },
  pdfButtonTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  pdfButtonSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' },
  section: { marginBottom: 20 },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  balanceLabel: { fontSize: 16, color: '#666' },
  balanceAmount: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  finalBalanceRow: {
    borderTopWidth: 3,
    borderTopColor: '#E0E0E0',
    marginTop: 12,
    paddingTop: 16,
  },
  finalBalanceLabel: { fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
  finalBalanceAmount: { fontSize: 28, fontWeight: '900' },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoText: { fontSize: 13, color: '#E65100', lineHeight: 20 },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  receiptName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', flex: 1 },
  receiptTotal: { fontSize: 18, fontWeight: '800', color: '#2196F3' },
  receiptDate: { fontSize: 13, color: '#999', marginBottom: 8 },
  receiptRubros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  receiptRubro: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
});