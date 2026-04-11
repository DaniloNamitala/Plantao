import type { Ponto } from '@/data/pontoDataSource';
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
    ponto: Ponto | null;
    onSave: (id: number | null, time: string, type: 'in' | 'out') => void;
    onClose: () => void;
};

export default function EditPontoModal({ visible, isDark, ponto, onSave, onClose }: Props) {
    const [time, setTime] = useState('');
    const [type, setType] = useState<'in' | 'out'>('in');
    const isEditing = ponto !== null;

    useEffect(() => {
        if (ponto) {
            setTime(ponto.time);
            setType(ponto.type);
        } else {
            setTime('');
            setType('in');
        }
    }, [ponto]);

    const applyTimeMask = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        let masked = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 2) masked += ':';
            masked += digits[i];
        }
        setTime(masked);
    };

    const handleSave = () => {
        onSave(ponto?.id ?? null, time, type);
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
                    <View style={[styles.iconContainer, { backgroundColor: '#2f95dc18' }]}>
                        <FontAwesome5 name={isEditing ? 'edit' : 'plus'} size={28} color="#2f95dc" />
                    </View>
                    <Text style={[styles.title, isDark && styles.textDark]}>
                        {isEditing ? 'Editar Registro' : 'Novo Registro'}
                    </Text>

                    <Text style={[styles.label, isDark && styles.labelDark]}>Horário</Text>
                    <TextInput
                        value={time}
                        onChangeText={applyTimeMask}
                        placeholder="HH:MM"
                        placeholderTextColor={isDark ? '#666' : '#aaa'}
                        keyboardType="numeric"
                        maxLength={5}
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    />

                    <Text style={[styles.label, isDark && styles.labelDark]}>Tipo</Text>
                    <View style={styles.typeRow}>
                        <Pressable
                            onPress={() => setType('in')}
                            style={[
                                styles.typeBtn,
                                type === 'in' && styles.typeBtnActiveIn,
                                type !== 'in' && (isDark ? styles.typeBtnInactiveDark : styles.typeBtnInactive),
                            ]}
                        >
                            <FontAwesome5 name="sign-in-alt" size={14} color={type === 'in' ? '#fff' : (isDark ? '#ccc' : '#555')} />
                            <Text style={[styles.typeBtnText, type === 'in' && styles.typeBtnTextActive]}>
                                Entrada
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setType('out')}
                            style={[
                                styles.typeBtn,
                                type === 'out' && styles.typeBtnActiveOut,
                                type !== 'out' && (isDark ? styles.typeBtnInactiveDark : styles.typeBtnInactive),
                            ]}
                        >
                            <FontAwesome5 name="sign-out-alt" size={14} color={type === 'out' ? '#fff' : (isDark ? '#ccc' : '#555')} />
                            <Text style={[styles.typeBtnText, type === 'out' && styles.typeBtnTextActive]}>
                                Saída
                            </Text>
                        </Pressable>
                    </View>

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
        borderColor: '#444',
        color: '#ccc',
    },
    typeRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 24,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeBtnInactive: {
        borderColor: '#e0e0e0',
        backgroundColor: '#f5f5f5',
    },
    typeBtnInactiveDark: {
        borderColor: '#444',
        backgroundColor: '#2a2a2a',
    },
    typeBtnActiveIn: {
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
    },
    typeBtnActiveOut: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    typeBtnTextActive: {
        color: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelBtnText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#2f95dc',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
