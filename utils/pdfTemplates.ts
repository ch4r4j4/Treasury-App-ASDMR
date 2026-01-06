import { ReportData } from '@/types/treasury';

// ============================================
// PLANTILLA HTML - REPORTE MENSUAL
// ============================================
export const generateMonthlyPdfHtml = (
  reportData: ReportData & { saldoInicial: number },
  startDate: string,
  endDate: string
): string => {
  const receiptsTableRows = reportData.receipts.map((receipt, index) => `
    <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 30px; background: #ffffff; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2196F3; padding-bottom: 20px; }
        .header h1 { font-size: 32px; color: #1A1A2E; margin-bottom: 8px; }
        .header .subtitle { font-size: 18px; color: #666; font-weight: 500; }
        .header .period { font-size: 16px; color: #2196F3; font-weight: 700; margin-top: 10px; }
        
        .info-box { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .info-box h2 { font-size: 20px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .info-item { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; }
        .info-label { font-size: 13px; opacity: 0.9; margin-bottom: 5px; }
        .info-value { font-size: 22px; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; }
        thead { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; }
        th { padding: 18px 12px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:not(:first-child):not(:nth-child(2)):not(:nth-child(3)) { text-align: right; }
        td { padding: 14px 12px; border: 1px solid #e0e0e0; font-size: 15px; }
        
        .totals-row { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); color: white; font-weight: bold; font-size: 16px; }
        .totals-row td { border-color: #d81b60; padding: 18px 12px; }
        
        .summary-section { margin-top: 40px; }
        .summary-title { font-size: 22px; font-weight: bold; color: #1A1A2E; margin-bottom: 20px; text-align: center; }
        
        .summary-table { width: 100%; margin-bottom: 25px; border-collapse: collapse; }
        .summary-table thead { background: #f5f5f5; }
        .summary-table th { background-color: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 600; }
        .summary-table td { border: 1px solid #ddd; padding: 12px; }
        .summary-table .total-row { background-color: #f0f0f0; font-weight: bold; }
        
        .highlight-blue { background-color: #E3F2FD !important; }
        .highlight-purple { background-color: #F3E5F5 !important; }
        .highlight-orange { background-color: #FFF3E0 !important; }
        
        .final-balance-section { margin-top: 30px; padding: 25px; background: #f8f9fa; border-radius: 15px; border-left: 5px solid #2196F3; }
        .final-balance-title { font-size: 20px; font-weight: bold; color: #1A1A2E; margin-bottom: 15px; }
        .balance-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
        .balance-row.final { border-top: 3px solid #2196F3; border-bottom: none; padding-top: 20px; margin-top: 15px; font-size: 18px; font-weight: bold; }
        
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte Mensual de Tesorería</h1>
        <div class="subtitle">IASDMR - Iglesia Adventista</div>
        <div class="period">Período: ${startDate} al ${endDate}</div>
      </div>

      <div class="info-box">
        <h2>💰 Resumen del Período</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Saldo Inicial</div>
            <div class="info-value">$${reportData.saldoInicial.toFixed(2)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Recibos</div>
            <div class="info-value">${reportData.receipts.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Iglesia</div>
            <div class="info-value">$${reportData.subtotales.iglesia.total.toFixed(2)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Saldo Final</div>
            <div class="info-value">$${reportData.subtotales.saldoIglesia.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <h2 style="text-align: center; margin: 30px 0 20px; color: #1A1A2E;">📋 Detalle de Recibos</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Iglesia</th>
            <th>Diezmo</th>
            <th>Agradecimiento</th>
            <th>Cultos</th>
            <th>Escuela Sabática</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${receiptsTableRows || '<tr><td colspan="8" style="text-align: center; padding: 20px;">No hay recibos en este período</td></tr>'}
          <tr class="totals-row">
            <td colspan="3" style="text-align: right; font-weight: bold;">TOTALES:</td>
            <td style="text-align: right;">${reportData.totales.diezmo.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.agradecimiento.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.cultos.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.escuelaSabatica.toFixed(2)}</td>
            <td style="text-align: right;">${(reportData.totales.diezmo + reportData.totales.agradecimiento + reportData.totales.cultos + reportData.totales.escuelaSabatica).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-title">📈 Desglose de Cálculos</div>
        
        <table class="summary-table">
          <thead>
            <tr>
              <th colspan="2" class="highlight-blue">SUBTOTAL ASOCIACIÓN</th>
            </tr>
          </thead>
          <tbody class="highlight-blue">
            <tr><td>Diezmo (100%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.diezmo.toFixed(2)}</td></tr>
            <tr><td>Agradecimiento (50%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.agradecimiento.toFixed(2)}</td></tr>
            <tr><td>Escuela Sabática (50%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.asociacion.escuelaSabatica.toFixed(2)}</td></tr>
            <tr class="total-row"><td>TOTAL ASOCIACIÓN</td><td style="text-align: right;">${reportData.subtotales.asociacion.total.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table class="summary-table">
          <thead>
            <tr>
              <th colspan="2" class="highlight-purple">SUBTOTAL IGLESIA</th>
            </tr>
          </thead>
          <tbody class="highlight-purple">
            <tr><td>Agradecimiento (45%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.agradecimiento.toFixed(2)}</td></tr>
            <tr><td>Escuela Sabática (45%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.escuelaSabatica.toFixed(2)}</td></tr>
            <tr><td>Cultos (90%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.iglesia.cultos.toFixed(2)}</td></tr>
            <tr class="total-row"><td>TOTAL IGLESIA</td><td style="text-align: right;">${reportData.subtotales.iglesia.total.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <table class="summary-table">
          <thead>
            <tr>
              <th colspan="2" class="highlight-orange">SUBTOTAL OTROS (5-10%)</th>
            </tr>
          </thead>
          <tbody class="highlight-orange">
            <tr><td>Agradecimiento (5%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.agradecimiento.toFixed(2)}</td></tr>
            <tr><td>Escuela Sabática (5%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.escuelaSabatica.toFixed(2)}</td></tr>
            <tr><td>Cultos (10%)</td><td style="text-align: right; font-weight: bold;">${reportData.subtotales.otros.cultos.toFixed(2)}</td></tr>
            <tr class="total-row"><td>TOTAL OTROS</td><td style="text-align: right;">${reportData.subtotales.otros.total.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="final-balance-section">
        <div class="final-balance-title">🎯 Balance Final (Arqueo)</div>
        <div class="balance-row">
          <span>📊 Saldo Inicial:</span>
          <span style="color: #1976D2; font-weight: bold;">$${reportData.saldoInicial.toFixed(2)}</span>
        </div>
        <div class="balance-row">
          <span style="color: #4CAF50;">+ Total Iglesia:</span>
          <span style="color: #4CAF50; font-weight: bold;">$${reportData.subtotales.iglesia.total.toFixed(2)}</span>
        </div>
        <div class="balance-row">
          <span style="color: #F44336;">- Total Egresos:</span>
          <span style="color: #F44336; font-weight: bold;">$${reportData.subtotales.totalEgresos.toFixed(2)}</span>
        </div>
        <div class="balance-row final">
          <span>🎯 Saldo Final:</span>
          <span style="color: ${reportData.subtotales.saldoIglesia >= 0 ? '#4CAF50' : '#F44336'};">$${reportData.subtotales.saldoIglesia.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Sistema de Tesorería IASDMR</p>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// PLANTILLA HTML - REPORTE ANUAL
// ============================================
export const generateAnnualPdfHtml = (
  year: number,
  initialBalance: number,
  monthsData: Array<{
    mes: string;
    saldoInicial: number;
    ingresos: number;
    egresos: number;
    saldoFinal: number;
  }>
): string => {
  const monthlyRows = monthsData.map((month, index) => `
    <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
      <td style="border: 1px solid #ddd; padding: 12px; font-weight: 600;">${month.mes}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${month.saldoInicial.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #4CAF50; font-weight: 600;">$${month.ingresos.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #F44336; font-weight: 600;">$${month.egresos.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold; ${month.saldoFinal >= 0 ? 'color: #4CAF50;' : 'color: #F44336;'}">$${month.saldoFinal.toFixed(2)}</td>
    </tr>
  `).join('');

  const totalIngresos = monthsData.reduce((sum, m) => sum + m.ingresos, 0);
  const totalEgresos = monthsData.reduce((sum, m) => sum + m.egresos, 0);
  const saldoFinalAnual = monthsData[monthsData.length - 1].saldoFinal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 30px; background: #ffffff; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #9C27B0; padding-bottom: 20px; }
        .header h1 { font-size: 32px; color: #1A1A2E; margin-bottom: 8px; }
        .header .subtitle { font-size: 18px; color: #666; font-weight: 500; }
        .header .year { font-size: 24px; color: #9C27B0; font-weight: 700; margin-top: 10px; }
        
        .info-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .info-box h2 { font-size: 20px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .info-item { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; }
        .info-label { font-size: 13px; opacity: 0.9; margin-bottom: 5px; }
        .info-value { font-size: 22px; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; }
        thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        th { padding: 18px 12px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:not(:first-child) { text-align: right; }
        td { padding: 14px 12px; border: 1px solid #e0e0e0; font-size: 15px; }
        
        .totals-row { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: bold; font-size: 16px; }
        .totals-row td { border-color: #d81b60; padding: 18px 12px; }
        
        .summary-section { margin-top: 40px; padding: 30px; background: #f8f9fa; border-radius: 15px; border-left: 5px solid #9C27B0; }
        .summary-title { font-size: 22px; font-weight: bold; color: #1A1A2E; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
        .summary-card-title { font-size: 13px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .summary-card-value { font-size: 28px; font-weight: bold; color: #1A1A2E; }
        .summary-card.positive .summary-card-value { color: #4CAF50; }
        .summary-card.negative .summary-card-value { color: #F44336; }
        
        .receipt-style { border: 2px dashed #9C27B0; padding: 20px; margin: 30px 0; background: #fafafa; }
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
        @media print { body { padding: 20px; } }
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
            <div class="info-value">$${initialBalance.toFixed(2)}</div>
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
              <td style="text-align: right;">$${initialBalance.toFixed(2)}</td>
              <td style="text-align: right;">$${totalIngresos.toFixed(2)}</td>
              <td style="text-align: right;">$${totalEgresos.toFixed(2)}</td>
              <td style="text-align: right;">$${saldoFinalAnual.toFixed(2)}</td>
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
            <div class="summary-card-value">${saldoFinalAnual >= 0 ? '+' : ''}$${(saldoFinalAnual - initialBalance).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Sistema de Tesorería IASDMR</p>
      </div>
    </body>
    </html>
  `;
};