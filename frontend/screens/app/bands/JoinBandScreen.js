import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Text, View } from 'react-native';
import * as Yup from 'yup';
import BandEndpoints from '../../../api/BandEndpoints';
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import InputSearch from '../../../components/InputSearch';
import Instrument from '../../../components/Instrument';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';

const schema = Yup.object({
    instruments: Yup.object()
        .required('Debes seleccionar al menos un instrumento')
        .test(
            'at-least-one-instrument',
            'Debes seleccionar al menos un instrumento',
            (value) => value != null && Object.keys(value).length > 0
        ),
})

const JoinBandScreen = ({ route }) => {
    const { band } = route.params;
    const [instruments, setInstruments] = useState([])
    const [allInstruments, setAllInstruments] = useState([])
    const [search, setSearch] = useState('')
    const navigation = useNavigation();

    useEffect(() => {
        fetchInstruments();
    }, []);

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

    const fetchInstruments = async () => {
        try {
            const response = await InstrumentsEndpoints.getAllInstruments();
            setInstruments(response);
            setAllInstruments(response);
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }

    const selectInstrument = (instrument) => {
        const updatedInstruments = { ...formik.values.instruments };
        const instrumentSelected = allInstruments.find(i => i.id === instrument.id)
        if (Object.keys(updatedInstruments).includes(String(instrument.id))) {
            delete updatedInstruments[String(instrument.id)];
            instrumentSelected.selected = false;
            if (instrumentSelected.principal) {
                instrumentSelected.principal = false;
                if (Object.keys(updatedInstruments).length > 0) {
                    updatedInstruments[Object.keys(updatedInstruments)[0]] = true;
                    allInstruments.find(i => i.id.toString() === Object.keys(updatedInstruments)[0]).principal = true;
                }
            }
        } else {
            instrumentSelected.principal = Object.keys(updatedInstruments).length === 0;
            updatedInstruments[instrument.id] = Object.keys(updatedInstruments).length > 0 ? false : true;
            instrumentSelected.selected = true;
        }
        formik.setFieldValue('instruments', updatedInstruments);
    }

    const formik = useFormik({
        initialValues: {
            instruments: {},
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await BandEndpoints.joinBand(band.id, values);
                navigation.goBack();
            } catch (error) {
                console.error(error?.response?.data || error);
                Alert.alert('Error', 'Hubo un error al unirte a la banda. Por favor, intenta de nuevo.');
            } finally {
                setSubmitting(false);
            }
        },
    })


    return (
        <View>
            <TopContainer
                editEnabled={false}
                saveEnabled={Object.keys(formik.values.instruments).length > 0}
                onSave={formik.handleSubmit}
                style={{ paddingTop: 5, paddingBottom: 30 }}>
                <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 70, height: 70 }} />
                <Text style={{ fontSize: 26, fontFamily: 'BebasNeue', marginTop: 5 }}>
                    {band?.name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Oswald_500', color: GlobalStyle.yellow, textTransform: 'uppercase', textAlign: 'center' }}>
                    {band?.type}
                </Text>
            </TopContainer>
            <View style={{ paddingHorizontal: 20 }}>
                <View style={{ marginBottom: 10, width: '100%' }}>
                    <InputSearch
                        placeholder="Busca por instrumento"
                        value={search}
                        onChangeText={setSearch} />
                </View>
                <FlatList
                    data={instruments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Instrument
                            instrument={item}
                            onPress={() => selectInstrument(item)}
                        />
                    )}
                    contentContainerStyle={{ gap: 15, paddingBottom: 500, paddingTop: 10 }}
                />
            </View>
        </View>
    );
}

export default JoinBandScreen