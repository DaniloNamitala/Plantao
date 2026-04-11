import CustomModal from '@/components/CustomModal';
import CustomToast from '@/components/CustomToast';
import EditPontoModal from '@/components/EditPontoModal';
import { useColorScheme } from '@/components/useColorScheme';
import { useModal } from '@/components/useModal';
import { useToast } from '@/components/useToast';
import type { Ponto } from '@/data/pontoDataSource';
import pontoService from '@/service/pontoService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Directions, Gesture, GestureDetector, Swipeable } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RegistroPontoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [records, setRecords] = useState<Ponto[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showBtnClock, setShowBtnClock] = useState(true);
  const [showBtnAddTime, setShowBtnAddTime] = useState(true);
  const modal = useModal();
  const toast = useToast();
  const [editingPonto, setEditingPonto] = useState<Ponto | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const openSwipeableRef = useRef<Swipeable | null>(null);
  const swipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateX = useSharedValue(0);

  const animatedListStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const closeSwipeable = () => {
    if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
    swipeTimerRef.current = null;
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  };

  const startAutoClose = (swipeable: Swipeable) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== swipeable) {
      openSwipeableRef.current.close();
    }
    if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
    openSwipeableRef.current = swipeable;
    swipeTimerRef.current = setTimeout(() => {
      openSwipeableRef.current?.close();
      openSwipeableRef.current = null;
      swipeTimerRef.current = null;
    }, 3000);
  };

  const formatDateToISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadRecords = useCallback(async () => {
    const dateStr = formatDateToISO(selectedDate);
    const data = await pontoService.getByDate(dateStr);
    setRecords(data);
  }, [selectedDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    let showBtnClock = selectedDate.getDate() === new Date().getDate();
    let showBtnAddTime = selectedDate.getDate() < new Date().getDate();
    setShowBtnClock(showBtnClock);
    setShowBtnAddTime(showBtnAddTime);
  }, [selectedDate]);

  const applyDateChange = (offset: number, exitDir: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
    translateX.value = -exitDir * SCREEN_WIDTH;
    translateX.value = withTiming(0, { duration: 200 });
  };

  const changeDay = (offset: number) => {
    const exitDir = offset > 0 ? -1 : 1;
    translateX.value = withTiming(exitDir * SCREEN_WIDTH, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(applyDateChange)(offset, exitDir);
      }
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

  const handleClockIn = async () => {
    const now = new Date();
    const date = formatDateToISO(now);
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const lastRecord = records.length > 0 ? records[records.length - 1] : null;
    const type: 'in' | 'out' = lastRecord?.type === 'in' ? 'out' : 'in';

    try {
      let timeNoSeconds = time.substring(0, 5);
      await pontoService.create(date, timeNoSeconds, type);
      await loadRecords();
    } catch (e: any) {
      modal.show({ icon: 'times-circle', iconColor: '#ef4444', title: 'Erro', message: e.message });
    }
  };

  async function Authenticate(callback: () => void) {
    let result: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique-se para registrar seu ponto',
      fallbackLabel: 'Use sua senha',
    });
    if (result.success) {
      callback();
    } else {
      toast.show({ text: 'Autenticação falhou. Tente novamente.', color: '#ef4444', icon: 'times-circle' });
    }
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const handleDelete = async (id: number) => {
    closeSwipeable();
    modal.show({
      icon: 'trash',
      iconColor: '#ef4444',
      title: 'Excluir Registro',
      message: 'Tem certeza que deseja excluir este registro?',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          await pontoService.delete(id);
          await loadRecords();
        } catch (e: any) {
          modal.show({ icon: 'times-circle', iconColor: '#ef4444', title: 'Erro', message: e.message });
        }
      },
    });
  };

  const handleEdit = (item: Ponto) => {
    closeSwipeable();
    setEditingPonto(item);
    setEditModalVisible(true);
  };

  const handleEditSave = async (id: number | null, time: string, type: 'in' | 'out') => {
    try {
      if (id !== null) {
        await pontoService.update(id, time, type);
      } else {
        const date = formatDateToISO(selectedDate);
        await pontoService.create(date, time, type);
      }
      setEditModalVisible(false);
      setEditingPonto(null);
      await loadRecords();
    } catch (e: any) {
      modal.show({ icon: 'times-circle', iconColor: '#ef4444', title: 'Erro', message: e.message });
    }
  };

  const renderRightActions = (item: Ponto) => {
    return (
      <View style={styles.swipeActions}>
        <Pressable
          style={[styles.swipeBtn, styles.swipeBtnEdit]}
          onPress={() => handleEdit(item)}
        >
          <FontAwesome5 name="edit" size={18} color="#fff" />
          <Text style={styles.swipeBtnText}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.swipeBtn, styles.swipeBtnDelete]}
          onPress={() => handleDelete(item.id)}
        >
          <FontAwesome5 name="trash" size={18} color="#fff" />
          <Text style={styles.swipeBtnText}>Excluir</Text>
        </Pressable>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Ponto; index: number }) => {
    const isIn = item.type === 'in';
    const accentColor = isIn ? '#22c55e' : '#ef4444';

    let swipeRef: Swipeable | null = null;

    return (
      <Swipeable
        ref={(ref) => { swipeRef = ref; }}
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
        onSwipeableOpen={() => { if (swipeRef) startAutoClose(swipeRef); }}
        onSwipeableClose={() => {
          if (openSwipeableRef.current === swipeRef) {
            if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
            swipeTimerRef.current = null;
            openSwipeableRef.current = null;
          }
        }}
      >
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
              {item.date.split('-').reverse().join('/')}
            </Text>
          </View>
          <Text style={[styles.cardTime, isDark && styles.textDark]}>
            {item.time.slice(0, 5)}
          </Text>
        </View>
      </Swipeable>
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

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => { runOnJS(changeDay)(1); });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => { runOnJS(changeDay)(-1); });

  const flingGesture = Gesture.Race(flingLeft, flingRight);

  return (
    <GestureDetector gesture={flingGesture}>
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
      <Animated.View style={[{ flex: 1, overflow: 'hidden' }, animatedListStyle]}>
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.list,
            records.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
      {showBtnClock && (<Pressable
        onPress={() => Authenticate(handleClockIn)}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <FontAwesome5 name="fingerprint" size={28} color="#fff" />
      </Pressable>)}
      {showBtnAddTime && (<Pressable
        onPress={() => { setEditingPonto(null); setEditModalVisible(true); }}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <FontAwesome5 name="plus" size={28} color="#fff" />
      </Pressable>)}
      <CustomModal
        visible={modal.visible}
        isDark={isDark}
        config={modal.config}
        onClose={modal.hide}
      />
      <EditPontoModal
        visible={editModalVisible}
        isDark={isDark}
        ponto={editingPonto}
        onSave={handleEditSave}
        onClose={() => { setEditModalVisible(false); setEditingPonto(null); }}
      />
      <CustomToast
        visible={toast.visible}
        config={toast.config}
        onHide={toast.hide}
      />
      </View>
    </GestureDetector>
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
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 1,
  },
  swipeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  swipeBtnEdit: {
    backgroundColor: '#3b82f6',
  },
  swipeBtnDelete: {
    backgroundColor: '#ef4444',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  swipeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
