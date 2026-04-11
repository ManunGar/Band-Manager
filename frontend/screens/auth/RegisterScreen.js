import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useContext, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import * as GlobalStyle from '../../GlobalStyle';
import Button from '../../components/Button';
import ImagePickerSheet from '../../components/ImagePickerSheet';
import Input from '../../components/Input';
import LinkText from '../../components/LinkText';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import BandManagerIcon from '../../components/icons/BandManager';
import { AuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingScreen from './LoadingScreen';

// ====== Schemas by steps ======
const stepSchemas = [
    // 0 - Información básica
    Yup.object({
        full_name: Yup.string()
            .min(3, 'El nombre completo debe tener al menos 3 caracteres')
            .required('El nombre completo es requerido'),
        email: Yup.string().email('El correo electrónico no es válido').required('El correo electrónico es requerido'),
        username: Yup.string().trim()
            .matches(/^[a-zA-Z0-9_.-]+$/, 'Introduce solo letras y números')
            .min(6, 'El nombre de usuario debe tener al menos 6 caracteres')
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
    // 1 - Información adicional
    Yup.object({
        birthday: Yup.date("Fecha no válida")
            .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
            .required('La fecha de nacimiento es requerida'),
        location: Yup.string().required('La ubicación es requerida'),
        phone: Yup.string()
            .matches(/^\+?\d{6,15}$/, 'Teléfono no válido')
            .required('El teléfono es requerido'),
    }),
];

const TOTAL_STEPS = stepSchemas.length;

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register, isLoading } = useContext(AuthContext);
    const { showToast } = useToast();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [step, setStep] = useState(0);
    const [imagePreview, setImagePreview] = useState(null);
    const imageSheetRef = useRef(null);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            // Step 0
            full_name: '', email: '', username: '', password: '', confirmPassword: '',
            // Step 1
            birthday: '', location: '', longitude: '', latitude: '', phone: '',
            profile_picture: null,
        },
        validationSchema: stepSchemas[step],
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Validar que si hay ubicación, también haya coordenadas
                if (values.location && (!values.latitude || !values.longitude)) {
                    showToast('Ubicación no válida', 'Por favor, selecciona una ubicación de las sugerencias.', 'warning');
                    setSubmitting(false);
                    return;
                }
                
                const formData = new FormData();
                formData.append('full_name', values.full_name);
                formData.append('username', values.username);
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('repeatPassword', values.confirmPassword);
                formData.append('phone', values.phone);
                formData.append('location', values.location);
                formData.append('birthday', values.birthday);
                formData.append('longitude', values.longitude || 0);
                formData.append('latitude', values.latitude || 0);
                
                if (imagePreview) {
                    formData.append('profile_picture', {
                        uri: imagePreview,
                        name: `profile_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    });
                }
                
                await register(formData);
            } catch (err) {
                console.error("Registration error:", err);
                showToast('Error', err.message || 'No se pudo registrar el usuario', 'error');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Handle location selection from LocationAutocomplete component
    const handleLocationChange = (data) => {
        formik.setFieldValue('location', data.location);
        formik.setFieldValue('latitude', data.latitude || '');
        formik.setFieldValue('longitude', data.longitude || '');
    };

    // Handle image selection
    const handleImageSelected = (imageUri) => {
        setImagePreview(imageUri);
        formik.setFieldValue('profile_picture', imageUri);
    };

    // Handle removing the selected image
    const handleImageRemoved = () => {
        setImagePreview(null);
        formik.setFieldValue('profile_picture', null);
    };

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
        // Si estamos en el paso 1 (Additional Info) y hay ubicación pero no coordenadas, mostrar error
        if (step === 1 && formik.values.location && (!formik.values.latitude || !formik.values.longitude)) {
            showToast('Ubicación no válida', 'Por favor, selecciona una ubicación de las sugerencias.', 'warning');
            return;
        }
        
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
                    {step === 0 && <StepBasicInfo formik={formik} />}
                    {step === 1 && <StepAdditionalInfo 
                        formik={formik} 
                        showDatePicker={showDatePicker} 
                        setShowDatePicker={setShowDatePicker} 
                        setBirthday={setBirthday} 
                        formatDate={formatDate}
                        handleLocationChange={handleLocationChange}
                        imagePreview={imagePreview}
                        imageSheetRef={imageSheetRef}
                    />}
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
            
            {/* Image Picker component */}
            <ImagePickerSheet
                sheetRef={imageSheetRef}
                imagePreview={imagePreview}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
            />
        </KeyboardAvoidingView>
    )
}

// ===== Step components ======

const StepBasicInfo = ({ formik }) => (
    <>
        <Text style={styles.stepText}>
            {"¡Bienvenido!\nPor favor, ingresa tus datos para crear una cuenta."}
        </Text>
        <Field>
            <Input
                label="Nombre completo"
                value={formik.values.full_name}
                placeholder={"Introduce nombres y apellidos"}
                onChangeText={formik.handleChange('full_name')}
                autoCapitalize="words"
            />
            <Error name="full_name" formik={formik} />
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
            {"¡La seguridad es importante para nosotros!\n" +
                "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."}
        </Text>
    </>
)

const StepAdditionalInfo = ({ formik, showDatePicker, setShowDatePicker, setBirthday, formatDate, handleLocationChange, imagePreview, imageSheetRef }) => (
    <>
        <Text style={styles.stepText}>
            {"Casi terminamos"}
        </Text>
        
        {/* Profile Picture Selector */}
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Text style={styles.label}>Foto de perfil (opcional)</Text>
            {imagePreview ? (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                    <LinkText onPress={() => imageSheetRef.current?.present()}>Cambiar Imagen</LinkText>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.selectImageButton}
                    onPress={() => imageSheetRef.current?.present()}
                >
                    <Text style={styles.selectImageText}>Seleccionar imagen</Text>
                </TouchableOpacity>
            )}
        </View>

        <Field>
            <Input
                label="Fecha de nacimiento"
                value={formatDate(formik.values.birthday)}
                placeholder={"Introduce tu fecha de nacimiento"}
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
            <LocationAutocomplete
                initialValue={formik.values.location}
                onLocationSelect={handleLocationChange}
            />
            <Error name="location" formik={formik} />
        </Field>

        <Field>
            <Input
                label="Teléfono"
                value={formik.values.phone}
                placeholder={"Introduce tu número de teléfono"}
                onChangeText={(text) => formik.setFieldValue('phone', text.replace(/\s/g, ''))}
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
    },
    label: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        alignItems: 'center',
        gap: 10,
    },
    imagePreview: {
        width: 128,
        height: 128,
        borderRadius: 10,
        backgroundColor: GlobalStyle.white,
    },
    selectImageButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f1eade',
        alignItems: 'center',
        justifyContent: 'center',
        width: 128,
        height: 128,
        borderWidth: 2,
        borderColor: GlobalStyle.yellow,
        borderStyle: 'dashed',
    },
    selectImageText: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.yellow,
        textAlign: 'center',
    },
});