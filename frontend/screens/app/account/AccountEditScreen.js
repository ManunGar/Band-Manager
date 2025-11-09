import DateTimePicker from '@react-native-community/datetimepicker';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import Input from '../../../components/Input';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';


// ====== Schemas ======
const schemas =
    Yup.object({
        email: Yup.string().email('El correo electrónico no es válido').required('El correo electrónico es requerido'),
        username: Yup.string().trim()
            .matches(/^[a-zA-Z0-9_.-]+$/, 'Introduce solo letras y números')
            .min(3, 'El nombre de usuario debe tener al menos 6 caracteres')
            .max(20, 'El nombre de usuario debe tener como máximo 20 caracteres')
            .required('El nombre de usuario es requerido'),
        full_name: Yup.string()
            .min(3, 'El nombre completo debe tener al menos 3 caracteres')
            .required('El nombre completo es requerido'),
        birthday: Yup.date("Fecha no válida")
            .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
            .required('La fecha de nacimiento es requerida'),
        location: Yup.string().required('La ubicación es requerida'),
        phone: Yup.string()
            .matches(/^\+?\d{6,15}$/, 'Teléfono no válido')
            .required('El teléfono es requerido'),
    });

const AccountEditScreen = () => {
    const { editMusician, user } = useContext(AuthContext);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: user.email, username: user.username, full_name: user.full_name, birthday: user.birthday, location: user.location, phone: user.phone,
        },
        validationSchema: schemas,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    full_name: values.full_name,
                    username: values.username,
                    email: values.email,
                    phone: values.phone,
                    location: values.location,
                    birthday: values.birthday,
                };
                await editMusician(payload);
            } catch (err) {
                console.error(err?.response?.data || err);
                Alert.alert('Error', err?.response?.data?.message || 'No se pudo guardar los cambios. Inténtalo de nuevo más tarde.');
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

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1, backgroundColor: GlobalStyle.white }}>
            <ScrollView>
                <TopContainer
                    title="Editar Cuenta"
                    editEnabled={false}
                    onSave={formik.handleSubmit}
                    saveEnabled={true}
                    style={{ marginBottom: 10 }} />
                <View style={styles.form}>
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
                            label="Correo electrónico"
                            value={formik.values.email}
                            placeholder={"Introduce tu correo electrónico"}
                            onChangeText={formik.handleChange('email')}
                            keyboardType={'email-address'}
                        />
                        <Error name="email" formik={formik} />
                    </Field>
                </View>
                <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
                    <LinkText>Cambiar contraseña</LinkText>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

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


export default AccountEditScreen

const styles = StyleSheet.create({
    form: {
        paddingHorizontal: 20,
        paddingTop: 10,
        gap: 15,
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
})