import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints'
import BottomSheet from '../../../components/BottomSheet'
import InputSearch from '../../../components/InputSearch'
import Instrument from '../../../components/Instrument'
import TopContainer from '../../../components/TopContainer'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import * as GlobalStyle from '../../../GlobalStyle'
import { buildMusicianInstrumentMap } from '../../../helpers/ParseHelpers'

const InstrumentsScreen = ({ route }) => {
    const musicianLevel = ['aficionado', 'aficionado profesional', 'enseñanzas básica', 'título profesional', 'título superior'];

    const [allInstruments, setAllInstruments] = useState([])
    const [instruments, setInstruments] = useState([])
    const [search, setSearch] = useState('')

    const [currentInstruments, setCurrentInstruments] = useState(route.params.userInstruments)
    const [musicianInstruments, setMusicianInstruments] = useState({}) // State to hold musician's instruments and levels. This is the body to save instruments data
    const [uploading, setUploading] = useState(false);
    const [instrument, setInstrument] = useState(null)

    const snapPoints = useMemo(() => ['70%'], [])
    const sheetRef = useRef(null)
    const navigation = useNavigation();
    const { showToast } = useToast();
    const { updateMusicianInstruments } = useAuth();

    useEffect(() => { // Debounce search input
        const timeout = setTimeout(() => {
            if (!search.trim()) { // If search is empty, show all instruments
                setInstruments(allInstruments);
                return;
            }

            const lower = search.toLowerCase();
            const filtered = allInstruments.filter((inst) =>
                inst.name.toLowerCase().includes(lower)
            );
            setInstruments(filtered);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, allInstruments]);

    useEffect(() => { // Initial fetch of instruments
        fetchInstruments();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Refresh instruments when returning to the screen
            fetchInstruments();
            return closeSheet;
        }, [currentInstruments])
    );

    // Fetch instruments from API and set state
    const fetchInstruments = async () => {
        try {
            const data = await InstrumentsEndpoints.getAllInstruments();
            const merged = mergeInstrumentsWithUser(data, currentInstruments);
            setAllInstruments(merged);
            setInstruments(merged);
            setMusicianInstruments(buildMusicianInstrumentMap(currentInstruments));
        } catch (error) {
            console.error('Error fetching instruments:', error);
        }
    }

    function mergeInstrumentsWithUser(instruments, userInstruments) {
        const map = new Map(userInstruments.map(i => [i.id, i.MusicianLevel.level]));
        return instruments.map(inst => ({
            ...inst,
            selected: map.has(inst.id),
            level: map.get(inst.id) || null,
        }));
    }

    const handleSave = async () => {
        try {
            setUploading(true);
            await updateMusicianInstruments(musicianInstruments);
            showToast('Instrumentos guardados', 'Tus instrumentos han sido actualizados correctamente.', 'success');
        } catch (error) {
            console.error('Error saving musician instruments:', error);
            showToast('Error', 'No se pudieron guardar los instrumentos. Por favor, intenta de nuevo.', 'error');
        } finally {
            setUploading(false);
            navigation.goBack();
        }
    }

    const updateMusicianInstrument = (instrument, newLevel = null) => {
        if (!currentInstruments.some(i => i.id === instrument.id)) currentInstruments.push({ ...instrument })
        const updated = currentInstruments.map(inst =>
            inst.id === instrument.id
                ? { ...inst, MusicianLevel: { level: newLevel } }
                : inst
        ).filter(inst => inst.MusicianLevel.level); // delete if newLevel is null

        setCurrentInstruments(updated);
        setMusicianInstruments(buildMusicianInstrumentMap(updated));
        setAllInstruments(prev => prev.map(i => ({
            ...i,
            selected: updated.some(u => u.id === i.id),
            level: updated.find(u => u.id === i.id)?.MusicianLevel.level || null,
        })));
    };

    const openSheet = useCallback((instrument) => {
        setInstrument(instrument);
        sheetRef.current?.present()
    }, [])

    const closeSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])


    return (
        <>
            <TopContainer
                editEnabled={false}
                saveEnabled
                onSave={handleSave}
                style={{ alignItems: 'flex-start', marginBottom: 0 }}
                title={'Instrumentos'}>
                <Text style={styles.subtitle}>Instrumentos de nivel musical</Text>
                <View style={{ marginTop: 10, width: '100%' }}>
                    <InputSearch
                        placeholder="Busca por instrumento"
                        value={search}
                        onChangeText={setSearch} />
                </View>
                <FlatList
                    data={currentInstruments || []}
                    keyExtractor={item => item.id.toString()}
                    style={{ marginTop: 20, width: '100%' }}
                    ItemSeparatorComponent={<View style={{ width: 20 }}></View>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <MusicianInstruments instrument={item} />
                    )}
                />
            </TopContainer>
            <FlatList 
                data={instruments} 
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Instrument
                        instrument={item}
                        onPress={() => openSheet(item)}
                        uploading={uploading} />
                )} 
                style={styles.instrumentsContainer}
                contentContainerStyle={{ gap: 15, paddingBottom: 30, paddingTop: 20 }}
            />
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
                <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.darkGray, fontSize: 16, marginBottom: 10 }}>
                    {`Selecciona tu nivel musical para ${instrument?.name}`}
                </Text>
                {musicianLevel.map((level, index) => (
                    <MusicianLevelButton
                        key={index}
                        level={level}
                        onPress={() => {
                            updateMusicianInstrument(instrument, level)
                            closeSheet()
                        }}
                        uploading={uploading}
                        instrument={instrument}
                    />
                ))}
                {/* Delete Instrument Button */}
                {instrument?.level && <TouchableOpacity onPress={() => {
                    updateMusicianInstrument(instrument)
                    closeSheet()
                }}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: GlobalStyle.red }}>Eliminar instrumento</Text>
                </TouchableOpacity>}
                {/* Cancel Button */}
                <TouchableOpacity
                    disabled={uploading}
                    onPress={closeSheet}
                    style={{ paddingVertical: 12, borderRadius: 10, backgroundColor: '#e5e7eb', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: '600', color: '#111827' }}>Cancelar</Text>
                </TouchableOpacity>
            </BottomSheet>
        </>
    )
}

export default InstrumentsScreen

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 18,
        fontFamily: 'BebasNeue',
        textAlign: 'left'
    },
    instrumentsContainer: {
        paddingHorizontal: 20,
        flexDirection: 'column',
    }
})

const MusicianInstruments = ({ instrument }) => {
    return (
        <View >
            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }} style={{ width: 40, height: 40 }} />
            <View style={{ borderBottomWidth: 2, borderBlockColor: GlobalStyle.yellow, marginHorizontal: 5, marginTop: 10 }}></View>
        </View>
    )
}

const MusicianLevelButton = ({ level, onPress, uploading, instrument }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[MusicianLevelButtonStyles.buttonContainer, (instrument?.level && instrument?.level !== level) && { opacity: 0.4 }]}>
            {uploading ? <ActivityIndicator /> :
                <Text style={MusicianLevelButtonStyles.buttonText}>{level}</Text>
            }
        </TouchableOpacity>
    )
}

const MusicianLevelButtonStyles = StyleSheet.create({
    buttonContainer: {
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
    },
    buttonText: {
        fontWeight: '600',
        color: '#111827',
        textTransform: 'capitalize',
        textAlign: 'center',
    }
})