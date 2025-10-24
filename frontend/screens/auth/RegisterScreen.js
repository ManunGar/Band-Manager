import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import * as GlobalStyle from '../../GlobalStyle';
import Button from '../../components/Button';
import Input from '../../components/Input';
import BandManagerIcon from '../../components/icons/BandManager';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

// ====== Schemas by steps ======
const stepSchemas = [
    // 0 - User credentials
    Yup.object({
        email: Yup.string().email('El correo electrónico no es válido').required('El correo electrónico es requerido'),
        username: Yup.string().trim()
            .matches(/^[a-zA-Z0-9_.-]+$/, 'Introduce solo letras y números')
            .min(3, 'El nombre de usuario debe tener al menos 6 caracteres')
            .max(20, 'El nombre de usuario debe tener como máximo 20 caracteres')
            .required('El nombre de usuario es requerido'),
        password: Yup.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .matches(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
            .matches(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
            .matches(/\d/, 'La contraseña debe tener al menos un número')
            .required('La contraseña es requerida'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
            .required('La confirmación de la contraseña es requerida'),
    }),
    // 1 - Personal info
    Yup.object({
        full_name: Yup.string()
            .min(3, 'El nombre completo debe tener al menos 3 caracteres')
            .required('El nombre completo es requerido'),
        birthday: Yup.date("Fecha no válida")
            .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
            .required('La fecha de nacimiento es requerida'),
        location: Yup.string().required('La ubicación es requerida'),
    }),
    // 2 - Contact info
    Yup.object({
        phone: Yup.string()
            .matches(/^\+?\d{6,15}$/, 'Teléfono no válido')
            .required('El teléfono es requerido'),
    }),
];

const TOTAL_STEPS = stepSchemas.length;

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register, isLoading } = useContext(AuthContext);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [step, setStep] = useState(0);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            // Step 0
            email: '', username: '', password: '', confirmPassword: '',
            // Step 1
            full_name: '', birthday: '', location: '',
            // Step 2
            phone: '', 
        },
        validationSchema: stepSchemas[step],
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    full_name: values.full_name,
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    repeatPassword: values.confirmPassword,
                    phone: values.phone,
                    location: values.location,
                    birthday: values.birthday,
                };
                await register(payload);
            } catch (err) {
                console.error(err?.response?.data || err);
                Alert.alert('Error', err?.response?.data?.message || 'No se pudo registrar el usuario');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Transform date to ISO format yyyy-mm-dd without offset
    const setBirthday = (date) => {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Fix UTC offset
        const iso = localDate.toISOString().slice(0, 10);
        formik.setFieldValue('birthday', iso);
    };

    const formatDate = (date) => {
        return date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
    }

    // Step navigation with validation of the current step
    const next = async () => {
        const errors = await formik.validateForm();
        // We only move forward if there are no errors in the current scheme
        if (Object.keys(errors).length === 0) {
            setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
        } else {
            // mark all fields of the step as touched
            const fields = Object.keys(stepSchemas[step].fields);
            const touched = {};
            fields.forEach((f) => { touched[f] = true; });
            formik.setTouched({ ...formik.touched, ...touched });
        }
    };

    const back = () => setStep((s) => Math.max(s - 1, 0));

    if (isLoading) {
        return <LoadingScreen />
    }

    // Simple progress bar
    const progress = (step + 1) / TOTAL_STEPS;


    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1, backgroundColor: GlobalStyle.white }}>
            <ScrollView contentContainerStyle={{ justifyContent: 'space-between', padding: 25, gap: 20 }} showsVerticalScrollIndicator={true}>
                <View>
                    <View style={styles.barContainer}>
                        <View style={[styles.bar, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.headerContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                            <BandManagerIcon width={50} height={50} stroke={GlobalStyle.black} strokeWidth={40} />
                            <Text style={styles.title}>Band Manager</Text>
                        </View>
                        {step > 0 && <Pressable onPress={back}><Text style={styles.back}>Volver</Text></Pressable>}
                    </View>
                </View>


                <View style={styles.container}>
                    {step === 0 && <StepAccount formik={formik} />}
                    {step === 1 && <StepPersonal formik={formik} showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} setBirthday={setBirthday} formatDate={formatDate} />}
                    {step === 2 && <StepContact formik={formik} />}
                </View>


                <View style={{ marginBottom: 25 }}>
                    {step >= 0 && step < TOTAL_STEPS - 1 ? (
                        <Button onPress={next}>
                            Siguiente
                        </Button>
                    ) : (
                        <Button onPress={formik.handleSubmit}>
                            Registrarse
                        </Button>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

// ===== Step components ======

const StepAccount = ({ formik }) => (
    <>
        <Text style={styles.stepText}>
            {"¡Bienvenido!\n Por favor, ingresa sus datos para crear una cuenta de inicio de sesión."}
        </Text>
        <Field>
            <Input
                label="Correo electrónico"
                value={formik.values.email}
                placeholder={"Introduce tu correo electrónico"}
                onChangeText={formik.handleChange('email')}
                keyboardType={'email-address'}
            />
            <Error name="email" formik={formik} />
        </Field>
        <Field>
            <Input
                label="Nombre de usuario"
                value={formik.values.username}
                placeholder={"Elige un nombre de usuario"}
                onChangeText={formik.handleChange('username')}
            />
            <Error name="username" formik={formik} />
        </Field>
        <Field>
            <Input
                label="Contraseña"
                value={formik.values.password}
                placeholder={"Crea una contraseña"}
                secureTextEntry={true}
                onChangeText={formik.handleChange('password')}
            />
            <Error name="password" formik={formik} />
        </Field>
        <Field>
            <Input
                label="Confirmar contraseña"
                value={formik.values.confirmPassword}
                placeholder={"Repite la contraseña"}
                secureTextEntry={true}
                onChangeText={formik.handleChange('confirmPassword')}
            />
            <Error name="confirmPassword" formik={formik} />
        </Field>
        <Text style={{ color: GlobalStyle.gray, fontSize: 12, fontFamily: 'Oswald_400' }}>
            {"¡La seguridad es importante para nosotros!. \n" +
                "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."}
        </Text>
    </>
)

const StepPersonal = ({ formik, showDatePicker, setShowDatePicker, setBirthday, formatDate }) => (
    <>
        <Text style={styles.stepText}>
            {"¡Casi terminamos!\n Ahora, cuéntanos un poco sobre ti. Esto ayudará también a otros músicos a poder identificarte."}
        </Text>
        <Field>
            <Input
                label="Nombre completo"
                value={formik.values.full_name}
                placeholder={"Introduce nombres y apellidos"}
                onChangeText={formik.handleChange('full_name')}
            />
            <Error name="full_name" formik={formik} />
        </Field>
        <Field>
            <Input
                label="Fecha de nacimiento"
                value={formatDate(formik.values.birthday)}
                placeholder={"Introduce su fecha de nacimiento"}
                onChangeText={formik.handleChange('birthday')}
                onPress={() => setShowDatePicker(true)}
                textContentType={'datetime'}
            />
            <Error name="birthday" formik={formik} />
            {showDatePicker && (
                <DateTimePicker
                    value={formik.values.birthday ? new Date(formik.values.birthday) : new Date()}
                    mode="date"
                    dateFormat='DD-MM-YYYY'
                    onChange={(e, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setBirthday(selectedDate);
                    }}
                    maximumDate={new Date()}
                />
            )}
        </Field>
        <Field>
            <Input
                label="Ubicación"
                value={formik.values.location}
                placeholder={"Ciudad, Localidad, Pueblo..."}
                onChangeText={formik.handleChange('location')}
            />
            <Error name="location" formik={formik} />
        </Field>
    </>
)

const StepContact = ({ formik }) => (
    <>
        <Text style={styles.stepText}>
            {"¡Último paso!\n Necesitamos algunos datos de contacto para que otros músicos puedan encontrarte y ponerse en contacto contigo fácilmente."}
        </Text>
        <Field>
            <Input
                label="Teléfono"
                value={formik.values.phone}
                placeholder={"Introduce tu número de teléfono"}
                onChangeText={formik.handleChange('phone')}
                keyboardType={'numeric'}
            />
            <Error name="phone" formik={formik} />
        </Field>
    </>
)

// ===== Helper components ======

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

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        gap: 20,
        backgroundColor: GlobalStyle.white,
    },
    barContainer: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 16
    },
    bar: {
        height: '100%',
        backgroundColor: GlobalStyle.blue,
        borderRadius: 999,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    back: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.yellow,
        marginBottom: 8
    },
    title: {
        fontSize: 26,
        fontFamily: 'Oswald_700',
        marginBottom: 2,
    },
    stepText: {
        fontSize: 18,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        marginBottom: 40,
        textAlign: 'center',
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
});