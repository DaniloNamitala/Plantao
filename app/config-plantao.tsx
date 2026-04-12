import CustomToast from '@/components/CustomToast';
import { useColorScheme } from '@/components/useColorScheme';
import { useToast } from '@/components/useToast';
import type { SobAviso } from '@/data/plantaoDataSource';
import plantaoService from '@/service/plantaoService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

function applyTimeMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function ConfigPlantaoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const toast = useToast();
  const [durations, setDurations] = useState<Record<number, string>>({});
  const [originals, setOriginals] = useState<Record<number, string>>({});

  const loadConfig = useCallback(async () => {
    const data = await plantaoService.getSobAviso();
    const map: Record<number, string> = {};
    data.forEach((item: SobAviso) => {
      map[item.weekday] = item.duration.slice(0, 5);
    });
    setDurations({ ...map });
    setOriginals({ ...map });
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleChange = (weekday: number, text: string) => {
    setDurations((prev) => ({ ...prev, [weekday]: applyTimeMask(text) }));
  };

  const hasChanges = Object.keys(durations).some(
    (key) => durations[Number(key)] !== originals[Number(key)]
  );

  const handleSave = async () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (let i = 0; i < 7; i++) {
      const val = durations[i] ?? '00:00';
      if (!timeRegex.test(val)) {
        toast.show({ text: `Formato inválido para ${WEEKDAY_LABELS[i]}. Use HH:MM.`, color: '#ef4444', icon: 'times-circle' });
        return;
      }
      const [h, m] = val.split(':').map(Number);
      if (h < 0 || h > 23 || m < 0 || m > 59) {
        toast.show({ text: `Horário inválido para ${WEEKDAY_LABELS[i]}.`, color: '#ef4444', icon: 'times-circle' });
        return;
      }
    }
    try {
      for (let i = 0; i < 7; i++) {
        if (durations[i] !== originals[i]) {
          await plantaoService.updateSobAviso(i, durations[i]);
        }
      }
      setOriginals({ ...durations });
      toast.show({ text: 'Configuração salva.', color: '#22c55e', icon: 'check-circle' });
    } catch {
      toast.show({ text: 'Não foi possível salvar.', color: '#ef4444', icon: 'times-circle' });
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.headerRow}>
            <FontAwesome5 name="bell" size={18} color="#f59e0b" />
            <Text style={[styles.headerLabel, isDark && styles.textDark]}>Sob Aviso</Text>
          </View>
          <Text style={[styles.hint, isDark && styles.hintDark]}>
            Duração do sob aviso para cada dia da semana (HH:MM)
          </Text>

          {WEEKDAY_LABELS.map((label, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.weekdayLabel, isDark && styles.textDark]}>{label}</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={durations[index] ?? '00:00'}
                onChangeText={(t) => handleChange(index, t)}
                keyboardType="numeric"
                maxLength={5}
                placeholder="00:00"
                placeholderTextColor={isDark ? '#555' : '#bbb'}
              />
            </View>
          ))}
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
      </ScrollView>

      <CustomToast
        visible={toast.visible}
        config={toast.config}
        onHide={toast.hide}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  textDark: {
    color: '#ccc',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  hintDark: {
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  weekdayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
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
