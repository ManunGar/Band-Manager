import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import * as Yup from 'yup';
import ComponentEndpoints from '../../../api/ComponentEndpoints';
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import InputSearch from '../../../components/InputSearch';
import Instrument from '../../../components/Instrument';
import TopContainer from '../../../components/TopContainer';
import { useToast } from '../../../contexts/ToastContext';

const schema = Yup.object({
    instruments: Yup.object()
        .required('Debes seleccionar al menos un instrumento')
        .test(
            'at-least-one-instrument',
            'Debes seleccionar al menos un instrumento',
            (value) => value != null && Object.keys(value).length > 0
        ),
})

const EditComponentScreen = ({ route }) => {
    const { band, component } = route.params;
    const [instruments, setInstruments] = useState([])
    const [allInstruments, setAllInstruments] = useState([])
    const [search, setSearch] = useState('')
    const navigation = useNavigation();
    const { showToast } = useToast();

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
            const parsedInstruments = initParseInstruments(response);
            setInstruments(parsedInstruments);
            setAllInstruments(parsedInstruments);
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }

    const selectInstrument = (instrument) => {
        const updatedInstruments = { ...formik.values.instruments };
        const instrumentSelected = allInstruments.find(i => i.id === instrument.id)
        if (Object.keys(updatedInstruments).includes(String(instrument.id))) {
            if (instrumentSelected.principal) {
                delete updatedInstruments[String(instrument.id)];
                instrumentSelected.selected = false;
                instrumentSelected.principal = false;
                if (Object.keys(updatedInstruments).length > 0) {
                    updatedInstruments[Object.keys(updatedInstruments)[0]] = true;
                    allInstruments.find(i => i.id.toString() === Object.keys(updatedInstruments)[0]).principal = true;
                }
            } else {
                instrumentSelected.principal = true;
                Object.keys(updatedInstruments).forEach(key => {
                    updatedInstruments[key] = false;
                    if (key !== String(instrument.id)) {
                        allInstruments.find(i => i.id.toString() === key).principal = false;
                    }
                });
                updatedInstruments[String(instrument.id)] = true;
            }
        } else {
            instrumentSelected.principal = Object.keys(updatedInstruments).length === 0;
            updatedInstruments[String(instrument.id)] = Object.keys(updatedInstruments).length > 0 ? false : true;
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
                await ComponentEndpoints.updateComponentInstruments(component.id, values);
                showToast('Instrumentos guardados', 'Los instrumentos han sido actualizados correctamente.', 'success');
                navigation.goBack();
            } catch (error) {
                console.error(error?.response?.data || error);
                showToast('Error', 'Hubo un error al guardar los instrumentos. Por favor, intenta de nuevo.', 'error');
            } finally {
                setSubmitting(false);
            }
        },
    })

    const initParseInstruments = (allInstruments) => {
        const updatedInstruments = {};
        component.instruments.forEach(inst => {
            updatedInstruments[inst.id] = inst.ComponentInstruments.principal;
            const instrumentSelected = allInstruments.find(i => i.id === inst.id)
            instrumentSelected.selected = true;
            instrumentSelected.principal = inst.ComponentInstruments.principal;
        });
        formik.setFieldValue('instruments', updatedInstruments);
        return allInstruments;
    }


    return (
        <View>
            <TopContainer
                editEnabled={false}
                saveEnabled={Object.keys(formik.values.instruments).length > 0}
                onSave={formik.handleSubmit}
                style={{ paddingTop: 5, paddingBottom: 30 }}>
                <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 70, height: 70 }} />
                <Text style={{ fontSize: 26, fontFamily: 'BebasNeue', marginTop: 5 }}>
                    {component?.musician.user.full_name}
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

export default EditComponentScreen