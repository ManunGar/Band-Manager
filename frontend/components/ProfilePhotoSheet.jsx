import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';
import { pickFromLibrary, takePhoto, toUploadableJpeg } from '../helpers/ImageHelpers';
import BottomSheet from './BottomSheet';

const ProfilePhotoSheet = ({ sheetRef, onUploaded, deleteProfilePicture, uploadingFunction }) => {
    const [uploading, setUploading] = useState(false);
    const snapPoints = useMemo(() => ['40%'], [])

    const closeSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const uploadingProfilePicture = async (uri) => {
        try {
            setUploading(true);
            await uploadingFunction(uri)
            onUploaded?.();
        } catch (error) {
            console.log("🚀 ~ uploadingProfilePicture ~ error:", error)
            Alert.alert('Error', error.message || 'Hubo un error al subir la imagen.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
            {/* Choose from Library */}
            <TouchableOpacity
                disabled={uploading}
                onPress={async () => {
                    try {
                        const uri = await pickFromLibrary();
                        if (!uri) return;
                        const jpeg = await toUploadableJpeg(uri);
                        await uploadingProfilePicture(jpeg);
                    } finally {
                        closeSheet();
                    }
                }}
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', opacity: uploading ? 0.6 : 1 }}
            >
                {uploading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Elegir de la galería</Text>
                )}
            </TouchableOpacity>
            {/* Take Photo */}
            <TouchableOpacity
                disabled={uploading}
                onPress={async () => {
                    try {
                        const uri = await takePhoto();
                        if (!uri) return;
                        const jpeg = await toUploadableJpeg(uri);
                        await uploadingProfilePicture(jpeg);
                    } finally {
                        closeSheet();
                    }
                }}
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', opacity: uploading ? 0.6 : 1 }}
            >
                {uploading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Tomar una foto</Text>
                )}
            </TouchableOpacity>
            {/* Delete Photo */}
            <TouchableOpacity
                onPress={async () => {
                    try {
                        await deleteProfilePicture();
                        onUploaded?.();
                    } finally {
                        closeSheet();
                    }
                }}
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center' }}
            >
                <Text style={{ fontWeight: '600', color: GlobalStyle.red }}>Eliminar foto actual</Text>
            </TouchableOpacity>
            {/* Cancel Button */}
            <TouchableOpacity
                disabled={uploading}
                onPress={closeSheet}
                style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' }}
            >
                <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
            </TouchableOpacity>
        </BottomSheet>

    )
}

export default ProfilePhotoSheet