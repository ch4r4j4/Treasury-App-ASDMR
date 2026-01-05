import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { IncomeReceipt, Expense, SubtotalCalculations, Rubros } from '@/types/treasury';

const RECEIPTS_KEY = '@treasury_receipts';
const EXPENSES_KEY = '@treasury_expenses';

export const [TreasuryProvider, useTreasury] = createContextHook(() => {
  const [receipts, setReceipts] = useState<IncomeReceipt[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [receiptsData, expensesData] = await Promise.all([
        AsyncStorage.getItem(RECEIPTS_KEY),
        AsyncStorage.getItem(EXPENSES_KEY),
      ]);

      if (receiptsData) {
        setReceipts(JSON.parse(receiptsData));
      }
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
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

  return {
    receipts,
    expenses,
    isLoading,
    addReceipt,
    addExpense,
    deleteReceipt,
    deleteExpense,
  };
});

export const useFilteredData = (startDate: string, endDate: string) => {
  const { receipts, expenses } = useTreasury();

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
        pobres: totales.pobres *0.5,
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

      ///diezmo de iglesia
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

    subtotales.totalEgresos = filteredExpenses.reduce((sum, e) => sum + e.monto, 0);
    subtotales.saldoIglesia = subtotales.iglesia.total - subtotales.totalEgresos;

    return {
      receipts: filteredReceipts,
      expenses: filteredExpenses,
      totales,
      subtotales,
    };
  }, [receipts, expenses, startDate, endDate]);
};