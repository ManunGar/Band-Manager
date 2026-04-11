import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useCallback, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import EventEndpoints from '../../../../api/EventEndpoints';
import AddressAutocomplete from '../../../../components/AddressAutocomplete';
import Button from '../../../../components/Button';
import Error from '../../../../components/Error';
import EventMapView from '../../../../components/EventMapView';
import ImagePickerSheet from '../../../../components/ImagePickerSheet';
import Input from '../../../../components/Input';
import LinkText from '../../../../components/LinkText';
import Tag from '../../../../components/Tap';
import TopContainer from '../../../../components/TopContainer';
import { useEventForm } from '../../../../contexts/EventFormContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyles from '../../../../GlobalStyle';

const SEVILLE_CENTER = {
    latitude: 37.3891,
    longitude: -5.9845,
};

const schema = Yup.object({
    eventType: Yup.string()
        .required('El tipo de evento es requerido')
        .oneOf(['performances', 'rehearsals'], 'El tipo debe ser "performances" o "rehearsals"'),
    date: Yup.date()
        .required('La fecha es requerida')
        .min(new Date(), 'La fecha debe ser en el futuro')
        .typeError('Debe ser una fecha válida'),
    endDate: Yup.date()
        .required('La fecha de fin es requerida')
        .typeError('Debe ser una fecha válida')
        .test('is-after-start-date', 'La fecha de fin no puede ser anterior a la fecha de inicio', function (value) {
            const { date } = this.parent;
            if (!date || !value) return true;

            const startDate = moment(date).format('YYYY-MM-DD');
            const finishDate = moment(value).format('YYYY-MM-DD');

            return finishDate >= startDate;
        }),
    initialTime: Yup.string()
        .required('La hora inicial es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM'),
    endTime: Yup.string()
        .required('La hora final es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM')
        .test('is-after', 'La hora final debe ser posterior a la hora inicial', function (value) {
            const { initialTime, date, endDate } = this.parent;
            if (!initialTime || !value || !date || !endDate) return true;

            const sameDay = moment(date).format('YYYY-MM-DD') === moment(endDate).format('YYYY-MM-DD');
            if (!sameDay) return true;

            const [initHour, initMin] = initialTime.split(':').map(Number);
            const [endHour, endMin] = value.split(':').map(Number);

            const initMinutes = initHour * 60 + initMin;
            const endMinutes = endHour * 60 + endMin;

            return endMinutes > initMinutes;
        }),
    name: Yup.string()
        .required('El nombre del evento es requerido')
        .min(1, 'El nombre no puede estar vacío'),
    type: Yup.string()
        .when('eventType', {
            is: 'performances',
            then: (schema) => schema.required('El tipo de actuación es requerido').min(1, 'El tipo no puede estar vacío'),
            otherwise: (schema) => schema.notRequired()
        }),
    location: Yup.string()
        .required('La ubicación del evento es requerida')
        .min(1, 'La ubicación no puede estar vacía'),
    latitude: Yup.number()
        .required('Selecciona una ubicación del mapa')
        .min(-90, 'Latitud inválida')
        .max(90, 'Latitud inválida')
        .typeError('Selecciona una ubicación válida'),
    longitude: Yup.number()
        .required('Selecciona una ubicación del mapa')
        .min(-180, 'Longitud inválida')
        .max(180, 'Longitud inválida')
        .typeError('Selecciona una ubicación válida'),
    comment: Yup.string().nullable().optional(),
    picture: Yup.mixed().nullable().optional(),
    instruments: Yup.array().of(Yup.number().positive().integer()).optional(),
    delete_picture: Yup.boolean().optional()
})
const EventFormScreen = ({ route }) => {
    const { band, event } = route.params;
    const { eventFormData, updateEventFormData, resetEventFormData } = useEventForm();
    const { showToast } = useToast();
    const [eventType, setEventType] = useState((event?.Performance ? 'performances' : event?.Rehearsal ? 'rehearsals' : null) || 'performances');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showInitialTimePicker, setShowInitialTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigation = useNavigation();
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const imageSheetRef = useRef(null);
    const reverseGeocodeRequestRef = useRef(0);
    const endTimeAutoFilledRef = useRef(false);

    // Reset context and initialize form when screen is focused
    useFocusEffect(
        useCallback(() => {
            const currentEventId = event?.id || null;
            
            // Check if context data belongs to a different event
            if (eventFormData.eventId !== currentEventId) {
                // Reset context completely first
                resetEventFormData();
                
                // If editing an event, populate context with event data
                if (event) {
                    const eventInstrumentIds = event?.instrumentsAttended?.map(i => i.id) || [];
                    updateEventFormData({ 
                        eventId: currentEventId,
                        date: event.date || '',
                        endDate: event.endDate || event.date || '',
                        initialTime: event.initialTime?.substring(0, 5) || '',
                        endTime: event.endTime?.substring(0, 5) || '',
                        name: event.name || event.Performance?.name || '',
                        type: event.Performance?.type || '',
                        location: event.location || '',
                        latitude: event.latitude || null,
                        longitude: event.longitude || null,
                        comment: event.Performance?.comment || '',
                        picture: event.Performance?.picture || null,
                        instruments: eventInstrumentIds
                    });
                }
            }
            
            // Set image preview based on context (if user uploaded new image) or event picture
            if (eventFormData.eventId === currentEventId && eventFormData.picture) {
                setImagePreview(eventFormData.picture);
            } else if (event?.Performance?.picture) {
                setImagePreview(event.Performance.picture);
            } else {
                setImagePreview(null);
            }
        }, [event?.id, eventFormData.eventId, eventFormData.picture])
    )

    const formik = useFormik({
        enableReinitialize: true, // Important: reinitialize form when initialValues change
        initialValues: {
            eventType: eventType,
            // If context belongs to current event, use context data (user may have navigated to EventInstruments and back)
            // Otherwise use event data directly
            date: (eventFormData.eventId === (event?.id || null)) ? eventFormData.date : (event?.date || ''),
            endDate: (eventFormData.eventId === (event?.id || null)) ? eventFormData.endDate : (event?.endDate || event?.date || ''),
            initialTime: (eventFormData.eventId === (event?.id || null)) ? eventFormData.initialTime : (event?.initialTime?.substring(0, 5) || ''),
            endTime: (eventFormData.eventId === (event?.id || null)) ? eventFormData.endTime : (event?.endTime?.substring(0, 5) || ''),
            name: (eventFormData.eventId === (event?.id || null)) ? eventFormData.name : (event?.name || event?.Performance?.name || ''),
            type: (eventFormData.eventId === (event?.id || null)) ? eventFormData.type : (event?.Performance?.type || ''),
            location: (eventFormData.eventId === (event?.id || null)) ? eventFormData.location : (event?.location || ''),
            latitude: (eventFormData.eventId === (event?.id || null))
                ? (eventFormData.latitude ?? SEVILLE_CENTER.latitude)
                : (event?.latitude ?? SEVILLE_CENTER.latitude),
            longitude: (eventFormData.eventId === (event?.id || null))
                ? (eventFormData.longitude ?? SEVILLE_CENTER.longitude)
                : (event?.longitude ?? SEVILLE_CENTER.longitude),
            comment: (eventFormData.eventId === (event?.id || null)) ? eventFormData.comment : (event?.Performance?.comment || ''),
            picture: (eventFormData.eventId === (event?.id || null)) ? eventFormData.picture : (event?.Performance?.picture || null),
            instruments: (eventFormData.eventId === (event?.id || null)) ? eventFormData.instruments : (event?.instrumentsAttended?.map(i => i.id) || []),
            delete_picture: false
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Save form data to context with event ID
                updateEventFormData({ 
                    ...values,
                    eventId: event?.id || null 
                });

                // Navigate to instruments selection
                navigation.navigate('EventInstruments', { band, event });
            } catch (error) {
                console.error('Error al guardar datos del evento:', error);
                showToast('Error', 'Ocurrió un error. Por favor, inténtalo de nuevo.', 'error');
            } finally {
                setSubmitting(false);
            }
        }
    })

    // Transform date to ISO format yyyy-mm-dd without offset
    const setDate = (field, date) => {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Fix UTC offset
        const iso = localDate.toISOString().slice(0, 10);
        formik.setFieldValue(field, iso);
    };

    const setStartDate = (date) => {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const iso = localDate.toISOString().slice(0, 10);
        formik.setFieldValue('date', iso);
        formik.setFieldValue('endDate', iso);
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

    const calculateTwoHoursAfter = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

        const totalMinutes = (hours * 60 + minutes + 120) % (24 * 60);
        const nextHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const nextMinutes = (totalMinutes % 60).toString().padStart(2, '0');

        return `${nextHours}:${nextMinutes}`;
    }

    const getMinutesFromTime = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
        return hours * 60 + minutes;
    }

    const applyEndTimeChange = (value) => {
        formik.setFieldValue('endTime', value);

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) return;

        const startMinutes = getMinutesFromTime(formik.values.initialTime || '');
        const endMinutes = getMinutesFromTime(value);

        if (
            endTimeAutoFilledRef.current &&
            startMinutes !== null &&
            endMinutes !== null &&
            formik.values.date &&
            endMinutes < startMinutes
        ) {
            const nextDay = moment(formik.values.date, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
            formik.setFieldValue('endDate', nextDay);
        }

        // Once user sets a valid end time manually, stop treating it as auto-filled.
        endTimeAutoFilledRef.current = false;
    }

    const setStartTime = (time) => {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const startTime = `${hours}:${minutes}`;

        formik.setFieldValue('initialTime', startTime);

        if (!formik.values.endTime) {
            const suggestedEndTime = calculateTwoHoursAfter(startTime);
            if (suggestedEndTime) {
                formik.setFieldValue('endTime', suggestedEndTime);
                endTimeAutoFilledRef.current = true;
            }
        }
    }

    const handleInitialTimeChange = (value) => {
        formik.setFieldValue('initialTime', value);

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!formik.values.endTime && timeRegex.test(value)) {
            const suggestedEndTime = calculateTwoHoursAfter(value);
            if (suggestedEndTime) {
                formik.setFieldValue('endTime', suggestedEndTime);
                endTimeAutoFilledRef.current = true;
            }
        }
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
        formik.setFieldValue('delete_picture', false);
    };

    // Handle removing the selected image
    const handleImageRemoved = () => {
        setImagePreview(null);
        formik.setFieldValue('picture', null);
        formik.setFieldValue('delete_picture', true);
    };

    // Handle event type change
    const handleEventTypeChange = (type) => {
        setEventType(type);
        formik.setFieldValue('eventType', type);
    }

    const parseCoordinate = (value) => {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const mapLatitude = parseCoordinate(formik.values.latitude) ?? SEVILLE_CENTER.latitude;
    const mapLongitude = parseCoordinate(formik.values.longitude) ?? SEVILLE_CENTER.longitude;

    const buildAddressFromPhoton = (properties = {}) => {
        const city = properties.city || properties.town || properties.village || properties.county || '';
        const street = [properties.street, properties.housenumber].filter(Boolean).join(' ').trim();

        const normalizedCity = city.toLowerCase();
        const normalizedStreet = street.toLowerCase();
        const normalizedName = (properties.name || '').toLowerCase();

        // Keep landmark/place names when they add value (e.g. plaza, auditorium),
        // but avoid duplicating city or street text.
        const placeName = properties.name &&
            normalizedName !== normalizedCity &&
            normalizedName !== normalizedStreet
            ? properties.name
            : '';

        const parts = [placeName, street, city].filter(Boolean);
        return parts.join(', ');
    };

    const handleMapCoordinateChange = async ({ latitude, longitude }) => {
        formik.setFieldValue('latitude', latitude);
        formik.setFieldValue('longitude', longitude);

        const requestId = Date.now();
        reverseGeocodeRequestRef.current = requestId;

        try {
            const response = await fetch(
                `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();

            if (reverseGeocodeRequestRef.current !== requestId) {
                return;
            }

            const firstMatch = data?.features?.[0];
            const resolvedAddress = buildAddressFromPhoton(firstMatch?.properties);

            if (resolvedAddress) {
                formik.setFieldValue('location', resolvedAddress);
            } else {
                formik.setFieldValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
        } catch (error) {
            if (reverseGeocodeRequestRef.current !== requestId) {
                return;
            }

            formik.setFieldValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
    };

    // Show delete confirmation modal
    const handleDeleteEvent = () => {
        setShowDeleteModal(true);
    }

    // Confirm and delete event
    const confirmDeleteEvent = async () => {
        setShowDeleteModal(false);
        try {
            await EventEndpoints.deleteEvent(event.id);
            showToast('Evento eliminado', 'El evento ha sido eliminado correctamente.', 'success');
            navigation.pop(2)
            
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
            showToast('Error', 'Ocurrió un error al eliminar el evento. Por favor, inténtalo de nuevo.', 'error');
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView scrollEnabled={scrollEnabled}>
                <TopContainer title={event ? "Editar Evento" : "Crear Evento"} editEnabled={false} pictureEnabled={true} pictureUrl={band.profile_picture} />
                <View style={styles.bodyContainer}>
                    <View style={styles.tagContainer}>
                        {!event?.Rehearsal && <Tag selected={eventType === 'performances'} onPress={() => handleEventTypeChange('performances')}>Actuación</Tag>}
                        {!event?.Performance && <Tag selected={eventType === 'rehearsals'} onPress={() => handleEventTypeChange('rehearsals')}>Ensayo</Tag>}
                    </View>
                    <View style={styles.formContainer}>
                        {/* EVENT NAME */}
                        <View style={styles.inputContainer}>
                            <Input
                                label={eventType === 'performances' ? "Nombre de la actuación" : "Nombre del evento"}
                                placeholder={eventType === 'performances' ? "Ej. Concierto de Primavera" : "Ej. Ensayo General"}
                                value={formik.values.name}
                                onChangeText={formik.handleChange('name')} />
                            <Error name="name" formik={formik} />
                        </View>
                        {/* PERFORMANCE TYPE */}
                        {eventType === 'performances' &&
                            <View style={styles.inputContainer}>
                                <Input
                                    label="Tipo de actuación"
                                    placeholder="Ej. Concierto, Festival, etc."
                                    value={formik.values.type}
                                    onChangeText={formik.handleChange('type')} />
                                <Error name="type" formik={formik} />
                            </View>}
                        {/* EVENT LOCATION */}
                        <View style={styles.inputContainer}>
                            <AddressAutocomplete
                                label="Ubicación"
                                placeholder="Buscar dirección, calle o plaza"
                                initialValue={formik.values.location}
                                onAddressSelect={({ location, latitude, longitude }) => {
                                    formik.setFieldValue('location', location);
                                    formik.setFieldValue('latitude', latitude);
                                    formik.setFieldValue('longitude', longitude);
                                }}
                            />
                            <Error name="location" formik={formik} />
                            <Error name="latitude" formik={formik} />
                            <Error name="longitude" formik={formik} />
                            <Text style={styles.mapHelperText}>Pulsa o arrastra el marcador para fijar la ubicacion exacta.</Text>
                            <EventMapView
                                latitude={mapLatitude}
                                longitude={mapLongitude}
                                location={formik.values.location || 'Ubicacion del evento'}
                                explorable={true}
                                selectable={true}
                                mapHeight={220}
                                zoomDelta={0.003}
                                onCoordinateChange={handleMapCoordinateChange}
                                onMapTouchStart={() => setScrollEnabled(false)}
                                onMapTouchEnd={() => setScrollEnabled(true)}
                            />
                        </View>
                        {/* EVENT DATE/TIME */}
                        <View style={styles.dateTimeRow}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Fecha Inicio"
                                    placeholder="2024-12-31"
                                    value={formatDate(formik.values.date)}
                                    onChangeText={formik.handleChange('date')}
                                    onPress={() => setShowDatePicker(true)}
                                    textContentType={"date-time"} />
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={formik.values.date ? new Date(formik.values.date) : new Date()}
                                        mode="date"
                                        dateFormat='DD-MM-YYYY'
                                        onChange={(e, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) setStartDate(selectedDate);
                                        }}
                                    />
                                )}
                            </View>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Hora Inicio"
                                    placeholder="HH:MM"
                                    value={formik.values.initialTime}
                                    onChangeText={handleInitialTimeChange}
                                    onPress={() => setShowInitialTimePicker(true)} />
                                {showInitialTimePicker && (
                                    <DateTimePicker
                                        value={getTimeAsDate(formik.values.initialTime)}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={(e, selectTime) => {
                                            setShowInitialTimePicker(false);
                                            if (selectTime) setStartTime(selectTime);
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                        <View style={styles.dateTimeErrorRow}>
                            <Error name="date" formik={formik} />
                            <Error name="initialTime" formik={formik} />
                        </View>
                        <View style={styles.dateTimeRow}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Fecha Fin"
                                    placeholder="2024-12-31"
                                    value={formatDate(formik.values.endDate)}
                                    onChangeText={formik.handleChange('endDate')}
                                    onPress={() => setShowEndDatePicker(true)}
                                    textContentType={"date-time"} />
                                {showEndDatePicker && (
                                    <DateTimePicker
                                        value={formik.values.endDate ? new Date(formik.values.endDate) : (formik.values.date ? new Date(formik.values.date) : new Date())}
                                        mode="date"
                                        dateFormat='DD-MM-YYYY'
                                        onChange={(e, selectedDate) => {
                                            setShowEndDatePicker(false);
                                            if (selectedDate) setDate('endDate', selectedDate);
                                        }}
                                    />
                                )}
                            </View>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Input
                                    label="Hora Fin"
                                    placeholder="HH:MM"
                                    value={formik.values.endTime}
                                    onChangeText={applyEndTimeChange}
                                    onPress={() => setShowEndTimePicker(true)} />
                                {showEndTimePicker && (
                                    <DateTimePicker
                                        value={getTimeAsDate(formik.values.endTime)}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={(e, selectTime) => {
                                            setShowEndTimePicker(false);
                                            if (selectTime) {
                                                const hours = selectTime.getHours().toString().padStart(2, '0');
                                                const minutes = selectTime.getMinutes().toString().padStart(2, '0');
                                                applyEndTimeChange(`${hours}:${minutes}`);
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                        <View style={styles.dateTimeErrorRow}>
                            <Error name="endDate" formik={formik} />
                            <Error name="endTime" formik={formik} />
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
                                    value={formik.values.comment || ''}
                                    onChangeText={formik.handleChange('comment')}
                                    multiline={true}
                                    style={{ borderRadius: 10, paddingTop: 0 }}
                                    numberOfLines={4} />
                                <Error name="comment" formik={formik} />
                            </View>}
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button onPress={formik.handleSubmit} disabled={formik.isSubmitting}>
                            Siguiente
                        </Button>
                        {event && <Text style={styles.deleteText} onPress={handleDeleteEvent}>Eliminar evento</Text>}
                    </View>
                </View>

                <ImagePickerSheet
                    sheetRef={imageSheetRef}
                    imagePreview={imagePreview}
                    onImageSelected={handleImageSelected}
                    onImageRemoved={handleImageRemoved}
                    aspect={[16, 9]}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={showDeleteModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDeleteModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>¿Eliminar evento?</Text>
                            <Text style={styles.modalMessage}>
                                Esta acción no se puede deshacer. El evento será eliminado permanentemente.
                            </Text>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowDeleteModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.deleteButton]}
                                    onPress={confirmDeleteEvent}
                                >
                                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    )

}

export default EventFormScreen

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
    dateTimeRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20
    },
    dateTimeErrorRow: {
        marginTop: -30,
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        marginBottom: 2
    },
    mapHelperText: {
        fontSize: 12,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.darkGray,
        marginTop: 4,
        marginBottom: 8,
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
        alignItems: 'center',
        gap: 15
    },
    deleteText: {
        fontSize: 16,
        paddingInline: 5,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.red,
        borderBottomWidth: 2,
        borderBottomColor: GlobalStyles.red,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Oswald_600',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: '#666',
        marginBottom: 25,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 50,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: GlobalStyles.yellow,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyles.blue,
    },
    deleteButton: {
        backgroundColor: GlobalStyles.red,
    },
    deleteButtonText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: 'white',
    }
})