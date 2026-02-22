import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as GlobalStyle from '../GlobalStyle';

const BottomSheet = ({ sheetRef, snapPoints, style, children, uploading }) => {
    const insets = useSafeAreaInsets();

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
            <BottomSheetScrollView
                style={style}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: insets.bottom,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={style}>
                    {children}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    )
}

export default BottomSheet