import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useTreasury } from '@/contexts/TreasuryContext';
import DatePickerInput from '@/components/DatePickerInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewReceiptScreen() {
  const router = useRouter();
  const { addReceipt, churchConfig } = useTreasury();

  const [nombre, setNombre] = useState('');
  const [iglesia, setIglesia] = useState(churchConfig.nombre || '');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [primicia, setPrimicia] = useState('');
  const [diezmo, setDiezmo] = useState('');
  const [pobres, setPobres] = useState('');
  const [agradecimiento, setAgradecimiento] = useState('');
  const [escuelaSabatica, setEscuelaSabatica] = useState('');
  const [jovenes, setJovenes] = useState('');
  const [adolescentes, setAdolescentes] = useState('');
  const [ninos, setNinos] = useState('');
  const [educacion, setEducacion] = useState('');
  const [salud, setSalud] = useState('');
  const [obraMisionera, setObraMisionera] = useState('');
  const [musica, setMusica] = useState('');
  const [renuevaRadio, setRenuevaRadio] = useState('');
  const [primerSabado, setPrimerSabado] = useState('');
  const [semanaOracion, setSemanaOracion] = useState('');
  const [misionExtranj, setMisionExtranj] = useState('');
  const [construccion, setConstruccion] = useState('');
  const [cultos, setCultos] = useState('');

  const insets = useSafeAreaInsets();

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre');
      return;
    }
    if (!iglesia.trim()) {
      Alert.alert('Error', 'Por favor ingrese la iglesia');
      return;
    }

    const rubros = {
      primicia: parseFloat(primicia) || 0,
      diezmo: parseFloat(diezmo) || 0,
      pobres: parseFloat(pobres) || 0,
      agradecimiento: parseFloat(agradecimiento) || 0,
      cultos: parseFloat(cultos) || 0,
      escuelaSabatica: parseFloat(escuelaSabatica) || 0,
      jovenes: parseFloat(jovenes) || 0,
      adolescentes: parseFloat(adolescentes) || 0,
      ninos: parseFloat(ninos) || 0,
      educacion: parseFloat(educacion) || 0,
      salud: parseFloat(salud) || 0,
      obraMisionera: parseFloat(obraMisionera) || 0,
      musica: parseFloat(musica) || 0,
      renuevaRadio: parseFloat(renuevaRadio) || 0,
      primerSabado: parseFloat(primerSabado) || 0,
      semanaOracion: parseFloat(semanaOracion) || 0,
      misionExtranj: parseFloat(misionExtranj) || 0,
      construccion: parseFloat(construccion) || 0,
    };

    const total =
      rubros.primicia +
      rubros.diezmo +
      rubros.pobres +
      rubros.agradecimiento +
      rubros.cultos +
      rubros.escuelaSabatica +
      rubros.jovenes +
      rubros.adolescentes +
      rubros.ninos +
      rubros.educacion +
      rubros.salud +
      rubros.obraMisionera +
      rubros.musica +
      rubros.renuevaRadio +
      rubros.primerSabado +
      rubros.semanaOracion +
      rubros.misionExtranj +
      rubros.construccion;


    if (total <= 0) {
      Alert.alert('Error', 'Debe ingresar al menos un monto en los rubros');
      return;
    }

    await addReceipt({
      nombre,
      fecha,
      iglesia,
      rubros,
      total,
    });

    Alert.alert('Éxito', 'Recibo registrado correctamente');
    router.back();
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.sectionTitleSup}>Nuevo Ingreso</Text>
            
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información General</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={iglesia}
                  onChangeText={setIglesia}
                  placeholder="Iglesia"
                  placeholderTextColor="#999"
                />
              </View>

              <DatePickerInput
                label=""
                value={fecha}
                onChangeDate={setFecha}
              />
            </View>

            <View style={styles.section}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Primicia</Text>
                <TextInput
                  style={styles.input}
                  value={primicia}
                  onChangeText={setPrimicia}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Diezmo</Text>
                <TextInput
                  style={styles.input}
                  value={diezmo}
                  onChangeText={setDiezmo}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pobres</Text>
                <TextInput
                  style={styles.input}
                  value={pobres}
                  onChangeText={setPobres}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Agradecimiento</Text>
                <TextInput
                  style={styles.input}
                  value={agradecimiento}
                  onChangeText={setAgradecimiento}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cultos</Text>
                <TextInput
                  style={styles.input}
                  value={cultos}
                  onChangeText={setCultos}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Escuela Sabática</Text>
                <TextInput
                  style={styles.input}
                  value={escuelaSabatica}
                  onChangeText={setEscuelaSabatica}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jóvenes</Text>
                <TextInput
                  style={styles.input}
                  value={jovenes}
                  onChangeText={setJovenes}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adolescentes</Text>
                <TextInput
                  style={styles.input}
                  value={adolescentes}
                  onChangeText={setAdolescentes}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Niños</Text>
                <TextInput
                  style={styles.input}
                  value={ninos}
                  onChangeText={setNinos}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Educación</Text>
                <TextInput
                  style={styles.input}
                  value={educacion}
                  onChangeText={setEducacion}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Salud</Text>
                <TextInput
                  style={styles.input}
                  value={salud}
                  onChangeText={setSalud}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Obra Misionera</Text>
                <TextInput
                  style={styles.input}
                  value={obraMisionera}
                  onChangeText={setObraMisionera}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Música</Text>
                <TextInput
                  style={styles.input}
                  value={musica}
                  onChangeText={setMusica}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Renueva Radio</Text>
                <TextInput
                  style={styles.input}
                  value={renuevaRadio}
                  onChangeText={setRenuevaRadio}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Primer Sábado</Text>
                <TextInput
                  style={styles.input}
                  value={primerSabado}
                  onChangeText={setPrimerSabado}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Semana de Oración</Text>
                <TextInput
                  style={styles.input}
                  value={semanaOracion}
                  onChangeText={setSemanaOracion}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Misión Extranjera</Text>
                <TextInput
                  style={styles.input}
                  value={misionExtranj}
                  onChangeText={setMisionExtranj}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Construcción</Text>
                <TextInput
                  style={styles.input}
                  value={construccion}
                  onChangeText={setConstruccion}
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
                S/{(
                  (parseFloat(primicia) || 0) +
                  (parseFloat(diezmo) || 0) +
                  (parseFloat(pobres) || 0) +
                  (parseFloat(agradecimiento) || 0) +
                  (parseFloat(cultos) || 0) +
                  (parseFloat(escuelaSabatica) || 0) +
                  (parseFloat(jovenes) || 0) +
                  (parseFloat(adolescentes) || 0) +
                  (parseFloat(ninos) || 0) +
                  (parseFloat(educacion) || 0) +
                  (parseFloat(salud) || 0) +
                  (parseFloat(obraMisionera) || 0) +
                  (parseFloat(musica) || 0) +
                  (parseFloat(renuevaRadio) || 0) +
                  (parseFloat(primerSabado) || 0) +
                  (parseFloat(semanaOracion) || 0) +
                  (parseFloat(misionExtranj) || 0) +
                  (parseFloat(construccion) || 0)
                ).toFixed(2)}
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
    paddingVertical: 6,
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
    padding: 15,
    paddingVertical: 8,
    paddingBottom: 8,
    marginBottom: 8,
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
  sectionTitleSup: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A2E',
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  totalContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
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
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginLeft: 5,
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
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
  },
  footerSaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  footerSaveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4
  },
});