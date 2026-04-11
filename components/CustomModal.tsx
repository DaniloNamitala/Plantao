import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function CustomModal({ visible, isDark, config, onClose }: {
    visible: boolean;
    isDark: boolean;
    config: { icon: string; iconColor: string; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm?: () => void };
    onClose: () => void;
}) {
    const isConfirmMode = !!config.onConfirm;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}>
                    <View style={[styles.modalIcon, { backgroundColor: config.iconColor + '18' }]}>
                        <FontAwesome5 name={config.icon} size={28} color={config.iconColor} />
                    </View>
                    <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                        {config.title}
                    </Text>
                    <Text style={[styles.modalMessage, isDark && styles.modalMessageDark]}>
                        {config.message}
                    </Text>
                    {isConfirmMode ? (
                        <View style={styles.modalButtonRow}>
                            <Pressable
                                onPress={onClose}
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    styles.modalButtonCancel,
                                    pressed && styles.modalButtonPressed,
                                ]}
                            >
                                <Text style={styles.modalButtonCancelText}>{config.cancelLabel || 'Cancelar'}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => { config.onConfirm?.(); onClose(); }}
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    styles.modalButtonConfirm,
                                    pressed && styles.modalButtonPressed,
                                ]}
                            >
                                <Text style={styles.modalButtonText}>{config.confirmLabel || 'Confirmar'}</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.modalButton,
                                pressed && styles.modalButtonPressed,
                            ]}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
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
    textDark: {
        color: '#ccc',
    },
    modalCardLight: {
        backgroundColor: '#fff',
    },
    modalCardDark: {
        backgroundColor: '#1e1e1e',
    },
    modalIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalMessageDark: {
        color: '#999',
    },
    modalButton: {
        backgroundColor: '#2f95dc',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 48,
    },
    modalButtonPressed: {
        opacity: 0.85,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButtonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 24,
    },
    modalButtonCancelText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonConfirm: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 24,
    },
})