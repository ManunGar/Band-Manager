import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BandEndpoints from '../../../api/BandEndpoints'
import Band from '../../../components/Band'
import BottomSheet from '../../../components/BottomSheet'
import Input from '../../../components/Input'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyles from '../../../GlobalStyle'

const BandsScreen = () => {
    const [bands, setBands] = useState([])
    const [uploading, setUploading] = useState(false);
    const [code, setCode] = useState('')
    const [visible, setVisible] = useState(false)
    const navigation = useNavigation()
    const sheetRef = useRef(null)
    const {user} = useContext(AuthContext);
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

    const findBandByCode = async () => {
        try {
            const band = await BandEndpoints.findBandByCode(code);
            setVisible(false);
            setCode('');
            if (band?.band?.components?.some(component => component.musicianId === user.musician?.id)) {
                navigation.navigate('BandDetails', { band: band.band });
            } else {
                navigation.navigate('JoinBand', { band: band.band });
            }
        } catch (error) {
            Alert.alert('Error', 'No se encontró ninguna banda con ese código.');
            return null;
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
            {/* BOTTOM SHEET MODAL */}
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
                <TouchableOpacity
                    disabled={uploading}
                    onPress={() => {
                        closeSheet();
                        setVisible(true);
                    }}
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
            {/* MODAL */}
            <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={() => { setVisible(false), setCode('') }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ backgroundColor: GlobalStyles.white, padding: 25, paddingInline: 40, borderRadius: 10, width: '85%' }}>
                        <Input
                            placeholder="Introduce el código de la banda"
                            value={code}
                            onChangeText={setCode}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    findBandByCode();
                                }}
                                style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: GlobalStyles.yellow, borderRadius: 5 }}
                            >
                                <Text style={{ fontWeight: '600', color: '#111827' }}>Unirse</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setVisible(false);
                                    setCode('');
                                }}
                                style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#e5e7eb', borderRadius: 5 }}
                            >
                                <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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