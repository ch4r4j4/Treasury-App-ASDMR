import { ReportData } from '@/types/treasury';

// ============================================
// PLANTILLA HTML - REPORTE MENSUAL COMPLETO
// ============================================
export const generateMonthlyPdfHtml = (
  reportData: ReportData & { saldoInicial: number; totalAsociacionYOtros: number },
  startDate: string,
  endDate: string,
  churchName: string = 'Iglesia',
): string => {
  const receiptsTableRows = reportData.receipts
  .sort((a, b) => a.fecha.localeCompare(b.fecha)) // ✅ Ordenar por fecha ascendente
  .map((receipt, index) => `
    <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
      <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${receipt.fecha}</td>
      <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${receipt.nombre}</td>
      <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${receipt.iglesia}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.primicia > 0 ? receipt.rubros.primicia.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.diezmo > 0 ? receipt.rubros.diezmo.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.pobres > 0 ? receipt.rubros.pobres.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.agradecimiento > 0 ? receipt.rubros.agradecimiento.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.escuelaSabatica > 0 ? receipt.rubros.escuelaSabatica.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.jovenes > 0 ? receipt.rubros.jovenes.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.adolescentes > 0 ? receipt.rubros.adolescentes.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.ninos > 0 ? receipt.rubros.ninos.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.educacion > 0 ? receipt.rubros.educacion.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.salud > 0 ? receipt.rubros.salud.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.obraMisionera > 0 ? receipt.rubros.obraMisionera.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.musica > 0 ? receipt.rubros.musica.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.renuevaRadio > 0 ? receipt.rubros.renuevaRadio.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.primerSabado > 0 ? receipt.rubros.primerSabado.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.semanaOracion > 0 ? receipt.rubros.semanaOracion.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.misionExtranj > 0 ? receipt.rubros.misionExtranj.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.construccion > 0 ? receipt.rubros.construccion.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">${receipt.rubros.cultos > 0 ? receipt.rubros.cultos.toFixed(2) : '-'}</td>
      <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-weight: bold; font-size: 11px; background-color: #E3F2FD;">${receipt.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: landscape;
          margin: 4mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0px; 
          background: #ffffff; 
          color: #333;
          font-size: 11px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 5px; 
          border-bottom: 3px solid #2196F3; 
          padding-bottom: 0px; 
        }
        .header h1 { font-size: 24px; color: #1A1A2E; margin-bottom: 5px; }
        .header .subtitle { font-size: 14px; color: #666; font-weight: 500; }
        .header .period { font-size: 13px; color: #2196F3; font-weight: 700; margin-top: 0px; }
        
        .info-box { 
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); 
          color: white; 
          padding: 15px; 
          border-radius: 10px; 
          margin-bottom: 20px; 
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .info-item { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; text-align: center; }
        .info-label { font-size: 10px; opacity: 0.9; margin-bottom: 3px; }
        .info-value { font-size: 16px; font-weight: bold; }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 0px 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
          font-size: 10px;
        }
        thead { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; }
        th { 
          padding: 2px 4px; 
          text-align: center; 
          font-weight: 600; 
          font-size: 9px; 
          text-transform: uppercase; 
          border: 1px solid #1976D2;
          line-height: 1.2;
        }
        th.rotate {
          height: 45px;
          white-space: nowrap;
          vertical-align: bottom;
          padding: 4px 2px;
        }
        th.rotate > div {
          transform: rotate(-45deg);
          width: 20px;
          transform-origin: bottom left;
        }
        td { padding: 6px 4px; border: 1px solid #e0e0e0; }
        
        .totals-row { 
          background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); 
          color: white; 
          font-weight: bold; 
          font-size: 11px;
        }
        .totals-row td { border-color: #d81b60; padding: 8px 4px; }
        
        .summary-section { 
          margin-top: 20px; 
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .summary-table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 10px;
        }
        .summary-table th { 
          background-color: #f5f5f5; 
          color: #333; 
          border: 1px solid #ddd; 
          padding: 6px; 
          text-align: left; 
          font-weight: 600; 
        }
        .summary-table td { border: 1px solid #ddd; padding: 8px; }
        .summary-table .total-row { background-color: #f0f0f0; font-weight: bold; }
        
        .highlight-blue { background-color: #E3F2FD !important; }
        .highlight-purple { background-color: #F3E5F5 !important; }
        .highlight-orange { background-color: #FFF3E0 !important; }
        
        .final-balance-section { 
          margin-top: 20px; 
          padding: 15px; 
          background: #f8f9fa; 
          border-radius: 10px; 
          border-left: 5px solid #2196F3; 
        }
        .final-balance-title { font-size: 16px; font-weight: bold; color: #1A1A2E; margin-bottom: 10px; }
        .balance-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .balance-item {
          background: white;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .balance-label { font-size: 10px; color: #666; margin-bottom: 5px; }
        .balance-value { font-size: 18px; font-weight: bold; }
        
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #999; 
          font-size: 9px; 
          padding-top: 15px; 
          border-top: 2px solid #e0e0e0; 
        }
        @media print { 
          body { padding: 10px; }
          .info-box, .summary-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="subtitle">IASDMR - Iglesia Adventista del Séptimo Día - ${churchName}</div>
        <div class="period">Arqueo del Período: ${startDate} al ${endDate}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th rowspan="2" style="vertical-align: middle;">Fecha</th>
            <th rowspan="2" style="vertical-align: middle;">Nombre</th>
            <th rowspan="2" style="vertical-align: middle;">Iglesia</th>
            <th colspan="18" style="background: #1565C0;">Rubros</th>
            <th rowspan="2" style="vertical-align: middle; background: #0D47A1;">Total</th>
          </tr>
          <tr>
            <th class="rotate"><div>Primicia</div></th>
            <th class="rotate"><div>Diezmo</div></th>
            <th class="rotate"><div>Pobres</div></th>
            <th class="rotate"><div>Agradec.</div></th>
            <th class="rotate"><div>E. Sabática</div></th>
            <th class="rotate"><div>Jóvenes</div></th>
            <th class="rotate"><div>Adolesc.</div></th>
            <th class="rotate"><div>Niños</div></th>
            <th class="rotate"><div>Educación</div></th>
            <th class="rotate"><div>Salud</div></th>
            <th class="rotate"><div>O. Misionera</div></th>
            <th class="rotate"><div>Música</div></th>
            <th class="rotate"><div>Renueva</div></th>
            <th class="rotate"><div>1er Sábado</div></th>
            <th class="rotate"><div>S. Oración</div></th>
            <th class="rotate"><div>M. Extranjera</div></th>
            <th class="rotate"><div>Construcción</div></th>
            <th class="rotate"><div>Cultos</div></th>
          </tr>
        </thead>
        <tbody>
          ${receiptsTableRows || '<tr><td colspan="22" style="text-align: center; padding: 20px;">No hay recibos en este período</td></tr>'}
          <tr class="totals-row">
            <td colspan="3" style="text-align: right; font-weight: bold;">TOTALES:</td>
            <td style="text-align: right;">${reportData.totales.primicia.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.diezmo.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.pobres.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.agradecimiento.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.escuelaSabatica.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.jovenes.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.adolescentes.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.ninos.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.educacion.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.salud.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.obraMisionera.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.musica.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.renuevaRadio.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.primerSabado.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.semanaOracion.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.misionExtranj.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.construccion.toFixed(2)}</td>
            <td style="text-align: right;">${reportData.totales.cultos.toFixed(2)}</td>
            <td style="text-align: right; font-size: 12px;">${(
              reportData.totales.primicia + reportData.totales.diezmo + reportData.totales.pobres + 
              reportData.totales.agradecimiento + reportData.totales.escuelaSabatica + reportData.totales.jovenes + 
              reportData.totales.adolescentes + reportData.totales.ninos + reportData.totales.educacion + 
              reportData.totales.salud + reportData.totales.obraMisionera + reportData.totales.musica + 
              reportData.totales.renuevaRadio + reportData.totales.primerSabado + reportData.totales.semanaOracion + 
              reportData.totales.misionExtranj + reportData.totales.construccion + reportData.totales.cultos
            ).toFixed(2)}</td>
          </tr>
          <tr style="background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); font-weight: bold;">
            <td colspan="3" style="padding: 10px; border: 1px solid #90CAF9; font-size: 11px;">SUBTOTAL ASOCIACIÓN</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.primicia.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.diezmo.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.pobres.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.agradecimiento.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.escuelaSabatica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.jovenes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.adolescentes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.ninos.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.educacion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.salud.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.obraMisionera.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.musica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.renuevaRadio.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.primerSabado.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.semanaOracion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.asociacion.misionExtranj.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #90CAF9; padding: 6px; text-align: right; font-weight: bold; font-size: 11px; background: #E3F2FD;">${reportData.subtotales.asociacion.total.toFixed(2)}</td>
          </tr>

          <!-- SUBTOTAL OTROS -->
          <tr style="background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); font-weight: bold;">
            <td colspan="3" style="padding: 10px; border: 1px solid #FFB74D; font-size: 11px;">SUBTOTAL OTROS</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.pobres.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.agradecimiento.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.escuelaSabatica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.jovenes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.adolescentes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.ninos.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.educacion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.salud.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.obraMisionera.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.musica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.construccion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.otros.cultos.toFixed(2)}</td>
            <td style="border: 1px solid #FFB74D; padding: 6px; text-align: right; font-weight: bold; font-size: 11px; background: #FFF3E0;">${reportData.subtotales.otros.total.toFixed(2)}</td>
          </tr>

          <!-- SUBTOTAL IGLESIA -->
          <tr style="background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%); font-weight: bold;">
            <td colspan="3" style="padding: 10px; border: 1px solid #CE93D8; font-size: 11px;">SUBTOTAL IGLESIA</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.pobres.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.agradecimiento.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.escuelaSabatica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.jovenes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.adolescentes.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.ninos.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.educacion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.salud.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.obraMisionera.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.musica.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.construccion.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 10px;">${reportData.subtotales.iglesia.cultos.toFixed(2)}</td>
            <td style="border: 1px solid #CE93D8; padding: 6px; text-align: right; font-weight: bold; font-size: 11px; background: #F3E5F5;">${reportData.subtotales.iglesia.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECCIÓN: EGRESOS Y BALANCE FINAL (50/50) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
        
        <!-- TABLA DE EGRESOS (Izquierda) -->
        <div>
          <h2 style="text-align: center; margin-bottom: 15px; color: #F44336; font-size: 16px;">💸 Detalle de Egresos</h2>
          <table style="width: 100%; font-size: 10px;">
            <thead style="background: linear-gradient(135deg, #f07035ff 0%, #f3a476ff 100%);">
              <tr>
                <th style="padding: 4px 8px; text-align: left; color: white; border: 1px solid #f3a476ff;">Fecha</th>
                <th style="padding: 4px 8px; text-align: left; color: white; border: 1px solid #f3a476ff;">Descripción</th>
                <th style="padding: 4px 8px; text-align: right; color: white; border: 1px solid #f3a476ff;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.expenses && reportData.expenses.length > 0
                ? reportData.expenses
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
                  .map((expense, index) => `
                  <tr style="${index % 2 === 0 ? 'background-color: #fff5f5;' : 'background-color: #ffffff;'}">
                    <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${expense.fecha}</td>
                    <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${expense.descripcion}</td>
                    <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px; font-weight: bold; color: #F44336;">$${expense.monto.toFixed(2)}</td>
                  </tr>
                `).join('')
                : '<tr><td colspan="3" style="text-align: center; padding: 20px; border: 1px solid #ddd; color: #999;">No hay egresos en este período</td></tr>'
              }
              <tr style="background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); color: white; font-weight: bold;">
                <td colspan="2" style="padding: 6px 8px; text-align: right; border: 1px solid #D32F2F; font-size: 11px;">TOTAL EGRESOS:</td>
                <td style="padding: 6px 8px; text-align: right; border: 1px solid #D32F2F; font-size: 12px;">$${reportData.subtotales.totalEgresos.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- BALANCE FINAL (Derecha) -->
        <div>
          <h2 style="text-align: center; margin-bottom: 15px; color: #4CAF50; font-size: 16px;">🎯 Balance Final del Período</h2>
          <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 15px; padding: 8px 15px; border: 3px solid #4CAF50;">

            <div style="background: white; border-radius: 10px; padding: 6px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                  <span style="font-size: 10px; color: #666; font-weight: 600;">📊 Asociacion :</span>
                  <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Subtotal asociacion + diezmo iglesia</div>
                </div>
                <span style="font-size: 14px; font-weight: bold; color: #1976D2;">$${reportData.totalAsociacionYOtros.toFixed(2)}</span>
              </div>
            </div>

            <div style="background: white; border-radius: 15px; padding: 6px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                  <span style="font-size: 10px; color: #4CAF50; font-weight: 600;">➕ Ingreso Neto Iglesia:</span>
                  <div style="font-size: 9px; color: rgba(255,255,255,0.8);">Subtotal iglesia - egresos</div>
                </div>
                <span style="font-size: 14px; font-weight: bold; color: #4CAF50;">$${reportData.subtotales.saldoIglesia.toFixed(2)}</span>
              </div>
            </div>

            <div style="background: white; border-radius: 15px; padding: 6px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 10px; color: #666; font-weight: 600;">📊 Saldo Anterior:</span>
                <span style="font-size: 14px; font-weight: bold; color: #1976D2;">$${reportData.saldoInicial.toFixed(2)}</span>
              </div>
            </div>

            <div style="background: ${reportData.subtotales.saldoIglesia >= 0 ? 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'}; border-radius: 12px; padding: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 12px; color: white; font-weight: 700; margin-bottom: 5px;">🎯 SALDO FINAL</div>
                  <div style="font-size: 9px; color: rgba(255,255,255,0.8);">saldo anterior + Ingreso neto</div>
                </div>
                <div style="font-size: 16px; font-weight: 900; color: white;">$${reportData.subtotales.saldoFinalIglesia.toFixed(2)}</div>
              </div>
            </div>

            <div style="margin-top: 5px; padding: 3px; background: rgba(255,255,255,0.5); border-radius: 8px; border-left: 4px solid #FF9800;">
              <div style="font-size: 9px; color: #E65100; line-height: 1.5;">
                <strong>ℹ️ Nota:</strong> Este saldo final se convertirá automáticamente en el Saldo Inicial del próximo arqueo.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>Sistema de Tesorería IASDMR - Iglesia Adventista del Séptimo Día</p>
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
        thead { background: linear-gradient(135deg, #98a6e6ff 0%, #9169b9ff 100%); color: white; }
        th { padding: 18px 12px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:not(:first-child) { text-align: right; }
        td { padding: 14px 12px; border: 1px solid #e0e0e0; font-size: 15px; }
        
        .totals-row { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: bold; font-size: 16px; }
        .totals-row td { border-color: #ffccdfff; padding: 18px 12px; }
        
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