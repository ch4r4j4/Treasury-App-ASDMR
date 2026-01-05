import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Download } from 'lucide-react-native';
import { useFilteredData } from '@/contexts/TreasuryContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
  const router = useRouter();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  
  const reportData = useFilteredData(startDate, endDate);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePdfHtml = () => {
    const receiptsTableRows = reportData.receipts.map(receipt => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${receipt.fecha}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${receipt.nombre}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${receipt.iglesia}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${receipt.rubros.diezmo.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${receipt.rubros.agradecimiento.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${receipt.rubros.cultos.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${receipt.rubros.escuelaSabatica.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${receipt.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #1A1A2E;
            margin-bottom: 10px;
          }
          .date-range {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }
          th {
            background-color: #9C27B0;
            color: white;
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #7B1FA2;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .summary-section {
            margin-top: 40px;
            page-break-before: avoid;
          }
          .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1A1A2E;
          }
          .summary-table {
            margin-bottom: 25px;
          }
          .summary-table th {
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
          }
          .total-row {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          .highlight-blue {
            background-color: #E3F2FD !important;
          }
          .highlight-purple {
            background-color: #F3E5F5 !important;
          }
          .highlight-orange {
            background-color: #FFF3E0 !important;
          }
          .final-balance {
            font-size: 16px;
            font-weight: bold;
            padding: 15px;
            border: 2px solid #4CAF50;
            background-color: #f1f8f4;
            text-align: center;
            margin-top: 20px;
          }
          .balance-negative {
            border-color: #F44336;
            background-color: #fff5f5;
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Tesorería</h1>
        <div class="date-range">Período: ${startDate} a ${endDate}</div>

        <h2>Detalle de Recibos</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Iglesia</th>
              <th style="text-align: right;">Diezmo</th>
              <th style="text-align: right;">Agradecimiento</th>
              <th style="text-align: right;">Cultos</th>
              <th style="text-align: right;">Escuela Sabática</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${receiptsTableRows || '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay recibos en este período</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-weight: bold;">TOTALES:</td>
              <td style="text-align: right; font-weight: bold;">${reportData.totales.diezmo.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${reportData.totales.agradecimiento.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${reportData.totales.cultos.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${reportData.totales.escuelaSabatica.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${(reportData.totales.diezmo + reportData.totales.agradecimiento + reportData.totales.cultos + reportData.totales.escuelaSabatica).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-title">Desglose de Cálculos</div>
          
          <table class="summary-table">
            <thead>
              <tr>
                <th colspan="2" class="highlight-blue">SUBTOTAL ASOCIACIÓN</th>
              </tr>
            </thead>
            <tbody class="highlight-blue">
              <tr>
                <td>Diezmo (100%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.diezmo.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Agradecimiento (50%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.agradecimiento.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Escuela Sabática (50%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.escuelaSabatica.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL ASOCIACIÓN</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table class="summary-table">
            <thead>
              <tr>
                <th colspan="2" class="highlight-purple">SUBTOTAL IGLESIA</th>
              </tr>
            </thead>
            <tbody class="highlight-purple">
              <tr>
                <td>Agradecimiento (45%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.agradecimiento.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Escuela Sabática (45%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.escuelaSabatica.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Cultos (90%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.cultos.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL IGLESIA</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table class="summary-table">
            <thead>
              <tr>
                <th colspan="2" class="highlight-orange">SUBTOTAL OTROS (5-10%)</th>
              </tr>
            </thead>
            <tbody class="highlight-orange">
              <tr>
                <td>Agradecimiento (5%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.agradecimiento.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Escuela Sabática (5%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.escuelaSabatica.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Cultos (10%)</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.cultos.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL OTROS</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table class="summary-table">
            <thead>
              <tr>
                <th colspan="2">BALANCE FINAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Iglesia</td>
                <td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #F44336;">Total Egresos</td>
                <td style="text-align: right; font-weight: bold; color: #F44336;">-${reportData.subtotales.totalEgresos.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>SALDO FINAL</td>
                <td style="text-align: right; font-weight: bold; color: ${reportData.subtotales.saldoIglesia >= 0 ? '#4CAF50' : '#F44336'};">${reportData.subtotales.saldoIglesia.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const html = generatePdfHtml();
      
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generado:', uri);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `reporte_${startDate}_${endDate}.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
          });
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

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Reportes</Text>
          <TouchableOpacity 
            onPress={handleDownloadPdf} 
            style={styles.downloadButton}
            disabled={isGeneratingPdf}
          >
            <Download size={24} color={isGeneratingPdf ? '#999' : '#9C27B0'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Totales por Rubro</Text>

              <View style={styles.rubroCard}>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Primicia</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.primicia.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Diezmo</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.diezmo.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Pobres</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.pobres.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Agradecimiento</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.agradecimiento.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Cultos</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.cultos.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Escuela Sabática</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.escuelaSabatica.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Jóvenes</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.jovenes.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Adolescentes</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.adolescentes.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Niños</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.ninos.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Educación</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.educacion.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Salud</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.salud.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Obra Misionera</Text>
                  <Text style={styles.rubroAmount}> ${reportData.totales.obraMisionera.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Música</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.musica.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Renueva Radio</Text>
                  <Text style={styles.rubroAmount}> ${reportData.totales.renuevaRadio.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Primer Sábado</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.primerSabado.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Semana de Oración</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.semanaOracion.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Misión Extranjera</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.misionExtranj.toFixed(2)}</Text>
                </View>
                <View style={styles.rubroRow}>
                  <Text style={styles.rubroLabel}>Construcción</Text>
                  <Text style={styles.rubroAmount}>${reportData.totales.construccion.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subtotal Asociación</Text>
              <View style={[styles.subtotalCard, { backgroundColor: '#E3F2FD' }]}>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Primicia (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.primicia.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Diezmo (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.diezmo.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Pobres (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.pobres.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Agradecimiento (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.agradecimiento.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Escuela Sabática (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.escuelaSabatica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Jovenes (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.jovenes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Adolescentes (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.adolescentes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Niños (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.ninos.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Educacion (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.educacion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Salud (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.salud.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Obra Misionera (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.obraMisionera.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Musica (50%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.musica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Renueva Radio (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.renuevaRadio.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Primer Sabado (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.primerSabado.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Semana de Oracion (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.semanaOracion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Mision Extranjera (100%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.asociacion.misionExtranj.toFixed(2)}</Text>
                </View>
                <View style={[styles.subtotalRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Asociación</Text>
                  <Text style={styles.totalAmount}>${reportData.subtotales.asociacion.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subtotal Iglesia</Text>
              <View style={[styles.subtotalCard, { backgroundColor: '#F3E5F5' }]}>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Pobres (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.pobres.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Agradecimiento (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.agradecimiento.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Escuela Sabática (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.escuelaSabatica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Jovenes (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.jovenes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Adolescentes (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.adolescentes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Niños (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.ninos.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Educacion (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.educacion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Salud (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.salud.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Obra Misionera (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.obraMisionera.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Musica (45%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.musica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Construccion (90%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.construccion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Cultos (90%)</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.iglesia.cultos.toFixed(2)}</Text>
                </View>
                <View style={[styles.subtotalRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Iglesia</Text>
                  <Text style={styles.totalAmount}>${reportData.subtotales.iglesia.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diezmo de iglesia</Text>
              <View style={[styles.subtotalCard, { backgroundColor: '#FFF3E0' }]}>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Pobres </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.pobres.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Agradecimiento </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.agradecimiento.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Escuela Sabática</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.escuelaSabatica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Jovenes </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.jovenes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Adolescentes</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.adolescentes.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Niños</Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.ninos.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Educacion </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.educacion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Salud </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.salud.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Obra Misionera </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.obraMisionera.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Musica </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.musica.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Construccion </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.construccion.toFixed(2)}</Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Cultos </Text>
                  <Text style={styles.subtotalAmount}>${reportData.subtotales.otros.cultos.toFixed(2)}</Text>
                </View>
                <View style={[styles.subtotalRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Iglesia</Text>
                  <Text style={styles.totalAmount}>${reportData.subtotales.otros.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Balance Final</Text>
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Total Iglesia</Text>
                  <Text style={styles.balanceAmount}>${reportData.subtotales.iglesia.total.toFixed(2)}</Text>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={[styles.balanceLabel, { color: '#F44336' }]}>Total Egresos</Text>
                  <Text style={[styles.balanceAmount, { color: '#F44336' }]}>-${reportData.subtotales.totalEgresos.toFixed(2)}</Text>
                </View>
                <View style={[styles.balanceRow, styles.finalBalanceRow]}>
                  <Text style={styles.finalBalanceLabel}>Saldo Final</Text>
                  <Text style={[
                    styles.finalBalanceAmount,
                    { color: reportData.subtotales.saldoIglesia >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ${reportData.subtotales.saldoIglesia.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

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
  downloadButton: {
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
  dateHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 12,
  },
  rubroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rubroRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rubroLabel: {
    fontSize: 16,
    color: '#666',
  },
  rubroAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  subtotalCard: {
    borderRadius: 16,
    padding: 20,
  },
  subtotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },
  subtotalLabel: {
    fontSize: 15,
    color: '#666',
  },
  subtotalAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A2E',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1A1A2E',
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
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
    fontWeight: '800' as const,
    color: '#1A1A2E',
  },
  finalBalanceAmount: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
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
  receiptRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  receiptHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  receiptName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    flex: 1,
  },
  receiptTotal: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#2196F3',
  },
  receiptDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  receiptRubros: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  receiptRubro: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
});
