import CustomModal from '@/components/CustomModal';
import { useColorScheme } from '@/components/useColorScheme';
import { useModal } from '@/components/useModal';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as LocalAuthentication from 'expo-local-authentication';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

type ClockRecord = {
  id: string;
  type: 'in' | 'out';
  date: Date;
};

export default function RegistroPontoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const modal = useModal();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const filteredRecords = useMemo(
    () => records.filter((r) => isSameDay(r.date, selectedDate)),
    [records, selectedDate]
  );

  const changeDay = (offset: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const onPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) setSelectedDate(date);
  };

  const formatSelectedDate = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'Hoje';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Ontem';
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleClockIn = () => {
    const now = new Date();
    const lastRecord = records.length > 0 ? records[0] : null;
    const type: 'in' | 'out' = lastRecord?.type === 'in' ? 'out' : 'in';

    setRecords((prev) => [
      { id: Date.now().toString(), type, date: now },
      ...prev,
    ]);
  };

  async function Authenticate(callback: () => void) {
    let result : LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique-se para registrar seu ponto',
      fallbackLabel: 'Use sua senha',
    });
    if (result.success) {
      callback();
    } else {
      modal.show({ icon: 'times-circle', iconColor: '#ef4444', title: 'Falha na Autenticação', message: 'Autenticação falhou. Tente novamente.' });
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderItem = ({ item, index }: { item: ClockRecord; index: number }) => {
    const isIn = item.type === 'in';
    const accentColor = isIn ? '#22c55e' : '#ef4444';

    return (
      <View
        style={[
          styles.card,
          isDark ? styles.cardDark : styles.cardLight,
          { borderLeftColor: accentColor },
          index === 0 && styles.cardFirst,
        ]}
      >
        <View style={[styles.badge, { backgroundColor: accentColor + '18' }]}>
          <FontAwesome5
            name={isIn ? 'sign-in-alt' : 'sign-out-alt'}
            size={16}
            color={accentColor}
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardType, { color: accentColor }]}>
            {isIn ? 'Entrada' : 'Saída'}
          </Text>
          <Text style={[styles.cardDate, isDark && styles.textDark]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text style={[styles.cardTime, isDark && styles.textDark]}>
          {formatTime(item.date)}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5
        name="clock"
        size={64}
        color={isDark ? '#555' : '#ccc'}
      />
      <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        Nenhum registro ainda
      </Text>
      <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
        Toque no botão para registrar seu ponto
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.dateBar]}>
        <Pressable onPress={() => changeDay(-1)} style={styles.dateArrow}>
          <FontAwesome5 name="chevron-left" size={16} color={isDark ? '#ccc' : '#555'} />
        </Pressable>
        <Pressable onPress={() => setShowPicker(true)} style={styles.dateBadge}>
          <FontAwesome5 name="calendar-alt" size={14} color="#2f95dc" style={{ marginRight: 8 }} />
          <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
            {formatSelectedDate(selectedDate)}
          </Text>
        </Pressable>
        <Pressable onPress={() => changeDay(1)} style={styles.dateArrow}>
          <FontAwesome5 name="chevron-right" size={16} color={isDark ? '#ccc' : '#555'} />
        </Pressable>
      </View>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={onPickerChange}
        />
      )}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          records.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={() => Authenticate(handleClockIn)}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <FontAwesome5 name="fingerprint" size={28} color="#fff" />
      </Pressable>
      <CustomModal
        visible={modal.visible}
        isDark={isDark}
        config={modal.config}
        onClose={modal.hide}
      />
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
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 150,
    backgroundColor: 'rgba(47,149,220,0.1)',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  dateTextDark: {
    color: '#ccc',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardFirst: {
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardType: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  cardTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  textDark: {
    color: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptyTextDark: {
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  emptySubtextDark: {
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2f95dc',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#2f95dc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  }
});
