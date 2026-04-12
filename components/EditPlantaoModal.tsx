import type { Plantao } from '@/data/plantaoDataSource';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

type Props = {
    visible: boolean;
    isDark: boolean;
    plantao: Plantao | null;
    onSave: (id: number | null, startTime: string, endTime: string, description: string | null) => void;
    onClose: () => void;
};

export default function EditPlantaoModal({ visible, isDark, plantao, onSave, onClose }: Props) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const isEditing = plantao !== null;

    useEffect(() => {
        if (plantao) {
            setStartTime(plantao.start_time.slice(0, 5));
            setEndTime(plantao.end_time.slice(0, 5));
            setDescription(plantao.description ?? '');
        } else {
            setStartTime('');
            setEndTime('');
            setDescription('');
        }
    }, [plantao]);

    const applyTimeMask = (text: string, setter: (v: string) => void) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        let masked = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 2) masked += ':';
            masked += digits[i];
        }
        setter(masked);
    };

    const handleSave = () => {
        onSave(plantao?.id ?? null, startTime, endTime, description.trim() || null);
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                    <View style={[styles.iconContainer, { backgroundColor: '#f59e0b18' }]}>
                        <FontAwesome5 name={isEditing ? 'edit' : 'plus'} size={28} color="#f59e0b" />
                    </View>
                    <Text style={[styles.title, isDark && styles.textDark]}>
                        {isEditing ? 'Editar Plantão' : 'Novo Plantão'}
                    </Text>

                    <View style={styles.timeRow}>
                        <View style={styles.timeField}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>De</Text>
                            <TextInput
                                value={startTime}
                                onChangeText={(t) => applyTimeMask(t, setStartTime)}
                                placeholder="HH:MM"
                                placeholderTextColor={isDark ? '#666' : '#aaa'}
                                keyboardType="numeric"
                                maxLength={5}
                                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                            />
                        </View>
                        <View style={styles.timeField}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Até</Text>
                            <TextInput
                                value={endTime}
                                onChangeText={(t) => applyTimeMask(t, setEndTime)}
                                placeholder="HH:MM"
                                placeholderTextColor={isDark ? '#666' : '#aaa'}
                                keyboardType="numeric"
                                maxLength={5}
                                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                            />
                        </View>
                    </View>

                    <Text style={[styles.label, isDark && styles.labelDark]}>Descrição</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descrição do plantão"
                        placeholderTextColor={isDark ? '#666' : '#aaa'}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, styles.textArea, isDark ? styles.inputDark : styles.inputLight]}
                    />

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
                            onPress={handleSave}
                            style={({ pressed }) => [
                                styles.button,
                                styles.saveBtn,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <Text style={styles.saveBtnText}>Salvar</Text>
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
        alignSelf: 'flex-start',
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
    },
    labelDark: {
        color: '#999',
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    timeField: {
        flex: 1,
    },
    input: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    inputLight: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        color: '#333',
    },
    inputDark: {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
        color: '#eee',
    },
    textArea: {
        minHeight: 70,
        textAlignVertical: 'top',
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
    cancelBtn: {
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#888',
    },
    saveBtn: {
        backgroundColor: '#f59e0b',
    },
    saveBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
