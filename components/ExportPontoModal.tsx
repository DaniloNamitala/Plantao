import { useColorScheme } from '@/components/useColorScheme';
import pontoService from '@/service/pontoService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
};

function formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDateDisplay(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ExportPontoModal({ visible, onClose }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onStartChange = (_event: DateTimePickerEvent, date?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (date) setStartDate(date);
    };

    const onEndChange = (_event: DateTimePickerEvent, date?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (date) setEndDate(date);
    };

    const handleExport = async () => {
        if (startDate > endDate) {
            setError('Data inicial deve ser anterior à data final.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await pontoService.exportPdf(formatDateToISO(startDate), formatDateToISO(endDate));
            onClose();
        } catch (e: any) {
            setError(e.message ?? 'Erro ao exportar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                    <View style={[styles.iconContainer, { backgroundColor: '#2f95dc18' }]}>
                        <FontAwesome5 name="file-pdf" size={28} color="#2f95dc" />
                    </View>
                    <Text style={[styles.title, isDark && styles.textDark]}>Exportar Ponto</Text>

                    <View style={styles.dateRow}>
                        <View style={styles.dateField}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>De</Text>
                            <Pressable
                                onPress={() => setShowStartPicker(true)}
                                style={[styles.dateBtn, isDark && styles.dateBtnDark]}
                            >
                                <FontAwesome5 name="calendar-alt" size={14} color="#2f95dc" />
                                <Text style={[styles.dateBtnText, isDark && styles.textDark]}>
                                    {formatDateDisplay(startDate)}
                                </Text>
                            </Pressable>
                        </View>
                        <View style={styles.dateField}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Até</Text>
                            <Pressable
                                onPress={() => setShowEndPicker(true)}
                                style={[styles.dateBtn, isDark && styles.dateBtnDark]}
                            >
                                <FontAwesome5 name="calendar-alt" size={14} color="#2f95dc" />
                                <Text style={[styles.dateBtnText, isDark && styles.textDark]}>
                                    {formatDateDisplay(endDate)}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                            onChange={onStartChange}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                            onChange={onEndChange}
                        />
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.button,
                                styles.cancelBtn,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleExport}
                            disabled={loading}
                            style={({ pressed }) => [
                                styles.button,
                                styles.exportBtn,
                                pressed && styles.buttonPressed,
                                loading && styles.buttonDisabled,
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.exportBtnText}>Exportar PDF</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    cardLight: {
        backgroundColor: '#fff',
    },
    cardDark: {
        backgroundColor: '#1e1e1e',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    textDark: {
        color: '#ccc',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
    },
    labelDark: {
        color: '#999',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 16,
    },
    dateField: {
        flex: 1,
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f5f5f5',
    },
    dateBtnDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
    },
    dateBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        marginBottom: 12,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelBtn: {
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#888',
    },
    exportBtn: {
        backgroundColor: '#2f95dc',
    },
    exportBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
