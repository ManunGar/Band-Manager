import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as GlobalStyle from '../GlobalStyle';

const ImagePicker = ({ sheetRef }) => {

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

    const insets = useSafeAreaInsets();

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: GlobalStyle.gray }}
            backgroundStyle={{ backgroundColor: GlobalStyle.white, borderRadius: 16 }}
            keyboardBehavior="interactive"       
            keyboardBlurBehavior="restore"       
        >
            <BottomSheetView style={{ padding: 16, gap: 10 }}>
                <TouchableOpacity
                    onPress={() => { console.log('Galería'); closeSheet(); }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Elegir de la galería</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { console.log('Cámara'); closeSheet(); }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Tomar una foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { console.log('Eliminar'); closeSheet(); }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: GlobalStyle.red }}>Eliminar foto actual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={closeSheet}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

export default ImagePicker