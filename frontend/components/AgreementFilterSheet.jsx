import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InstrumentsEndpoints from '../api/InstrumentsEndpoints';
import { useAgreementSearch } from '../contexts/AgreementSearchContext';
import * as GlobalStyle from '../GlobalStyle';
import BottomSheet from './BottomSheet';
import Input from './Input';

const AgreementFilterSheet = ({ sheetRef, activeRouteName }) => {
    const snapPoints = useMemo(() => ['40%'], []);
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        musicianInstrumentId,
        setMusicianInstrumentId,
    } = useAgreementSearch();
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [allInstruments, setAllInstruments] = useState([]);

    const isMusiciansTab = activeRouteName === 'Músicos';

    const formatDate = (date) => {
        return date ? moment(date).format('DD/MM/YYYY') : '';
    };

    const hasFilters = isMusiciansTab
        ? musicianInstrumentId !== null
        : startDate !== null || endDate !== null;

    const filterDescription = isMusiciansTab
        ? 'Selecciona un instrumento para mostrar solo músicos que lo toquen.'
        : 'Define una fecha de inicio y fin para acotar los listados por el rango seleccionado.';

    const getInstrumentImageUri = (instrument) => {
        if (!instrument?.image) return null;
        if (/^https?:\/\//i.test(instrument.image)) return instrument.image;
        return `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}`;
    };

    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const instruments = await InstrumentsEndpoints.getAllInstruments();
                setAllInstruments(Array.isArray(instruments) ? instruments : []);
            } catch (error) {
                console.error('Error fetching instruments for agreement filters:', error);
            }
        };

        fetchInstruments();
    }, []);

    useEffect(() => {
        setShowStartPicker(false);
        setShowEndPicker(false);
    }, [isMusiciansTab]);

    const handleClear = () => {
        if (isMusiciansTab) {
            setMusicianInstrumentId(null);
            return;
        }

        setStartDate(null);
        setEndDate(null);
    };

    return (
        <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Filtros</Text>
                    <Text style={styles.description}>{filterDescription}</Text>
                </View>
                {hasFilters && (
                    <TouchableOpacity onPress={handleClear}>
                        <Text style={styles.clearLink}>Limpiar</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isMusiciansTab ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.instrumentLabel}>Instrumento</Text>
                    <View style={styles.chipGrid}>
                        <Pressable
                            style={[styles.chip, musicianInstrumentId === null && styles.chipSelected]}
                            onPress={() => setMusicianInstrumentId(null)}
                        >
                            <Text style={[styles.chipText, musicianInstrumentId === null && styles.chipTextSelected]}>
                                Todos
                            </Text>
                        </Pressable>
                        {allInstruments.map((instrument) => (
                            <Pressable
                                key={instrument.id}
                                style={[styles.chip, musicianInstrumentId === instrument.id && styles.chipSelected]}
                                onPress={() => setMusicianInstrumentId(instrument.id)}
                            >
                                {getInstrumentImageUri(instrument) && (
                                    <Image
                                        source={{ uri: getInstrumentImageUri(instrument) }}
                                        style={styles.chipImage}
                                    />
                                )}
                                <Text style={[styles.chipText, musicianInstrumentId === instrument.id && styles.chipTextSelected]}>
                                    {instrument.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.inputContainer}>
                        <Input
                            label="Fecha inicio"
                            placeholder="Seleccionar fecha"
                            value={formatDate(startDate)}
                            onPress={() => setShowStartPicker(true)}
                        />
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                onChange={(_, date) => {
                                    setShowStartPicker(false);
                                    if (date) setStartDate(date);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Fecha fin"
                            placeholder="Seleccionar fecha"
                            value={formatDate(endDate)}
                            onPress={() => setShowEndPicker(true)}
                        />
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate || startDate || new Date()}
                                mode="date"
                                onChange={(_, date) => {
                                    setShowEndPicker(false);
                                    if (date) setEndDate(date);
                                }}
                            />
                        )}
                    </View>
                </>
            )}

        </BottomSheet>
    );
};

export default AgreementFilterSheet;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 35,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
        textTransform: 'uppercase',
    },
    description: {
        marginTop: 6,
        fontSize: 14,
        color: GlobalStyle.gray,
        fontFamily: 'Oswald_400',
        lineHeight: 20,
    },
    clearLink: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.yellow,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyle.yellow,
    },
    inputContainer: {
        marginBottom: 35,
    },
    instrumentLabel: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.black,
        marginBottom: 10,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    chipSelected: {
        borderColor: GlobalStyle.yellow,
        backgroundColor: '#FFF5E6',
    },
    chipImage: {
        width: 16,
        height: 16,
    },
    chipText: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    chipTextSelected: {
        color: GlobalStyle.yellow,
        fontFamily: 'Oswald_500',
    },
});
