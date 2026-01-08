import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView
} from 'react-native';
import { X, DollarSign, Church } from 'lucide-react-native';

interface SaldoInicialModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (saldo: number) => void;
  onSaveChurchName: (nombre: string) => void; // ✅ Nuevo
  currentSaldo: number;
  currentChurchName: string; // ✅ Nuevo
  periodo: string;
}

export default function SaldoInicialModal({
  visible,
  onClose,
  onSave,
  onSaveChurchName,
  currentSaldo,
  currentChurchName,
  periodo,
}: SaldoInicialModalProps) {
  const [saldo, setSaldo] = useState(currentSaldo.toString());
  const [churchName, setChurchName] = useState(currentChurchName);

  const handleSave = () => {
    const saldoNum = parseFloat(saldo);
    if (isNaN(saldoNum)) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return;
    }
    
    if (!churchName.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre de la iglesia');
      return;
    }

    onSave(saldoNum);
    onSaveChurchName(churchName.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Configuración General</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.periodoText}>Período: {periodo}</Text>

            {/* ✅ NUEVO: Input para nombre de iglesia */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre de la Iglesia</Text>
              <View style={styles.inputContainer}>
                <Church size={20} color="#9C27B0" style={styles.icon} />
                <TextInput
                  style={styles.textInput}
                  value={churchName}
                  onChangeText={setChurchName}
                  placeholder="Ej: Iglesia Central"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.helperText}>
                Este nombre aparecerá por defecto en los recibos y reportes PDF
              </Text>
            </View>

            {/* Saldo Inicial */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saldo Inicial</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#9C27B0" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={saldo}
                  onChangeText={setSaldo}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.helperText}>
                Este será el saldo inicial para el período seleccionado
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  closeButton: {
    padding: 4,
  },
  periodoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9C27B0',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});