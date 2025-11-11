import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Input from '../../../components/Input';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const InfoEditScreen = ({ route }) => {
    const { label, value, keyboardType, schema } = route.params;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { editMusician } = useContext(AuthContext);
    const [error, setError] = useState(null);
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
                const payload = {
                    [schema]: values[schema]
                };
                handleEditSubmit(payload);
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
                {schema != 'birthday' && <Input
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
    }
})