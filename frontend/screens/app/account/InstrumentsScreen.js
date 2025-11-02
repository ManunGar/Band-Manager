import { useContext, useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints'
import InputSearch from '../../../components/InputSearch'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const InstrumentsScreen = () => {
    const { user } = useContext(AuthContext);
    const [instruments, setInstruments] = useState([])
    const [musicianInstruments, setMusicianInstruments] = useState([])


    useEffect(() => {
        const userInstruments = user?.musician?.instruments;
        const fetchedInstruments = fetchInstruments(userInstruments);
        if (userInstruments) {
            parseMusicianInstruments(userInstruments);
        }
        setInstruments(fetchedInstruments);
    }, [])

    // Fetch instruments from API and set state
    const fetchInstruments = async (userInstruments) => {
        const instrumentsMap = userInstruments?.map(inst => inst.id) || [];
        try {
            const data = await InstrumentsEndpoints.getAllInstruments();
            data.forEach(instrument => {
                instrument.selected = instrumentsMap.includes(instrument.id);
                instrument.level = instrument.selected ? userInstruments.find(inst => inst.id === instrument.id).MusicianLevel.level : null;
            });
            setInstruments(data);
        } catch (error) {
            console.error('Error fetching instruments:', error);
        }
    }

    // Parse musician's instruments and set state
    const parseMusicianInstruments = (userInstruments) => {
        const parsed = { instruments: {} };
        userInstruments.forEach(instrument => {
            parsed.instruments[instrument.id] = instrument.MusicianLevel.level;
        });
        setMusicianInstruments(parsed);
    }

    const handleSave = () => {
        // Handle saving selected instruments
    }


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
                    data={user?.musician?.instruments || []}
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
                    <Instrument key={instrument.id} instrument={instrument} />
                ))}
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

const Instrument = ({ instrument }) => {
    return (
        <View style={[InstrumentStyles.instrumentContainer, instrument.selected && { borderColor: GlobalStyle.yellow }]}>
            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }} style={{ width: 40, height: 40 }} />
            <View>
                <Text style={InstrumentStyles.instrumentName}>{instrument.name}</Text>
                {instrument.level && <Text style={InstrumentStyles.instrumentLevel}>{instrument.level}</Text>}
            </View>
        </View>
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