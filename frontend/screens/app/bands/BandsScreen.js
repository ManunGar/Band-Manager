import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BandEndpoints from '../../../api/BandEndpoints'
import Band from '../../../components/Band'
import BottomSheet from '../../../components/BottomSheet'
import TopContainer from '../../../components/TopContainer'
import * as GlobalStyles from '../../../GlobalStyle'

const BandsScreen = () => {
    const [bands, setBands] = useState([])
    const [uploading, setUploading] = useState(false);
    const [code, setCode] = useState('')
    const navigation = useNavigation()
    const sheetRef = useRef(null)
    const snapPoints = useMemo(() => ['70%'], [])

    useFocusEffect(
        useCallback(() => {
            // Refresh bands when returning to the screen
            fetchBands();
        }, [])
    );

    const fetchBands = async () => {
        try {
            const bands = await BandEndpoints.listMyBands();
            setBands(bands.bands);
        } catch (error) {
            console.error("Error fetching bands:", error);
        }
    }

    const openSheet = () => {
        sheetRef.current?.present();
    }

    const closeSheet = () => {
        sheetRef.current?.dismiss();
    }

    return (
        <View>
            <TopContainer
                backEnabled={false}
                editEnabled={false}
                createEnabled={true}
                onCreate={openSheet}
                style={{ paddingBottom: 24, paddingTop: 24, alignItems: 'none' }}>
                <Text style={styles.title}>Bandas</Text>
            </TopContainer>
            <FlatList
                data={bands}
                style={{ paddingHorizontal: 25 }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Band band={item} />
                )}
                ItemSeparatorComponent={() => <View style={{ paddingTop: 12 }}></View>}
                ListEmptyComponent={<Text style={styles.noBandsText}>No perteneces a ninguna banda</Text>}
            />
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
                <TouchableOpacity
                    disabled={uploading || code.trim() === ''}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', marginTop: 6, opacity: uploading ? 0.6 : 1 }}
                >
                    <Text style={{ color: '#111827', fontWeight: '600', marginTop: 8 }}>Unirse a una banda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={uploading}
                    onPress={() => {
                        closeSheet();
                        navigation.navigate('CreateBand')
                    }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: `${GlobalStyles.yellow}a9`, alignItems: 'center', opacity: uploading ? 0.6 : 1 }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Crear una banda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={uploading}
                    onPress={closeSheet}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheet>
        </View>
    )
}

export default BandsScreen

const styles = StyleSheet.create({
    title: {
        fontSize: 40,
        fontFamily: 'BebasNeue'
    },
    noBandsText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    }
})