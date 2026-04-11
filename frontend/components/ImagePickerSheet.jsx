import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { pickFromLibrary, takePhoto, toUploadableJpeg } from '../helpers/ImageHelpers';
import BottomSheet from './BottomSheet';

const ImagePickerSheet = ({ sheetRef, imagePreview, onImageSelected, onImageRemoved, aspect = [1, 1] }) => {
    const snapPoints = useMemo(() => ['30%'], []);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Handle image selection from library
    const handlePickFromLibrary = async () => {
        try {
            const uri = await pickFromLibrary(aspect, (message) => {
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
            const uri = await takePhoto(aspect, (message) => {
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
    }
});
