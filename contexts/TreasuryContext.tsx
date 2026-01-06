import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { IncomeReceipt, Expense, SubtotalCalculations, Rubros, TreasuryBalance } from '@/types/treasury';

const RECEIPTS_KEY = '@treasury_receipts';
const EXPENSES_KEY = '@treasury_expenses';
const BALANCE_KEY = '@treasury_balance';

export const [TreasuryProvider, useTreasury] = createContextHook(() => {
  const [receipts, setReceipts] = useState<IncomeReceipt[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<TreasuryBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [receiptsData, expensesData, balancesData] = await Promise.all([
        AsyncStorage.getItem(RECEIPTS_KEY),
        AsyncStorage.getItem(EXPENSES_KEY),
        AsyncStorage.getItem(BALANCE_KEY),
      ]);

      if (receiptsData) {
        setReceipts(JSON.parse(receiptsData));
      }
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }
      if (balancesData) {
        setBalances(JSON.parse(balancesData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReceipt = async (receipt: Omit<IncomeReceipt, 'id'>) => {
    const newReceipt: IncomeReceipt = {
      ...receipt,
      id: Date.now().toString(),
    };
    const updated = [...receipts, newReceipt];
    setReceipts(updated);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(updated));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  };

  const deleteReceipt = async (id: string) => {
    const updated = receipts.filter(r => r.id !== id);
    setReceipts(updated);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(updated));
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  };

  // Función para establecer saldo inicial manualmente
  const setSaldoInicial = async (periodo: string, saldo: number) => {
    const existingIndex = balances.findIndex(b => b.periodo === periodo);
    let updated: TreasuryBalance[];
    
    if (existingIndex !== -1) {
      updated = [...balances];
      updated[existingIndex] = { periodo, saldoInicial: saldo };
    } else {
      updated = [...balances, { periodo, saldoInicial: saldo }];
    }
    
    setBalances(updated);
    await AsyncStorage.setItem(BALANCE_KEY, JSON.stringify(updated));
  };

  // Función para obtener saldo inicial por período (YYYY-MM)
  const getSaldoInicialPorPeriodo = (periodo: string): number => {
    const manualBalance = balances.find(b => b.periodo === periodo);
    if (manualBalance) {
      return manualBalance.saldoInicial;
    }
    
    // Si no hay saldo manual, calcular desde el período anterior
    const [year, month] = periodo.split('-').map(Number);
    const previousDate = new Date(year, month - 2, 1);
    const previousPeriodo = previousDate.toISOString().substring(0, 7);
    
    // Evitar recursión infinita: si es el primer mes, retornar 0
    if (previousDate.getFullYear() < 2000) {
      return 0;
    }
    
    const previousMonthStart = `${previousPeriodo}-01`;
    const previousMonthEnd = new Date(year, month - 1, 0).toISOString().split('T')[0];
    
    const previousReceipts = receipts.filter(r => r.fecha >= previousMonthStart && r.fecha <= previousMonthEnd);
    const previousExpenses = expenses.filter(e => e.fecha >= previousMonthStart && e.fecha <= previousMonthEnd);
    
    const previousTotales = previousReceipts.reduce(
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

    const previousIglesiaTotal = 
      previousTotales.pobres * 0.45 +
      previousTotales.agradecimiento * 0.45 +
      previousTotales.escuelaSabatica * 0.45 +
      previousTotales.jovenes * 0.45 +
      previousTotales.adolescentes * 0.45 +
      previousTotales.ninos * 0.45 +
      previousTotales.educacion * 0.45 +
      previousTotales.salud * 0.45 +
      previousTotales.obraMisionera * 0.45 +
      previousTotales.musica * 0.45 +
      previousTotales.construccion * 0.9 +
      previousTotales.cultos * 0.9;

    const previousEgresos = previousExpenses.reduce((sum, e) => sum + e.monto, 0);
    const previousSaldoInicial = getSaldoInicialPorPeriodo(previousPeriodo);
    
    return previousSaldoInicial + previousIglesiaTotal - previousEgresos;
  };

  // Función MEJORADA: Calcula el saldo inicial desde un rango de fechas
  const getSaldoInicial = (startDate: string, endDate: string): number => {
    const periodo = startDate.substring(0, 7); // 'YYYY-MM'
    return getSaldoInicialPorPeriodo(periodo);
  };

  return {
    receipts,
    expenses,
    balances,
    isLoading,
    addReceipt,
    addExpense,
    deleteReceipt,
    deleteExpense,
    setSaldoInicial,
    getSaldoInicial,
    getSaldoInicialPorPeriodo, // Exportar también esta función
  };
});

export const useFilteredData = (startDate: string, endDate: string) => {
  const { receipts, expenses, getSaldoInicial } = useTreasury();

  return useMemo(() => {
    const filteredReceipts = receipts.filter(r => {
      return r.fecha >= startDate && r.fecha <= endDate;
    });

    const filteredExpenses = expenses.filter(e => {
      return e.fecha >= startDate && e.fecha <= endDate;
    });

    const totales: Rubros = filteredReceipts.reduce(
      (acc, receipt) => ({
        primicia: acc.primicia + (receipt.rubros.primicia ?? 0),
        diezmo: acc.diezmo + (receipt.rubros.diezmo ?? 0),
        pobres: acc.pobres + (receipt.rubros.pobres ?? 0),
        agradecimiento: acc.agradecimiento + (receipt.rubros.agradecimiento ?? 0),
        cultos: acc.cultos + (receipt.rubros.cultos ?? 0),
        escuelaSabatica: acc.escuelaSabatica + (receipt.rubros.escuelaSabatica ?? 0),
        jovenes: acc.jovenes + (receipt.rubros.jovenes ?? 0),
        adolescentes: acc.adolescentes + (receipt.rubros.adolescentes ?? 0),
        ninos: acc.ninos + (receipt.rubros.ninos ?? 0),
        educacion: acc.educacion + (receipt.rubros.educacion ?? 0),
        salud: acc.salud + (receipt.rubros.salud ?? 0),
        obraMisionera: acc.obraMisionera + (receipt.rubros.obraMisionera ?? 0),
        musica: acc.musica + (receipt.rubros.musica ?? 0),
        renuevaRadio: acc.renuevaRadio + (receipt.rubros.renuevaRadio ?? 0),
        primerSabado: acc.primerSabado + (receipt.rubros.primerSabado ?? 0),
        semanaOracion: acc.semanaOracion + (receipt.rubros.semanaOracion ?? 0),
        misionExtranj: acc.misionExtranj + (receipt.rubros.misionExtranj ?? 0),
        construccion: acc.construccion + (receipt.rubros.construccion ?? 0),
      }),
      {
        primicia: 0,
        diezmo: 0,
        pobres: 0,
        agradecimiento: 0,
        cultos: 0,
        escuelaSabatica: 0,
        jovenes: 0,
        adolescentes: 0,
        ninos: 0,
        educacion: 0,
        salud: 0,
        obraMisionera: 0,
        musica: 0,
        renuevaRadio: 0,
        primerSabado: 0,
        semanaOracion: 0,
        misionExtranj: 0,
        construccion: 0,
      }
    );

    const subtotales: SubtotalCalculations = {
      asociacion: {
        primicia: totales.primicia * 1.0,
        diezmo: totales.diezmo * 1.0,
        pobres: totales.pobres * 0.5,
        agradecimiento: totales.agradecimiento * 0.5,
        escuelaSabatica: totales.escuelaSabatica * 0.5,
        jovenes: totales.jovenes * 0.5,
        adolescentes: totales.adolescentes * 0.5,
        ninos: totales.ninos * 0.5,
        educacion: totales.educacion * 0.5,
        salud: totales.salud * 0.5,
        obraMisionera: totales.obraMisionera * 0.5,
        musica: totales.musica * 0.5,
        renuevaRadio: totales.renuevaRadio * 1.0,
        primerSabado: totales.primerSabado * 1.0,
        semanaOracion: totales.semanaOracion * 1.0,
        misionExtranj: totales.misionExtranj * 1.0,
        total: 0,
      },
      iglesia: {
        pobres: totales.pobres * 0.45,
        agradecimiento: totales.agradecimiento * 0.45,
        escuelaSabatica: totales.escuelaSabatica * 0.45,
        jovenes: totales.jovenes * 0.45,
        adolescentes: totales.adolescentes * 0.45,
        ninos: totales.ninos * 0.45,
        educacion: totales.educacion * 0.45,
        salud: totales.salud * 0.45,
        obraMisionera: totales.obraMisionera * 0.45,
        musica: totales.musica * 0.45,
        construccion: totales.construccion * 0.9,
        cultos: totales.cultos * 0.9,
        total: 0,
      },
      otros: {
        pobres: totales.pobres * 0.05,
        agradecimiento: totales.agradecimiento * 0.05,
        escuelaSabatica: totales.escuelaSabatica * 0.05,
        jovenes: totales.jovenes * 0.05,
        adolescentes: totales.adolescentes * 0.05,
        ninos: totales.ninos * 0.05,
        educacion: totales.educacion * 0.05,
        salud: totales.salud * 0.05,
        obraMisionera: totales.obraMisionera * 0.05,
        musica: totales.musica * 0.05,
        construccion: totales.construccion * 0.1,
        cultos: totales.cultos * 0.1,
        total: 0,
      },
      totalEgresos: 0,
      saldoIglesia: 0,
    };

    subtotales.asociacion.total =
      subtotales.asociacion.primicia +
      subtotales.asociacion.diezmo +
      subtotales.asociacion.pobres +
      subtotales.asociacion.agradecimiento +
      subtotales.asociacion.escuelaSabatica +
      subtotales.asociacion.jovenes +
      subtotales.asociacion.adolescentes +
      subtotales.asociacion.ninos +
      subtotales.asociacion.educacion +
      subtotales.asociacion.salud +
      subtotales.asociacion.obraMisionera +
      subtotales.asociacion.musica +
      subtotales.asociacion.renuevaRadio +
      subtotales.asociacion.primerSabado +
      subtotales.asociacion.semanaOracion +
      subtotales.asociacion.misionExtranj;

    subtotales.iglesia.total =
      subtotales.iglesia.pobres +
      subtotales.iglesia.agradecimiento +
      subtotales.iglesia.escuelaSabatica +
      subtotales.iglesia.jovenes +
      subtotales.iglesia.adolescentes +
      subtotales.iglesia.ninos +
      subtotales.iglesia.educacion +
      subtotales.iglesia.salud +
      subtotales.iglesia.obraMisionera +
      subtotales.iglesia.musica +
      subtotales.iglesia.construccion +
      subtotales.iglesia.cultos;

    subtotales.otros.total = 
      subtotales.otros.pobres +
      subtotales.otros.agradecimiento +
      subtotales.otros.escuelaSabatica +
      subtotales.otros.jovenes +
      subtotales.otros.adolescentes +
      subtotales.otros.ninos +
      subtotales.otros.educacion +
      subtotales.otros.salud +
      subtotales.otros.obraMisionera +
      subtotales.otros.musica +
      subtotales.otros.construccion +
      subtotales.otros.cultos;

    const totalAsociacionYOtros = subtotales.asociacion.total + subtotales.otros.total;

    subtotales.totalEgresos = filteredExpenses.reduce((sum, e) => sum + e.monto, 0);
    
    const saldoInicial = getSaldoInicial(startDate, endDate);
    
    // FÓRMULA CORRECTA: Saldo Final = Saldo Inicial + Total Iglesia - Egresos
    subtotales.saldoIglesia = saldoInicial + subtotales.iglesia.total - subtotales.totalEgresos;

    return {
      receipts: filteredReceipts,
      expenses: filteredExpenses,
      totales,
      subtotales,
      saldoInicial,
      totalAsociacionYOtros,
    };
  }, [receipts, expenses, startDate, endDate, getSaldoInicial]);
};