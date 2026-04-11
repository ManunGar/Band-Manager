import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';
import { useToast } from '../contexts/ToastContext';
import { pickFromLibrary, takePhoto, toUploadableJpeg } from '../helpers/ImageHelpers';
import BottomSheet from './BottomSheet';

const ImagePickerSheet = ({ sheetRef, imagePreview, onImageSelected, onImageRemoved, aspect = [1, 1] }) => {
    const snapPoints = useMemo(() => ['30%'], []);
    const permissionSnapPoints = useMemo(() => ['38%'], []);
    const [loading, setLoading] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState('');
    const { showToast } = useToast();
    const settingsSheetRef = useRef(null);

    const openSettingsPrompt = (message) => {
        setSettingsMessage(message);
        sheetRef.current?.dismiss();
        setTimeout(() => settingsSheetRef.current?.present(), 140);
    };

    // Handle image selection from library
    const handlePickFromLibrary = async () => {
        try {
            const uri = await pickFromLibrary(aspect, ({ message, needsSettings }) => {
                if (needsSettings) {
                    openSettingsPrompt(message);
                    return;
                }

                showToast('Permiso requerido', message, 'warning');
            });
            if (!uri) return;
            setLoading(true);
            const jpeg = await toUploadableJpeg(uri);
            await onImageSelected(jpeg);
        } catch (error) {
            showToast('Error', 'No se pudo cargar la imagen', 'error');
        } finally {
            setLoading(false);
            sheetRef.current?.dismiss();
        }
    };

    // Handle taking a photo
    const handleTakePhoto = async () => {
        try {
            const uri = await takePhoto(aspect, ({ message, needsSettings }) => {
                if (needsSettings) {
                    openSettingsPrompt(message);
                    return;
                }

                showToast('Permiso requerido', message, 'warning');
            });
            if (!uri) return;
            setLoading(true);
            const jpeg = await toUploadableJpeg(uri);
            await onImageSelected(jpeg);
        } catch (error) {
            showToast('Error', 'No se pudo tomar la foto', 'error');
        } finally {
            setLoading(false);
            sheetRef.current?.dismiss();
        }
    };

    // Handle removing the selected image
    const handleRemoveImage = async () => {
        try {
            setLoading(true);
            await onImageRemoved();
        } catch (error) {
            showToast('Error', 'No se pudo eliminar la imagen', 'error');
        } finally {
            setLoading(false);
            sheetRef.current?.dismiss();
        }
    };

    return (
        <>
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }}>
                <TouchableOpacity
                    onPress={handlePickFromLibrary}
                    disabled={loading}
                    style={[styles.bottomSheetOption, loading && styles.disabledOption]}
                >
                    {loading ? (
                        <ActivityIndicator color="#111827" />
                    ) : (
                        <Text style={styles.bottomSheetOptionText}>Elegir de la galería</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleTakePhoto}
                    disabled={loading}
                    style={[styles.bottomSheetOption, loading && styles.disabledOption]}
                >
                    {loading ? (
                        <ActivityIndicator color="#111827" />
                    ) : (
                        <Text style={styles.bottomSheetOptionText}>Tomar una foto</Text>
                    )}
                </TouchableOpacity>
                {imagePreview && (
                    <TouchableOpacity
                        onPress={handleRemoveImage}
                        disabled={loading}
                        style={[styles.bottomSheetOption, styles.deleteOption, loading && styles.disabledOption]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#dc2626" />
                        ) : (
                            <Text style={styles.deleteOptionText}>Eliminar imagen</Text>
                        )}
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={() => sheetRef.current?.dismiss()}
                    disabled={loading}
                    style={[styles.bottomSheetOption, styles.cancelOption, loading && styles.disabledOption]}
                >
                    <Text style={styles.bottomSheetOptionText}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheet>

            <BottomSheet sheetRef={settingsSheetRef} snapPoints={permissionSnapPoints} style={{ gap: 12 }}>
                <Text style={styles.sheetTitle}>Permiso requerido</Text>
                <Text style={styles.sheetMessage}>{settingsMessage}</Text>
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => {
                        settingsSheetRef.current?.dismiss();
                        Linking.openSettings();
                    }}
                >
                    <Text style={styles.primaryActionText}>Abrir ajustes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => settingsSheetRef.current?.dismiss()}
                >
                    <Text style={styles.secondaryActionText}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheet>
        </>
    );
};

export default ImagePickerSheet;

const styles = StyleSheet.create({
    bottomSheetOption: {
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        alignItems: 'center'
    },
    bottomSheetOptionText: {
        fontWeight: '600',
        color: '#111827'
    },
    deleteOption: {
        backgroundColor: '#fef2f2'
    },
    deleteOptionText: {
        fontWeight: '600',
        color: '#dc2626'
    },
    cancelOption: {
        backgroundColor: '#e5e7eb'
    },
    disabledOption: {
        opacity: 0.5
    },
    sheetTitle: {
        fontSize: 22,
        fontFamily: 'Oswald_600',
        color: GlobalStyle.black,
        textAlign: 'center',
    },
    sheetMessage: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    primaryAction: {
        backgroundColor: `${GlobalStyle.yellow}d4`,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryActionText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
    secondaryAction: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryActionText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
    }
});
