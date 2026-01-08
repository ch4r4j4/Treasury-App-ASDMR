export interface Rubros {
    primicia: number;
    diezmo: number;
    pobres: number;
    agradecimiento: number;
    escuelaSabatica: number;
    jovenes: number;
    adolescentes: number;
    ninos: number;
    educacion: number;
    salud: number;
    obraMisionera: number;
    musica: number;
    renuevaRadio: number;
    primerSabado: number;
    semanaOracion: number;
    misionExtranj: number;
    construccion: number;
    cultos: number;
  }
  
  export interface IncomeReceipt {
    id: string;
    nombre: string;
    fecha: string;
    iglesia: string;
    rubros: Rubros;
    total: number;
  }
  
  export interface Expense {
    id: string;
    fecha: string;
    descripcion: string;
    monto: number;
  }
  
  export interface SubtotalCalculations {
    asociacion: {
      primicia: number;
      diezmo: number;
      pobres: number;
      agradecimiento: number;
      escuelaSabatica: number;
      jovenes: number;
      adolescentes: number;
      ninos: number;
      educacion: number;
      salud: number;
      obraMisionera: number;
      musica: number;
      renuevaRadio: number;
      primerSabado: number;
      semanaOracion: number;
      misionExtranj: number;
      total: number;
    };
    iglesia: {
      pobres: number;
      agradecimiento: number;
      escuelaSabatica: number;
      jovenes: number;
      adolescentes: number;
      ninos: number;
      educacion: number;
      salud: number;
      obraMisionera: number;
      musica: number;
      construccion: number;
      cultos: number;
      total: number;
    };
    otros: {
      pobres: number;
      agradecimiento: number;
      escuelaSabatica: number;
      jovenes: number;
      adolescentes: number;
      ninos: number;
      educacion: number;
      salud: number;
      obraMisionera: number;
      musica: number;
      construccion: number;
      cultos: number;
      total: number;
    };
    totalEgresos: number;
    saldoIglesia: number;
    saldoFinalIglesia: number;
  }
  
  export interface ReportData {
    receipts: IncomeReceipt[];
    expenses: Expense[];
    totales: Rubros;
    subtotales: SubtotalCalculations;
  }

  export interface TreasuryBalance {
    saldoInicial: number;
    periodo: string; // formato: 'YYYY-MM'
  }
  
  // Metadata del Arqueo
export interface Arqueo {
  id: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  saldoInicial: number;
  saldoFinal: number;
  saldoIglesia: number;
  totalIngresos: number;
  totalEgresos: number;
  totalRecibos: number; // cantidad de recibos
  totalGastos: number;  // cantidad de gastos
  fechaCreacion: string; // ISO timestamp
  descripcion?: string; 
}

export interface ChurchConfig {
  nombre: string;
  periodo?: string; 
}