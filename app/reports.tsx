import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings, FileText, Download, Trash2 } from 'lucide-react-native';
import { useTreasury, useFilteredData } from '@/contexts/TreasuryContext';
import SaldoInicialModal from '@/components/SaldoInicialModal';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateMonthlyPdfHtml, generateAnnualPdfHtml } from '@/utils/pdfTemplates';
import DatePickerInput from '@/components/DatePickerInput';

export default function ReportsScreen() {
  const router = useRouter();
  const { 
    setSaldoInicial,
    getSaldoInicialPorPeriodo, 
    receipts, 
    expenses, 
    guardarArqueo, 
    getArqueosOrdenados, 
    deleteArqueo,
    churchConfig, 
    setChurchName,
    getUltimoArqueo,
  } = useTreasury();
  
  const { showAd, isLoaded: isAdLoaded } = useInterstitialAd();
  
  // Fechas inteligentes
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getSmartDates = () => {
    const ultimoArqueo = getUltimoArqueo();
    
    if (ultimoArqueo) {
      const arqueoEndDate = new Date(ultimoArqueo.endDate);
      arqueoEndDate.setDate(arqueoEndDate.getDate() + 1);
      const smartStartDate = arqueoEndDate.toISOString().split('T')[0];
      return { start: smartStartDate, end: todayStr };
    } else {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      return { start: firstDayOfMonth, end: todayStr };
    }
  };

  const smartDates = getSmartDates();
  const [startDate, setStartDate] = useState(smartDates.start);
  const [endDate, setEndDate] = useState(smartDates.end);
  const [saldoInicialManual, setSaldoInicialManual] = useState('');
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const arqueosGuardados = getArqueosOrdenados();

  const handleSaveSaldo = (saldo: number) => {
    const periodo = startDate.substring(0, 7);
    setSaldoInicial(periodo, saldo);
    Alert.alert('Éxito', 'Saldo inicial guardado correctamente');
  };

  const handleCalcularArqueo = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Por favor selecciona las fechas');
      return;
    }

    const saldoInicial = parseFloat(saldoInicialManual);
    if (isNaN(saldoInicial) || saldoInicial < 0) {
      Alert.alert('Error', 'Por favor ingresa un saldo inicial válido');
      return;
    }

    try {
      // Guardar saldo inicial para el período
      const periodo = startDate.substring(0, 7);
      await setSaldoInicial(periodo, saldoInicial);

      // Obtener datos del período
      const reportData = useFilteredData(startDate, endDate);

      // Guardar arqueo
      const descripcion = `Arqueo ${new Date(startDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      const arqueo = await guardarArqueo(startDate, endDate, reportData, descripcion);
      
      Alert.alert(
        '✅ Arqueo Guardado',
        `Período: ${startDate} al ${endDate}\n` +
        `Saldo Final: S/${arqueo.saldoFinal.toFixed(2)}`,
        [{ text: 'Entendido' }]
      );

      // Resetear formulario con nuevas fechas inteligentes
      const newSmartDates = getSmartDates();
      setStartDate(newSmartDates.start);
      setEndDate(newSmartDates.end);
      setSaldoInicialManual('');
    } catch (error) {
      console.error('Error guardando arqueo:', error);
      Alert.alert('Error', 'No se pudo guardar el arqueo');
    }
  };

  const handleGeneratePdfForArqueo = async (arqueo: any) => {
    try {
      setIsGeneratingPdf(true);
      
      // Mostrar anuncio intersticial
      if (isAdLoaded) {
        await showAd();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Obtener datos del período específico del arqueo
      const arqueoReceipts = receipts.filter(r => r.fecha >= arqueo.startDate && r.fecha <= arqueo.endDate);
      const arqueoExpenses = expenses.filter(e => e.fecha >= arqueo.startDate && e.fecha <= arqueo.endDate);

      // Reconstruir reportData para este arqueo
      const arqueoReportData = {
        receipts: arqueoReceipts,
        expenses: arqueoExpenses,
        totales: arqueo.totales || {},
        saldoInicial: arqueo.saldoInicial,
        totalAsociacionYOtros: arqueo.totalAsociacionYOtros || 0,
        subtotales: arqueo.subtotales || { // ✅ Usar guardado
          iglesia: { total: arqueo.totalIngresos },
          totalEgresos: arqueo.totalEgresos,
          saldoFinalIglesia: arqueo.saldoFinal,
        },
      };

      const html = generateMonthlyPdfHtml(
        arqueoReportData,
        arqueo.startDate,
        arqueo.endDate,
        churchConfig.nombre || 'Iglesia'
      );
      
      const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `arqueo_${arqueo.startDate}_${arqueo.endDate}.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } else {
          Alert.alert('Éxito', 'PDF generado correctamente');
        }
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateAnnualPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      if (isAdLoaded) {
        await showAd();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const year = parseInt(startDate.substring(0, 4));
      const periodo = startDate.substring(0, 7);
      const currentSaldo = getSaldoInicialPorPeriodo(periodo);
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
          { pobres: 0, agradecimiento: 0, escuelaSabatica: 0, jovenes: 0, adolescentes: 0, ninos: 0, educacion: 0, salud: 0, obraMisionera: 0, musica: 0, construccion: 0, cultos: 0 }
        );

        const monthIglesiaTotal = 
          monthTotales.pobres * 0.45 + monthTotales.agradecimiento * 0.45 +
          monthTotales.escuelaSabatica * 0.45 + monthTotales.jovenes * 0.45 +
          monthTotales.adolescentes * 0.45 + monthTotales.ninos * 0.45 +
          monthTotales.educacion * 0.45 + monthTotales.salud * 0.45 +
          monthTotales.obraMisionera * 0.45 + monthTotales.musica * 0.45 +
          monthTotales.construccion * 0.9 + monthTotales.cultos * 0.9;

        const monthEgresos = monthExpenses.reduce((sum, e) => sum + e.monto, 0);
        const saldoInicialMes = i === 0 ? currentSaldo : runningBalance;
        const saldoFinalMes = saldoInicialMes + monthIglesiaTotal - monthEgresos;
        runningBalance = saldoFinalMes;

        monthsData.push({ mes: monthName, saldoInicial: saldoInicialMes, ingresos: monthIglesiaTotal, egresos: monthEgresos, saldoFinal: saldoFinalMes });
      }
      
      const html = generateAnnualPdfHtml(year, currentSaldo, monthsData);
      const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `reporte_anual_${year}.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
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

  const handleDeleteArqueo = (id: string, descripcion: string) => {
    Alert.alert(
      'Eliminar Arqueo',
      `¿Estás seguro de eliminar "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteArqueo(id);
            Alert.alert('Éxito', 'Arqueo eliminado correctamente');
            const newSmartDates = getSmartDates();
            setStartDate(newSmartDates.start);
            setEndDate(newSmartDates.end);
          },
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
          <Text style={styles.title}>Reportes</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleGenerateAnnualPdf} style={styles.iconButton}>
              <FileText size={22} color="#9C27B0" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSaldoModal(true)} style={styles.iconButton}>
              <Settings size={22} color="#9C27B0" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Formulario: Generar Nuevo Arqueo */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>📊 Generar Nuevo Arqueo</Text>
              
              <DatePickerInput
                label="Fecha Desde"
                value={startDate}
                onChangeDate={setStartDate}
                style={{ marginBottom: 0 }}
              />
              
              <DatePickerInput
                label="Fecha Hasta"
                value={endDate}
                onChangeDate={setEndDate}
                style={{ marginBottom: 0 }}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Saldo Inicial</Text>
                <TextInput
                  style={styles.input}
                  value={saldoInicialManual}
                  onChangeText={setSaldoInicialManual}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity style={styles.calculateButton} onPress={handleCalcularArqueo}>
                <Text style={styles.calculateButtonText}>Calcular Arqueo</Text>
              </TouchableOpacity>
            </View>

            {/* Historial de Arqueos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Historial de Arqueos ({arqueosGuardados.length})</Text>
              
              {arqueosGuardados.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hay arqueos guardados todavía</Text>
                  <Text style={styles.emptySubtext}>Calcula tu primer arqueo usando el formulario de arriba</Text>
                </View>
              ) : (
                <View style={styles.arqueosContainer}>
                  {arqueosGuardados.map((arqueo) => (
                    <View key={arqueo.id} style={styles.arqueoCard}>
                      <View style={styles.arqueoHeader}>
                        <View style={styles.arqueoTitleContainer}>
                          <Text style={styles.arqueoTitle}>{arqueo.descripcion || 'Arqueo'}</Text>
                          <Text style={styles.arqueoPeriodo}>{arqueo.startDate} al {arqueo.endDate}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.arqueoStats}>
                        <View style={styles.arqueoStatItem}>
                          <Text style={styles.arqueoStatLabel}>Saldo Inicial</Text>
                          <Text style={styles.arqueoStatValue}>S/{arqueo.saldoInicial.toFixed(2)}</Text>
                        </View>
                        
                        <View style={styles.arqueoStatItem}>
                          <Text style={[styles.arqueoStatLabel, { color: '#9C27B0' }]}>Asociación</Text>
                          <Text style={[styles.arqueoStatValue, { color: '#9C27B0' }]}>
                            S/{(arqueo.totalAsociacionYOtros || 0).toFixed(2)}
                          </Text>
                        </View>

                        <View style={styles.arqueoStatItem}>
                          <Text style={[styles.arqueoStatLabel, { color: '#4CAF50' }]}>Ingresos</Text>
                          <Text style={[styles.arqueoStatValue, { color: '#4CAF50' }]}>+S/{arqueo.totalIngresos.toFixed(2)}</Text>
                        </View>
                        
                        <View style={styles.arqueoStatItem}>
                          <Text style={[styles.arqueoStatLabel, { color: '#F44336' }]}>Egresos</Text>
                          <Text style={[styles.arqueoStatValue, { color: '#F44336' }]}>-S/{arqueo.totalEgresos.toFixed(2)}</Text>
                        </View>
                      </View>

                      <View style={[styles.arqueoFinal, { backgroundColor: arqueo.saldoFinal >= 0 ? '#E8F5E9' : '#FFEBEE' }]}>
                        <Text style={styles.arqueoFinalLabel}>Saldo Final</Text>
                        <Text style={[styles.arqueoFinalValue, { color: arqueo.saldoFinal >= 0 ? '#4CAF50' : '#F44336' }]}>
                          S/{arqueo.saldoFinal.toFixed(2)}
                        </Text>
                      </View>

                      {/* Acciones */}
                      <View style={styles.arqueoActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleGeneratePdfForArqueo(arqueo)}
                          disabled={isGeneratingPdf}
                        >
                          <Download size={18} color="#2196F3" />
                          <Text style={styles.actionButtonText}>PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDeleteArqueo(arqueo.id, arqueo.descripcion || 'Arqueo')}
                        >
                          <Trash2 size={18} color="#F44336" />
                          <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Eliminar</Text>
                        </TouchableOpacity>
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
        onSaveChurchName={setChurchName}
        currentSaldo={0}
        currentChurchName={churchConfig.nombre}
        periodo=""
      />
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
  formSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F5F7FA', borderRadius: 12, padding: 16, fontSize: 16, color: '#1A1A2E', borderWidth: 1, borderColor: '#E0E0E0' },
  calculateButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  calculateButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999', fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#CCC', textAlign: 'center' },
  arqueosContainer: { gap: 12 },
  arqueoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#9C27B0' },
  arqueoHeader: { marginBottom: 12 },
  arqueoTitleContainer: { flex: 1 },
  arqueoTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  arqueoPeriodo: { fontSize: 13, color: '#666' },
  arqueoStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  arqueoStatItem: { flex: 1, minWidth: '45%', backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8 },
  arqueoStatLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  arqueoStatValue: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  arqueoFinal: { padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  arqueoFinalLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  arqueoFinalValue: { fontSize: 20, fontWeight: '800' },
  arqueoActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: '#F5F7FA', borderRadius: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#2196F3' },
});