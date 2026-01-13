import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useTreasury } from '@/contexts/TreasuryContext';
import DatePickerInput from '@/components/DatePickerInput';

export default function NewExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useTreasury();

  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [monto, setMonto] = useState('');

  const handleSave = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingrese la descripción');
      return;
    }

    const montoValue = parseFloat(monto);
    if (!montoValue || montoValue <= 0) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return;
    }

    await addExpense({
      fecha,
      descripcion,
      monto: montoValue,
    });

    Alert.alert('Éxito', 'Egreso registrado correctamente');
    router.back();
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Egreso</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Egreso</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Descripción del gasto"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <DatePickerInput
                label="Fecha"
                value={fecha}
                onChangeDate={setFecha}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto</Text>
                <TextInput
                  style={styles.input}
                  value={monto}
                  onChangeText={setMonto}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

           
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.footerSaveText}>Total             </Text>
              <Text style={styles.totalAmount}>
                S/{(parseFloat(monto) || 0).toFixed(2)}
              </Text>
          </View> 
          <TouchableOpacity 
            style={styles.footerSaveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    paddingVertical: 8,
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
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top' as const,
  },
  totalContainer: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    padding: 6,
    paddingHorizontal: 20,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  footerSaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  footerSaveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4
  },
});
