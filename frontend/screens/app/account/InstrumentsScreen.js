import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints'
import BottomSheet from '../../../components/BottomSheet'
import InputSearch from '../../../components/InputSearch'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const InstrumentsScreen = () => {
    const { user } = useContext(AuthContext);
    const [instruments, setInstruments] = useState([])
    const [userInstruments, setUserInstruments] = useState(user?.musician?.instruments || [])
    const [musicianInstruments, setMusicianInstruments] = useState([])
    const sheetRef = useRef(null)
    const [uploading, setUploading] = useState(false);
    const snapPoints = useMemo(() => ['70%'], [])
    const [instrument, setInstrument] = useState(null)
    const musicianLevel = ['aficionado', 'aficionado profesional', 'enseñanzas básica', 'título profesional', 'título superior'];


    useEffect(() => {
        fetchInstruments();
    }, []);

    // Fetch instruments from API and set state
    const fetchInstruments = async () => {
        const instrumentsMap = userInstruments.map(inst => inst.id) || [];
        try {
            const data = await InstrumentsEndpoints.getAllInstruments();
            data.forEach(instrument => {
                instrument.selected = instrumentsMap.includes(instrument.id);
                instrument.level = instrument.selected ? userInstruments.find(inst => inst.id === instrument.id).MusicianLevel.level : null;
            });
            setInstruments(data);
            parseMusicianInstruments();
        } catch (error) {
            console.error('Error fetching instruments:', error);
        }
    }

    // Parse musician's instruments and set state
    const parseMusicianInstruments = () => {
        const parsed = { instruments: {} };
        userInstruments.forEach(instrument => {
            parsed.instruments[instrument.id] = instrument.MusicianLevel.level;
        });
        console.log('Parsed musician instruments:', parsed);
        setMusicianInstruments(parsed);
    }

    const handleSave = () => {
        // Handle saving selected instruments
    }

    const handleLevelPress = (instrument, level) => {
        const updatedInstrument = { ...instrument }
        updatedInstrument.MusicianLevel = {};
        updatedInstrument.MusicianLevel.level = level;
        console.log('Selected level for instrument:', updatedInstrument);
        const updatedUserInstruments = [...userInstruments.filter(inst => inst.id !== updatedInstrument.id), updatedInstrument]
        setUserInstruments(updatedUserInstruments)
        const instrumentsMap = updatedUserInstruments.map(inst => inst.id) || [];
        instruments.forEach(instrument => {
            instrument.selected = instrumentsMap.includes(instrument.id);
            instrument.level = instrument.selected ? updatedUserInstruments.find(inst => inst.id === instrument.id).MusicianLevel.level : null;
        });
        parseMusicianInstruments();

    }

    const handleDelete = (instrument) => {
        // Handle deleting instrument from musician's list
        const updatedUserInstruments = userInstruments.filter(inst => inst.id !== instrument.id);
        setUserInstruments(updatedUserInstruments);
        const instrumentsMap = updatedUserInstruments.map(inst => inst.id) || [];
        instruments.forEach(instrument => {
            instrument.selected = instrumentsMap.includes(instrument.id);
            instrument.level = instrument.selected ? updatedUserInstruments.find(inst => inst.id === instrument.id).MusicianLevel.level : null;
        });
        parseMusicianInstruments();
    }

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
                style={{ alignItems: 'flex-start', marginBottom: 0 }}
                title={'Instrumentos'}>
                <Text style={styles.subtitle}>Instrumentos de nivel musical</Text>
                <View style={{ marginTop: 10, width: '100%' }}>
                    <InputSearch
                        placeholder="Busca por instrumento" />
                </View>
                <FlatList
                    data={userInstruments || []}
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
            <ScrollView style={styles.instrumentsContainer}
                contentContainerStyle={{ gap: 15, paddingBottom: 30, paddingTop: 20 }}>
                {instruments.length > 0 && instruments.map((instrument) => (
                    <Instrument key={instrument.id} instrument={instrument} onPress={() => openSheet(instrument)} />
                ))}
                <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ gap: 10 }} uploading={uploading}>
                    {/* Content for the bottom sheet can be added here */}
                    <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.darkGray, fontSize: 16, marginBottom: 10 }}>
                        {`Selecciona tu nivel musical para ${instrument?.name}`}
                    </Text>
                    {musicianLevel.map((level, index) => (
                        <MusicianLevelButton
                            key={index}
                            level={level}
                            onPress={() => {
                                handleLevelPress(instrument, level)
                                closeSheet()
                            }}
                            uploading={uploading}
                            instrument={instrument}
                        />
                    ))}
                    {/* Delete Instrument Button */}
                    {instrument?.level && <TouchableOpacity onPress={() =>{ 
                        handleDelete(instrument)
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
            </ScrollView>
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

const Instrument = ({ instrument, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[InstrumentStyles.instrumentContainer, instrument.selected && { borderColor: GlobalStyle.yellow }]}>
            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }} style={{ width: 40, height: 40 }} />
            <View>
                <Text style={InstrumentStyles.instrumentName}>{instrument.name}</Text>
                {instrument.level && <Text style={InstrumentStyles.instrumentLevel}>{instrument.level}</Text>}
            </View>
        </TouchableOpacity>
    )
}

const InstrumentStyles = StyleSheet.create({
    instrumentContainer: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 8,
        backgroundColor: GlobalStyle.white,
        borderColor: GlobalStyle.white,
        flexDirection: 'row',
        gap: 15,
    },
    instrumentName: {
        fontSize: 18,
        fontFamily: 'BebasNeue'
    },
    instrumentLevel: {
        fontSize: 14,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.darkGray,
        marginTop: -4,
        textTransform: 'capitalize',
    }
})

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