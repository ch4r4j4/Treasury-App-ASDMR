import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DatePickerInputProps {
  label: string;
  value: string; // formato 'YYYY-MM-DD'
  onChangeDate: (date: string) => void;
  style?: any;
}

export default function DatePickerInput({ label, value, onChangeDate, style }: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  
  // ✅ Función para crear fecha sin problemas de zona horaria
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // mes es 0-indexed
  };

  const [date, setDate] = useState(() => 
    createLocalDate(value || new Date().toISOString().split('T')[0])
  );

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      
      // ✅ Formatear fecha en hora local, no UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      onChangeDate(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDisplayDate = (dateString: string) => {
    const d = createLocalDate(dateString);
    return d.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={showDatepicker}
        activeOpacity={0.7}
      >
        <Calendar size={20} color="#666" />
        <Text style={styles.dateText}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          locale="es-ES"
        />
      )}
      
      {/* En iOS, agregar botón de cerrar */}
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => setShow(false)}
        >
          <Text style={styles.doneText}>Listo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    color: '#1A1A2E',
    flex: 1,
  },
  doneButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});