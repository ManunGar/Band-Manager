import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import * as GlobalStyle from '../GlobalStyle';
import { assertSizeLT3MB, pickFromLibrary, takePhoto, toUploadableJpeg } from '../helpers/ImageHelpers';

const ProfilePhotoSheet = ({ sheetRef, onUploaded }) => {
    const { editProfilePicture } = useContext(AuthContext);
    const [uploading, setUploading] = useState(false);
    const snapPoints = useMemo(() => ['40%'], [])

    const closeSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close" // tap outside to close
            />
        ),
        []
    );

    const uploadingProfilePicture = async (uri) => {
        try {
            setUploading(true);
            await assertSizeLT3MB(uri);
            const form = new FormData();
            form.append('profile_picture', {
                uri: uri,
                name: `avatar_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            await editProfilePicture(form);
            onUploaded?.();
        } catch (error) {
            Alert.alert('Error', error.message || 'Hubo un error al subir la imagen.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={!uploading}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: GlobalStyle.gray }}
            backgroundStyle={{ backgroundColor: GlobalStyle.white, borderRadius: 16 }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
        >
            <BottomSheetView style={{ padding: 16, gap: 10 }}>
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

                <TouchableOpacity
                    onPress={() => { console.log('Eliminar'); closeSheet(); }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: GlobalStyle.red }}>Eliminar foto actual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={uploading}
                    onPress={closeSheet}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

export default ProfilePhotoSheet