import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import * as GlobalStyle from '../GlobalStyle';

const BottomSheet = ({sheetRef, snapPoints, style, children, uploading}) => {
    
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
                <BottomSheetView style={[{ padding: 16 }, style]}>
                    {children}
                </BottomSheetView>
        </BottomSheetModal>
    )
  }

export default BottomSheet