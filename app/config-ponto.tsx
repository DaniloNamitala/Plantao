import CustomToast from '@/components/CustomToast';
import { useColorScheme } from '@/components/useColorScheme';
import { useToast } from '@/components/useToast';
import pontoDataSource from '@/data/pontoDataSource';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useCallback, useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

function applyTimeMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function ConfigPontoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const toast = useToast();
  const [duration, setDuration] = useState('');
  const [original, setOriginal] = useState('');

  const loadConfig = useCallback(async () => {
    const config = await pontoDataSource.getConfig();
    const value = config.work_day_duration.slice(0, 5);
    setDuration(value);
    setOriginal(value);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleDurationChange = (text: string) => {
    setDuration(applyTimeMask(text));
  };

  const handleSave = async () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(duration)) {
      toast.show({ text: 'Formato inválido. Use HH:MM.', color: '#ef4444', icon: 'times-circle' });
      return;
    }
    const [h, m] = duration.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      toast.show({ text: 'Horário inválido.', color: '#ef4444', icon: 'times-circle' });
      return;
    }
    try {
      await pontoDataSource.updateWorkDayDuration(duration);
      setOriginal(duration);
      toast.show({ text: 'Configuração salva.', color: '#22c55e', icon: 'check-circle' });
    } catch {
      toast.show({ text: 'Não foi possível salvar.', color: '#ef4444', icon: 'times-circle' });
    }
  };

  const hasChanges = duration !== original;

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <FontAwesome5 name="business-time" size={18} color="#2f95dc" />
            <Text style={[styles.label, isDark && styles.textDark]}>Jornada Diária</Text>
          </View>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={duration}
            onChangeText={handleDurationChange}
            keyboardType="numeric"
            maxLength={5}
            placeholder="08:00"
            placeholderTextColor={isDark ? '#555' : '#bbb'}
          />
        </View>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Duração da jornada de trabalho (HH:MM)
        </Text>
      </View>

      {hasChanges && (
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
        >
          <FontAwesome5 name="save" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Salvar</Text>
        </Pressable>
      )}
      <CustomToast
        visible={toast.visible}
        config={toast.config}
        onHide={toast.hide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textDark: {
    color: '#ccc',
  },
  input: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: 'center',
    minWidth: 80,
  },
  inputDark: {
    color: '#ccc',
    borderColor: '#444',
    backgroundColor: '#2a2a2a',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  hintDark: {
    color: '#666',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2f95dc',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    elevation: 3,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
