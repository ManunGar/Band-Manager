import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useCallback, useRef } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import BandEndpoints from '../../../api/BandEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import Input from '../../../components/Input';
import LinkText from '../../../components/LinkText';
import ProfilePhotoSheet from '../../../components/ProfilePhotoSheet';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle.js';
import { assertSizeLT3MB } from '../../../helpers/ImageHelpers';


const schema = Yup.object({
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
});

const EditBandScreen = ({ route }) => {
    const { band } = route.params;
    const sheetRef = useRef(null);
    const navigation = useNavigation();

    // Close the bottom sheet when the screen is unfocused
    useFocusEffect(
        useCallback(() => {
            return () => {
                sheetRef.current?.dismiss();
            };
        }, [])
    );

    // Formik setup
    const formik = useFormik({
        initialValues: {
            name: band.name || '',
            location: band.location || '',
            phone: band.phone || '',
            type: band.type || ''
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    name: values.name,
                    location: values.location,
                    phone: values.phone,
                    type: values.type
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
            const updatedBand = await BandEndpoints.editBand(band.id, payload);
            navigation.goBack();
        } catch (err) {
            setError(err.message);
        }
    }

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const uploadingProfilePicture = async (uri) => {
        await assertSizeLT3MB(uri);
        const form = new FormData();
        form.append('profile_picture', {
            uri: uri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
        });
        await BandEndpoints.editBandProfilePicture(band.id, form);
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView>
                <TopContainer
                    title={"Editar Banda"}
                    saveEnabled={true}
                    editEnabled={false}
                    onSave={formik.handleSubmit}
                >
                    <View style={{ alignItems: 'center' }}>
                        <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 100, height: 100, borderRadius: 10 }} />
                        <LinkText onPress={openSheet}>Cambiar foto</LinkText>
                    </View>
                </TopContainer>
                <ProfilePhotoSheet
                    sheetRef={sheetRef}
                    uploadingFunction={uploadingProfilePicture}
                    deleteProfilePicture={() => BandEndpoints.deleteBandProfilePicture(band.id)}
                />
                {/* Band Information */}
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

export default EditBandScreen

const styles = StyleSheet.create({
    formContainer: {
        paddingHorizontal: 30,
        paddingBottom: 30,
        marginTop: 40,
        gap: 20
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
})