import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment';
import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Input from '../../../components/Input';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const InfoEditScreen = ({ route }) => {
    const { label, value, keyboardType, schema } = route.params;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { editMusician } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const searchTimeoutRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        console.log('Mounted InfoEditScreen with params:', route.params);
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
                if (schema === 'location' && selectedCoordinates) {
                    formData.append('latitude', selectedCoordinates.latitude.toString());
                    formData.append('longitude', selectedCoordinates.longitude.toString());
                }
                
                handleEditSubmit(formData);
            } catch (err) {
                Alert.alert('Error', err?.response?.data?.message || 'No se pudo guardar la información.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleEditSubmit = async (payload) => {
        try {
            await editMusician(payload);
            navigation.goBack();
        } catch (err) {
            setError(err.message);
        }
    }

    const fetchLocationSuggestions = async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            const cityResults = data.features.filter(item => item.properties.type === 'city');
            
            setSuggestions(cityResults);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]);
        }
    };

    const handleSearch = (text) => {
        setQuery(text);
        formik.setFieldValue('location', text);
        
        // Limpiar coordenadas si el usuario modifica el texto
        setSelectedCoordinates(null);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            fetchLocationSuggestions(text);
        }, 500);
    };

    const handleSelectLocation = (item) => {
        const locationName = `${item.properties.name}, ${item.properties.county}, ${item.properties.state}`;
        formik.setFieldValue('location', locationName);
        setQuery(locationName);
        
        // Guardar las coordenadas
        const [longitude, latitude] = item.geometry.coordinates;
        setSelectedCoordinates({ latitude, longitude });
        
        setSuggestions([]);
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
        console.log('submit invoked, values:', formik.values, 'schema:', schema);
        
        // Validar que se hayan seleccionado coordenadas si se está editando ubicación
        if (schema === 'location' && !selectedCoordinates) {
            Alert.alert('Ubicación no válida', 'Por favor, selecciona una ubicación de las sugerencias.');
            return;
        }
        
        try {
            const errors = await formik.validateForm();
            console.log('validation errors:', errors);
            if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
            } else {
                Alert.alert('Errores en el formulario', 'Revisa los campos antes de guardar.');
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
                <View style={{ width: '100%', marginTop: -10 }}>
                    <Text style={{ fontFamily: 'Oswald_400', fontSize: 16, textAlign: 'left', color: GlobalStyle.darkGray }}>
                        Escribe aquí tu {label}
                    </Text>
                </View>
            </TopContainer>
            <View style={{ flex: 1, padding: 20, marginTop: -50 }}>
                {schema != 'birthday' && schema != 'location' && <Input
                    value={formik.values[schema]}
                    keyboardType={keyboardType}
                    onChangeText={(text) => formik.setFieldValue(schema, text)}
                />}
                {schema == 'birthday' && <Input
                    value={formatDate(formik.values[schema])}
                    keyboardType={keyboardType}
                    onChangeText={(text) => formik.setFieldValue(schema, text)}
                    textContentType={'datetime'}
                    onPress={() => {
                        setShowDatePicker(true);
                    }}
                />}
                {schema == 'location' && (
                    <>
                        <Input
                            value={query}
                            placeholder={"Ciudad, Localidad, Pueblo..."}
                            onChangeText={handleSearch}
                        />
                        <Text style={styles.helperText}>Selecciona una ubicación de las sugerencias</Text>
                        {query && suggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                {suggestions.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectLocation(item)}
                                    >
                                        <Text style={styles.suggestionText}>{item.properties.name}</Text>
                                        {item.properties.state && (
                                            <Text style={styles.suggestionSubtext}>{item.properties.county}, {item.properties.state}, {item.properties.country}</Text>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </>
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

export default InfoEditScreen

const styles = StyleSheet.create({
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    },
    helperText: {
        color: GlobalStyle.darkGray,
        fontFamily: 'Oswald_400',
        fontSize: 12,
        marginTop: 4,
    },
    suggestionsContainer: {
        backgroundColor: GlobalStyle.white,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: GlobalStyle.gray,
        marginTop: 8,
        paddingInline: 5,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
    },
    suggestionSubtext: {
        fontSize: 12,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        marginTop: 2,
    },
})