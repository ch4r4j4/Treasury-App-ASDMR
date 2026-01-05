import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Download, FileText, Settings } from 'lucide-react-native';
import { useTreasury, useFilteredData } from '@/contexts/TreasuryContext';
import SaldoInicialModal from '@/components/SaldoInicialModal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
  const router = useRouter();
  const { setSaldoInicial, getSaldoInicialPorPeriodo } = useTreasury();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [showSaldoModal, setShowSaldoModal] = useState(false);
  
  const reportData = useFilteredData(startDate, endDate);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const periodo = startDate.substring(0, 7);
  const currentSaldo = getSaldoInicialPorPeriodo(periodo);

  const handleSaveSaldo = (saldo: number) => {
    setSaldoInicial(periodo, saldo);
    Alert.alert('Éxito', 'Saldo inicial guardado correctamente');
  };

  const generateAnnualPdfHtml = (year: number, initialBalance: number, monthsData: Array<{
    mes: string;
    saldoInicial: number;
    ingresos: number;
    egresos: number;
    saldoFinal: number;
  }>) => {
    const monthlyData = monthsData;

    const monthlyRows = monthlyData.map((month, index) => `
      <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
        <td style="border: 1px solid #ddd; padding: 12px; font-weight: 600;">${month.mes}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${month.saldoInicial.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #4CAF50; font-weight: 600;">$${month.ingresos.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #F44336; font-weight: 600;">$${month.egresos.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold; ${month.saldoFinal >= 0 ? 'color: #4CAF50;' : 'color: #F44336;'}">$${month.saldoFinal.toFixed(2)}</td>
      </tr>
    `).join('');

    const totalIngresos = monthlyData.reduce((sum, m) => sum + m.ingresos, 0);
    const totalEgresos = monthlyData.reduce((sum, m) => sum + m.egresos, 0);
    const saldoFinalAnual = monthlyData[monthlyData.length - 1].saldoFinal;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px 30px;
            background: #ffffff;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #9C27B0;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 32px;
            color: #1A1A2E;
            margin-bottom: 8px;
          }
          .header .subtitle {
            font-size: 18px;
            color: #666;
            font-weight: 500;
          }
          .header .year {
            font-size: 24px;
            color: #9C27B0;
            font-weight: 700;
            margin-top: 10px;
          }
          .info-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .info-box h2 {
            font-size: 20px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .info-item {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 10px;
          }
          .info-label {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 22px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
          }
          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          th {
            padding: 18px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          th:not(:first-child) {
            text-align: right;
          }
          td {
            padding: 14px 12px;
            border: 1px solid #e0e0e0;
            font-size: 15px;
          }
          .totals-row {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
          .totals-row td {
            border-color: #d81b60;
            padding: 18px 12px;
          }
          .summary-section {
            margin-top: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            border-left: 5px solid #9C27B0;
          }
          .summary-title {
            font-size: 22px;
            font-weight: bold;
            color: #1A1A2E;
            margin-bottom: 20px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .summary-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            text-align: center;
          }
          .summary-card-title {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .summary-card-value {
            font-size: 28px;
            font-weight: bold;
            color: #1A1A2E;
          }
          .summary-card.positive .summary-card-value {
            color: #4CAF50;
          }
          .summary-card.negative .summary-card-value {
            color: #F44336;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            font-size: 12px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
          }
          .receipt-style {
            border: 2px dashed #9C27B0;
            padding: 20px;
            margin: 30px 0;
            background: #fafafa;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Reporte Anual de Tesorería</h1>
          <div class="subtitle">IASDMR - Iglesia Adventista</div>
          <div class="year">${year}</div>
        </div>

                  <div class="info-box">
          <h2>💰 Resumen Ejecutivo</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Saldo Inicial</div>
              <div class="info-value">${initialBalance.toFixed(2)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Ingresos</div>
              <div class="info-value">$${totalIngresos.toFixed(2)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Egresos</div>
              <div class="info-value">$${totalEgresos.toFixed(2)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Saldo Final</div>
              <div class="info-value">$${saldoFinalAnual.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="receipt-style">
          <h2 style="text-align: center; margin-bottom: 20px; color: #9C27B0;">📋 Movimientos Mensuales</h2>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Saldo Inicial</th>
                <th>Ingresos</th>
                <th>Egresos</th>
                <th>Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyRows}
              <tr class="totals-row">
                <td>TOTAL ANUAL</td>
                <td style="text-align: right;">${initialBalance.toFixed(2)}</td>
                <td style="text-align: right;">${totalIngresos.toFixed(2)}</td>
                <td style="text-align: right;">${totalEgresos.toFixed(2)}</td>
                <td style="text-align: right;">${saldoFinalAnual.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-section">
          <div class="summary-title">📈 Indicadores Financieros</div>
          <div class="summary-grid">
            <div class="summary-card positive">
              <div class="summary-card-title">Promedio Mensual Ingresos</div>
              <div class="summary-card-value">$${(totalIngresos / 12).toFixed(2)}</div>
            </div>
            <div class="summary-card negative">
              <div class="summary-card-title">Promedio Mensual Egresos</div>
              <div class="summary-card-value">$${(totalEgresos / 12).toFixed(2)}</div>
            </div>
                          <div class="summary-card ${saldoFinalAnual >= 0 ? 'positive' : 'negative'}">
              <div class="summary-card-title">Balance Neto</div>
              <div class="summary-card-value">${saldoFinalAnual >= 0 ? '+' : ''}${(saldoFinalAnual - initialBalance).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p>Sistema de Tesorería IASDMR</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadAnnualPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Calcular datos de todos los meses ANTES de generar el HTML
      const year = parseInt(startDate.substring(0, 4));
      const monthsData = [];
      let runningBalance = currentSaldo;

      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(year, i, 1);
        const monthStart = monthDate.toISOString().split('T')[0];
        const monthEnd = new Date(year, i + 1, 0).toISOString().split('T')[0];
        
        const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        // Calcular manualmente los datos del mes
        const monthReceipts = reportData.receipts.filter(r => r.fecha >= monthStart && r.fecha <= monthEnd);
        const monthExpenses = reportData.expenses.filter(e => e.fecha >= monthStart && e.fecha <= monthEnd);
        
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
            {/* Saldo Inicial Info */}
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

            {/* Botones de PDF */}
            <View style={styles.pdfSection}>
              <Text style={styles.sectionTitle}>Generar Reportes</Text>
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

            {/* Balance con Saldo Inicial MEJORADO */}
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

            {/* Resto del contenido existente... */}
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
  background: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  saldoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  saldoLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    marginBottom: 8,
  },
  saldoAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1565C0',
    marginBottom: 12,
  },
  configureSaldoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  configureSaldoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  pdfSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  annualButton: {
    backgroundColor: '#9C27B0',
  },
  pdfButtonContent: {
    flex: 1,
  },
  pdfButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pdfButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 20,
  },
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
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  finalBalanceRow: {
    borderTopWidth: 3,
    borderTopColor: '#E0E0E0',
    marginTop: 12,
    paddingTop: 16,
  },
  finalBalanceLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  finalBalanceAmount: {
    fontSize: 28,
    fontWeight: '900',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 20,
  },
});