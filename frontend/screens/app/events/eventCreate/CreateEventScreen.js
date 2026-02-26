import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import Button from '../../../../components/Button';
import Error from '../../../../components/Error';
import ImagePickerSheet from '../../../../components/ImagePickerSheet';
import Input from '../../../../components/Input';
import LinkText from '../../../../components/LinkText';
import Tag from '../../../../components/Tap';
import TopContainer from '../../../../components/TopContainer';
import { useEventForm } from '../../../../contexts/EventFormContext';
import * as GlobalStyles from '../../../../GlobalStyle';

const schema = Yup.object({
    eventType: Yup.string()
        .required('El tipo de evento es requerido')
        .oneOf(['performances', 'rehearsals'], 'El tipo debe ser "performances" o "rehearsals"'),
    date: Yup.date()
        .required('La fecha es requerida')
        .min(new Date(), 'La fecha debe ser en el futuro')
        .typeError('Debe ser una fecha válida'),
    initialTime: Yup.string()
        .required('La hora inicial es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM'),
    endTime: Yup.string()
        .required('La hora final es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM')
        .test('is-after', 'La hora final debe ser posterior a la hora inicial', function (value) {
            const { initialTime } = this.parent;
            if (!initialTime || !value) return true;

            const [initHour, initMin] = initialTime.split(':').map(Number);
            const [endHour, endMin] = value.split(':').map(Number);

            const initMinutes = initHour * 60 + initMin;
            const endMinutes = endHour * 60 + endMin;

            return endMinutes > initMinutes;
        }),
    name: Yup.string()
        .when('eventType', {
            is: 'performances',
            then: (schema) => schema.required('El nombre de la actuación es requerido').min(1, 'El nombre no puede estar vacío'),
            otherwise: (schema) => schema.notRequired()
        }),
    type: Yup.string()
        .when('eventType', {
            is: 'performances',
            then: (schema) => schema.required('El tipo de actuación es requerido').min(1, 'El tipo no puede estar vacío'),
            otherwise: (schema) => schema.notRequired()
        }),
    place: Yup.string()
        .when('eventType', {
            is: 'performances',
            then: (schema) => schema.required('El lugar de la actuación es requerido').min(1, 'El lugar no puede estar vacío'),
            otherwise: (schema) => schema.notRequired()
        }),
    comment: Yup.string().nullable().optional(),
    picture: Yup.mixed().nullable().optional(),
    instruments: Yup.array().of(Yup.number().positive().integer()).optional()
})
const CreateEventScreen = ({ route }) => {
    const { band } = route.params;
    const { eventFormData, updateEventFormData } = useEventForm();
    const [eventType, setEventType] = useState(eventFormData.eventType || 'performances');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showInitialTimePicker, setShowInitialTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [imagePreview, setImagePreview] = useState(eventFormData.picture || null);
    const navigation = useNavigation();

    const imageSheetRef = useRef(null);

    const formik = useFormik({
        initialValues: {
            eventType: eventFormData.eventType || 'performances',
            date: eventFormData.date || '',
            initialTime: eventFormData.initialTime || '',
            endTime: eventFormData.endTime || '',
            name: eventFormData.name || '',
            type: eventFormData.type || '',
            place: eventFormData.place || '',
            comment: eventFormData.comment || null,
            picture: eventFormData.picture || null,
            instruments: eventFormData.instruments || {}
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Save form data to context
                updateEventFormData(values);
                
                // Navigate to instruments selection
                navigation.navigate('EventInstruments', { band });
            } catch (error) {
                console.error('Error al guardar datos del evento:', error);
                Alert.alert('Error', 'Ocurrió un error. Por favor, inténtalo de nuevo.');
            } finally {
                setSubmitting(false);
            }
        }
    })

    // Transform date to ISO format yyyy-mm-dd without offset
    const setDate = (date) => {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Fix UTC offset
        const iso = localDate.toISOString().slice(0, 10);
        formik.setFieldValue('date', iso);
    };

    const formatDate = (date) => {
        return date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
    }

    // Transform time to HH:MM format
    const setTime = (field, time) => {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        formik.setFieldValue(field, `${hours}:${minutes}`);
    }

    // Convert HH:MM string to Date object for DateTimePicker
    const getTimeAsDate = (timeString) => {
        if (!timeString) return new Date();
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    }

    // Handle image selection
    const handleImageSelected = (imageUri) => {
        setImagePreview(imageUri);
        formik.setFieldValue('picture', imageUri);
    };

    // Handle removing the selected image
    const handleImageRemoved = () => {
        setImagePreview(null);
        formik.setFieldValue('picture', null);
    };

    // Handle tag selection for event type
    const handleTagPress = (type) => {
        setEventType(type);
        formik.setFieldValue('eventType', type);
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView>
                <TopContainer title="Crear Evento" editEnabled={false} pictureEnabled={true} pictureUrl={band.profile_picture} />
                <View style={styles.bodyContainer}>
                    <View style={styles.tagContainer}>
                        <Tag selected={eventType === 'performances'} onPress={() => handleTagPress('performances')}>Actuación</Tag>
                        <Tag selected={eventType === 'rehearsals'} onPress={() => handleTagPress('rehearsals')}>Ensayo</Tag>
                    </View>
                    <View style={styles.formContainer}>
                        {/* PERFORMANCE NAME */}
                        {eventType === 'performances' &&
                            <View style={styles.inputContainer}>
                                <Input
                                    label="Nombre de la actuación"
                                    placeholder="Ej. Concierto de Primavera"
                                    value={formik.values.name}
                                    onChangeText={formik.handleChange('name')} />
                                <Error name="name" formik={formik} />
                            </View>}
                        {/* PERFORMANCE TYPE */}
                        {eventType === 'performances' &&
                            <View style={styles.inputContainer}>
                                <Input
                                    label="Tipo de actuación"
                                    placeholder="Ej. Concierto de Primavera"
                                    value={formik.values.type}
                                    onChangeText={formik.handleChange('type')} />
                                <Error name="type" formik={formik} />
                            </View>}
                        {/* PERFORMANCE PLACE */}
                        {eventType === 'performances' &&
                            <View style={styles.inputContainer}>
                                <Input
                                    label="Lugar"
                                    placeholder="Calle, ciudad o local"
                                    value={formik.values.place}
                                    onChangeText={formik.handleChange('place')} />
                                <Error name="place" formik={formik} />
                            </View>}
                        {/* EVENT DATE */}
                        <View style={styles.inputContainer}>
                            <Input
                                label="Fecha"
                                placeholder="2024-12-31"
                                value={formatDate(formik.values.date)}
                                onChangeText={formik.handleChange('date')}
                                onPress={() => setShowDatePicker(true)}
                                textContentType={"date-time"} />
                            <Error name="date" formik={formik} />
                            {showDatePicker && (
                                <DateTimePicker
                                    value={formik.values.date ? new Date(formik.values.date) : new Date()}
                                    mode="date"
                                    dateFormat='DD-MM-YYYY'
                                    onChange={(e, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>
                        {/* EVENT TIMES */}
                        <View style={styles.timeContainer}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Hora de Inicio"
                                    placeholder="HH:MM"
                                    value={formik.values.initialTime}
                                    onChangeText={formik.handleChange('initialTime')}
                                    onPress={() => setShowInitialTimePicker(true)} />
                                <Error name="initialTime" formik={formik} />
                                {showInitialTimePicker && (
                                    <DateTimePicker
                                        value={getTimeAsDate(formik.values.initialTime)}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={(e, selectTime) => {
                                            setShowInitialTimePicker(false);
                                            if (selectTime) setTime('initialTime', selectTime);
                                        }}
                                    />
                                )}
                            </View>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Hora de Fin"
                                    placeholder="HH:MM"
                                    value={formik.values.endTime}
                                    onChangeText={formik.handleChange('endTime')}
                                    onPress={() => setShowEndTimePicker(true)} />
                                <Error name="endTime" formik={formik} />
                                {showEndTimePicker && (
                                    <DateTimePicker
                                        value={getTimeAsDate(formik.values.endTime)}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={(e, selectTime) => {
                                            setShowEndTimePicker(false);
                                            if (selectTime) setTime('endTime', selectTime);
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                        {/* PERFORMANCE IMAGE */}
                        {eventType === 'performances' &&
                            <View style={[styles.inputContainer, { marginTop: -25 }]}>
                                <Text style={styles.label}>Imagen del evento (opcional)</Text>
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
                                <Error name="picture" formik={formik} />
                            </View>}
                        {/* PERFORMANCE COMMENT */}
                        {eventType === 'performances' &&
                            <View style={styles.inputContainer}>
                                <Input
                                    label="Comentario (opcional)"
                                    placeholder="Información adicional (opcional)"
                                    value={formik.values.comment}
                                    onChangeText={formik.handleChange('comment')}
                                    multiline={true}
                                    style={{ borderRadius: 10, paddingTop: 0 }}
                                    numberOfLines={4} />
                                <Error name="comment" formik={formik} />
                            </View>}
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button onPress={formik.handleSubmit} disabled={formik.isSubmitting}>
                            Crear Evento
                        </Button>
                    </View>
                </View>

                <ImagePickerSheet
                    sheetRef={imageSheetRef}
                    imagePreview={imagePreview}
                    onImageSelected={handleImageSelected}
                    onImageRemoved={handleImageRemoved}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    )

}

export default CreateEventScreen

const styles = StyleSheet.create({
    bodyContainer: {
        flex: 1,
        paddingHorizontal: 25,
        marginBottom: 100,
    },
    tagContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    formContainer: {
        marginTop: 45,
        gap: 15
    },
    inputContainer: {
        marginBottom: 20
    },
    timeContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20
    },
    label: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        marginBottom: 2
    },
    selectImageButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f1eade',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 385,
        height: 160,
        borderWidth: 2,
        borderColor: GlobalStyles.yellow,
        borderStyle: 'dashed'
    },
    selectImageText: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.yellow,
    },
    imagePreviewContainer: {
        alignItems: 'center',
        gap: 10
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: '#f1eade'
    },
    buttonContainer: {
        marginTop: 30,
        alignItems: 'center'
        }
})