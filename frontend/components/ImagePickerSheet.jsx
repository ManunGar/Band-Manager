import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { pickFromLibrary, takePhoto, toUploadableJpeg } from '../helpers/ImageHelpers';
import BottomSheet from './BottomSheet';

const ImagePickerSheet = ({ sheetRef, imagePreview, onImageSelected, onImageRemoved }) => {
    const snapPoints = useMemo(() => ['30%'], []);

    // Handle image selection from library
    const handlePickFromLibrary = async () => {
        try {
            const uri = await pickFromLibrary();
            if (!uri) return;
            const jpeg = await toUploadableJpeg(uri);
            onImageSelected(jpeg);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la imagen');
        } finally {
            sheetRef.current?.dismiss();
        }
    };

    // Handle taking a photo
    const handleTakePhoto = async () => {
        try {
            const uri = await takePhoto();
            if (!uri) return;
            const jpeg = await toUploadableJpeg(uri);
            onImageSelected(jpeg);
        } catch (error) {
            Alert.alert('Error', 'No se pudo tomar la foto');
        } finally {
            sheetRef.current?.dismiss();
        }
    };

    // Handle removing the selected image
    const handleRemoveImage = () => {
        onImageRemoved();
        sheetRef.current?.dismiss();
    };

    return (
        <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }}>
            <TouchableOpacity
                onPress={handlePickFromLibrary}
                style={styles.bottomSheetOption}
            >
                <Text style={styles.bottomSheetOptionText}>Elegir de la galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleTakePhoto}
                style={styles.bottomSheetOption}
            >
                <Text style={styles.bottomSheetOptionText}>Tomar una foto</Text>
            </TouchableOpacity>
            {imagePreview && (
                <TouchableOpacity
                    onPress={handleRemoveImage}
                    style={[styles.bottomSheetOption, styles.deleteOption]}
                >
                    <Text style={styles.deleteOptionText}>Eliminar imagen</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                onPress={() => sheetRef.current?.dismiss()}
                style={[styles.bottomSheetOption, styles.cancelOption]}
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
    }
});
