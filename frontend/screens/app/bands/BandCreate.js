import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import InstrumentEndpoints from '../../../api/InstrumentsEndpoints.js';
import Input from '../../../components/Input';
import InputSearch from '../../../components/InputSearch.jsx';
import Instrument from '../../../components/Instrument.jsx';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';

const stepSchema = [
    // 0 - Band Information
    Yup.object({
        name: Yup.string()
            .required('El nombre de la banda es obligatorio')
            .min(3, 'El nombre de la banda debe tener al menos 3 caracteres')
            .max(35, 'El nombre de la banda no puede exceder los 35 caracteres'),
        location: Yup.string()
            .required('La ubicación es obligatoria')
            .min(3, 'La ubicación debe tener al menos 3 caracteres')
            .max(50, 'La ubicación no puede exceder los 50 caracteres'),
        phone: Yup.string()
            .required('El número de teléfono es obligatorio')
            .matches(/^[0-9()+-\s]+$/, 'El número de teléfono no es válido')
            .min(7, 'El número de teléfono debe tener al menos 7 caracteres')
            .max(15, 'El número de teléfono no puede exceder los 15 caracteres'),
        type: Yup.string()
            .required('El tipo de banda es obligatorio')
            .min(3, 'El tipo de banda debe tener al menos 3 caracteres')
            .max(30, 'El tipo de banda no puede exceder los 30 caracteres'),
    }),
    // 1 - Instruments
    Yup.object({
        instruments: Yup.object()
            .required('Debes seleccionar al menos un instrumento'),
    })
]

const TOTAL_STEPS = stepSchema.length;

const BandCreate = () => {
    const [step, setStep] = useState(0)

    const formik = useFormik({
        initialValues: {
            name: '',
            location: '',
            phone: '',
            type: '',
            instruments: {}
        },
        validationSchema: stepSchema[step],
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: (values, { setSubmitting }) => {
            try {
                const payload = { ...values };
                // Submit the payload to the backend
                console.log('Submitting band:', payload);
                // After successful submission, you might want to navigate away or reset the form   

            } catch (error) {
                console.error(error?.response?.data || error);
                Alert.alert('Error', error?.response?.data?.message || 'No se pudo registrar el usuario');
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Step navigation with validation of the current step
    const next = async () => {
        const errors = await formik.validateForm();
        // We only move forward if there are no errors in the current scheme
        if (Object.keys(errors).length === 0) {
            setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
        } else {
            // mark all fields of the step as touched
            const fields = Object.keys(stepSchema[step].fields);
            const touched = {};
            fields.forEach((f) => { touched[f] = true; });
            formik.setTouched({ ...formik.touched, ...touched });
        }
    };

    const back = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={true}>
                <TopContainer
                    title="Crear banda"
                    editEnabled={false}
                />
                <View style={styles.headerContainer}>
                    {step > 0 ? <LinkText onPress={back}>Volver</LinkText> : <View></View>}
                    {step < TOTAL_STEPS - 1 ? <LinkText onPress={next}>Siguiente</LinkText> : <LinkText onPress={formik.handleSubmit}>Crear</LinkText>}
                </View>
                {step === 0 && <StepBandInfo formik={formik} />}
                {step === 1 && <StepInstruments formik={formik} />}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const StepBandInfo = ({ formik }) => {
    return (
        <View style={styles.formContainer}>
            <Field>
                <Input
                    label="Nombre de la banda"
                    value={formik.values.name}
                    placeholder={"Introduce el nombre de la banda"}
                    onChangeText={formik.handleChange('name')}
                />
                <Error name="name" formik={formik} />
            </Field>
            <Field>
                <Input
                    label="Lugar de origen"
                    value={formik.values.location}
                    placeholder={"Introduce el lugar de origen"}
                    onChangeText={formik.handleChange('location')}
                />
                <Error name="location" formik={formik} />
            </Field>
            <Field>
                <Input
                    label="Número de teléfono"
                    value={formik.values.phone}
                    placeholder={"Introduce el número de teléfono"}
                    onChangeText={formik.handleChange('phone')}
                />
                <Error name="phone" formik={formik} />
            </Field>
            <Field>
                <Input
                    label="Tipo de banda"
                    value={formik.values.type}
                    placeholder={"Introduce el tipo de banda"}
                    onChangeText={formik.handleChange('type')}
                />
                <Error name="type" formik={formik} />
            </Field>
        </View>
    )
}

const StepInstruments = ({ formik }) => {
    const [instruments, setInstruments] = useState([])
    const [search, setSearch] = useState('')
    const [selectedInstrument, setSelectedInstrument] = useState(null)

    useEffect(() => {
        fetchInstruments();
    }, []);

    const fetchInstruments = async () => {
        try {
            const response = await InstrumentEndpoints.getAllInstruments();
            setInstruments(response);
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }
    
    const selectInstrument = (instrument) => {
        const updatedInstruments = { ...formik.values.instruments };
        const instrumentSelected = instruments.find(i => i.id === instrument.id)
        if (updatedInstruments[instrument.id]) {
            delete updatedInstruments[instrument.id];
            instrumentSelected.selected = false;
            if (instrumentSelected.principal) {
                instrumentSelected.principal = false;
                if (Object.keys(updatedInstruments).length > 0) {
                    updatedInstruments[Object.keys(updatedInstruments)[0]] = "true";
                    instruments.find(i => i.id.toString() === Object.keys(updatedInstruments)[0]).principal = true;
                }
            }
        } else {
            instrumentSelected.principal = Object.keys(updatedInstruments).length === 0;
            updatedInstruments[instrument.id] = Object.keys(updatedInstruments).length > 0 ? "false" : "true";
            instrumentSelected.selected = true;
        }
        formik.setFieldValue('instruments', updatedInstruments);
    }

    return (
        <View style={{ paddingInline: 20}}>
            <View style={{ marginTop: 10, width: '100%' }}>
                <InputSearch
                    placeholder="Busca por instrumento"
                    value={search}
                    onChangeText={setSearch} />
                <Error name="instruments" formik={formik} />
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
                scrollEnabled={false}
                style={styles.instrumentsContainer}
                contentContainerStyle={{ gap: 15, paddingBottom: 30, paddingTop: 20 }}
            />
        </View>
    )
}

// ===== Helper components ======

const MusicianInstruments = ({ instrument }) => {
    return (
        <View >
            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }} style={{ width: 40, height: 40 }} />
            <View style={{ borderBottomWidth: 2, borderBlockColor: GlobalStyle.yellow, marginHorizontal: 5, marginTop: 10 }}></View>
        </View>
    )
}

function Error({ name, formik }) {
    const touched = formik.touched[name];
    const error = formik.errors[name];
    if (!touched || !error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
}

function Field({ children }) {
    return (
        <View style={{ marginBottom: 20 }}>
            {children}
        </View>
    );
}

export default BandCreate

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    formContainer: {
        paddingHorizontal: 30,
        paddingBottom: 30,
        marginTop: 20,
        gap: 20
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
})