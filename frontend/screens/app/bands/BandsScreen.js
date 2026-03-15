import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BandEndpoints from '../../../api/BandEndpoints'
import Band from '../../../components/Band'
import BottomSheet from '../../../components/BottomSheet'
import Input from '../../../components/Input'
import LinkText from '../../../components/LinkText'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyles from '../../../GlobalStyle'

const BandsScreen = () => {
    const [bands, setBands] = useState([])
    const [uploading, setUploading] = useState(false);
    const [code, setCode] = useState('')
    const navigation = useNavigation()
    const sheetRef = useRef(null)
    const codeSheetRef = useRef(null)
    const {user} = useContext(AuthContext);
    const snapPoints = useMemo(() => ['70%'], [])
    const codeSnapPoints = useMemo(() => ['35%'], [])

    useFocusEffect(
        useCallback(() => {
            // Refresh bands when returning to the screen
            fetchBands();
        }, [])
    );

    const fetchBands = async () => {
        try {
            const bands = await BandEndpoints.listMyBands();
            setBands(bands);
        } catch (error) {
            console.error("Error fetching bands:", error);
        }
    }

    const findBandByCode = async () => {
        try {
            const band = await BandEndpoints.findBandByCode(code);
            closeCodeSheet();
            setCode('');
            if (band?.components?.some(component => component.musicianId === user.musician?.id)) {
                navigation.navigate('BandDetails', { band });
            } else {
                navigation.navigate('BandInstruments', { band });
            }
        } catch (error) {
            const errorMessage = error?.message || 'No se encontró ninguna banda con ese código.';
            Alert.alert('Error', errorMessage);
            return null;
        }
    }

    const openSheet = () => {
        sheetRef.current?.present();
    }

    const closeSheet = () => {
        sheetRef.current?.dismiss();
    }

    const openCodeSheet = () => {
        codeSheetRef.current?.present();
    }

    const closeCodeSheet = () => {
        codeSheetRef.current?.dismiss();
    }

    return (
        <View>
            <TopContainer
                backEnabled={false}
                editEnabled={false}
                createEnabled={true}
                onCreate={openSheet}
                style={{ paddingBottom: 24, paddingTop: 18, alignItems: 'none' }}>
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
                ListEmptyComponent={
                    <Text style={styles.noBandsText}> {`No perteneces a ninguna banda.\n`} <LinkText onPress={openSheet}>Crea una nueva <Text style={{color: GlobalStyles.gray }}>o</Text> Únete a una</LinkText></Text>
                }
                contentContainerStyle={{ paddingBottom: 150 }}
            />
            {/* BOTTOM SHEET MODAL */}
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
                <TouchableOpacity
                    disabled={uploading}
                    onPress={() => {
                        closeSheet();
                        openCodeSheet();
                    }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', marginTop: 6, opacity: uploading ? 0.6 : 1 }}
                >
                    <Text style={{ color: '#111827', fontWeight: '600', marginTop: 8 }}>Unirse a una banda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={uploading}
                    onPress={() => {
                        closeSheet();
                        navigation.navigate('BandForm')
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
            {/* BOTTOM SHEET MODAL TO JOIN BAND */}
            <BottomSheet sheetRef={codeSheetRef} snapPoints={codeSnapPoints} style={{ gap: 10 }}>
                <Input
                    placeholder="Introduce el código de la banda"
                    value={code}
                    onChangeText={setCode}
                    label={'Utiliza el código proporcionado por tu banda'}
                />
                <TouchableOpacity
                    onPress={findBandByCode}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: `${GlobalStyles.yellow}a9`, alignItems: 'center', marginTop: 6 }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Unirse</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        closeCodeSheet();
                        setCode('');
                    }}
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
        fontSize: 36,
        fontFamily: 'BebasNeue'
    },
    noBandsText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    }
})