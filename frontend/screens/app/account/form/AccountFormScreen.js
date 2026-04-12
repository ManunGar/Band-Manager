import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Input from '../../../../components/Input';
import LocationAutocomplete from '../../../../components/LocationAutocomplete';
import TopContainer from '../../../../components/TopContainer';
import { AuthContext } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const AccountFormScreen = ({ route }) => {
    const { label, value, keyboardType, schema } = route.params;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { editMusician } = useContext(AuthContext);
    const { showToast } = useToast();
    const [error, setError] = useState(null);
    const [locationData, setLocationData] = useState({ location: value || '', latitude: null, longitude: null });
    const navigation = useNavigation();

    useEffect(() => {
    }, [route.params])

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: value || '',
            username: value || '',
            full_name: value || '',
            birthday: value || '',
            location: value || '',
            phone: value || '',
        },
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const formData = new FormData();
                formData.append(schema, values[schema]);
                
                // Add coordinates if location is being edited and coordinates are selected
                if (schema === 'location' && locationData.latitude && locationData.longitude) {
                    formData.append('latitude', locationData.latitude.toString());
                    formData.append('longitude', locationData.longitude.toString());
                }
                
                handleEditSubmit(formData);
            } catch (err) {
                showToast('Error', err?.response?.data?.message || 'No se pudo guardar la información.', 'error');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleEditSubmit = async (payload) => {
        try {
            await editMusician(payload);
            showToast('Perfil actualizado', 'Los cambios han sido guardados correctamente.', 'success');
            navigation.goBack();
        } catch (err) {
            setError(err.message);
        }
    }

    const handleLocationChange = (data) => {
        setLocationData(data);
        formik.setFieldValue('location', data.location);
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

    const submit = async () => {        
        // Validar que se hayan seleccionado coordenadas si se está editando ubicación
        if (schema === 'location' && locationData.location && (!locationData.latitude || !locationData.longitude)) {
            showToast('Ubicación no válida', 'Por favor, selecciona una ubicación de las sugerencias.', 'warning');
            return;
        }

        try {
            const errors = await formik.validateForm();
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
            } else {
                showToast('Errores en el formulario', 'Revisa los campos antes de guardar.', 'warning');
            }
        } catch (err) {
            console.error('validateForm error', err);
            formik.handleSubmit();
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: GlobalStyle.white }}>
            <TopContainer
                saveEnabled={true}
                editEnabled={false}
                onSave={submit}>
            </TopContainer>
            <View style={{ flex: 1, padding: 20, marginTop: -50 }}>
                {schema != 'birthday' && schema != 'location' && <Input
                    label={label}
                    value={formik.values[schema]}
                    keyboardType={keyboardType}
                    onChangeText={(text) => formik.setFieldValue(schema, text)}
                />}
                {schema == 'birthday' && <Input
                    label={label}
                    value={formatDate(formik.values[schema])}
                    keyboardType={keyboardType}
                    onChangeText={(text) => formik.setFieldValue(schema, text)}
                    textContentType={'datetime'}
                    onPress={() => {
                        setShowDatePicker(true);
                    }}
                />}
                {schema == 'location' && (
                    <LocationAutocomplete
                        initialValue={value || ''}
                        onLocationSelect={handleLocationChange}
                    />
                )}
                {showDatePicker && (
                    <DateTimePicker
                        value={formik.values[schema] ? new Date(formik.values[schema]) : new Date()}
                        mode="date"
                        dateFormat='DD-MM-YYYY'
                        onChange={(e, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setBirthday(selectedDate);
                        }}
                        maximumDate={new Date()}
                    />
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        </View>
    )
}

export default AccountFormScreen

const styles = StyleSheet.create({
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    },
})