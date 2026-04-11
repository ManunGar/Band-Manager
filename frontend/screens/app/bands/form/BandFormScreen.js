import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import BandEndpoints from '../../../../api/BandEndpoints';
import BottomSheet from '../../../../components/BottomSheet';
import Button from '../../../../components/Button';
import Error from '../../../../components/Error';
import ImagePickerSheet from '../../../../components/ImagePickerSheet';
import Input from '../../../../components/Input';
import LinkText from '../../../../components/LinkText';
import TopContainer from '../../../../components/TopContainer';
import { useBandForm } from '../../../../contexts/BandFormContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyles from '../../../../GlobalStyle';

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
})

const BandFormScreen = ({ route }) => {
    const { band } = route.params || {};
    const { bandFormData, updateBandFormData } = useBandForm();
    const { showToast } = useToast();
    const [imagePreview, setImagePreview] = useState(bandFormData.profile_picture || band?.profile_picture || null);
    const navigation = useNavigation();

    const imageSheetRef = useRef(null);
    const deleteSheetRef = useRef(null);

    const formik = useFormik({
        initialValues: {
            name: bandFormData.name || band?.name || '',
            location: bandFormData.location || band?.location || '',
            phone: bandFormData.phone || band?.phone || '',
            type: bandFormData.type || band?.type || '',
            instruments: bandFormData.instruments || {},
            profile_picture: bandFormData.profile_picture || band?.profile_picture || null,
            delete_profile_picture: false
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setSubmitting(true);
                if (!band) {
                    updateBandFormData(values);
                    navigation.navigate('BandInstruments', { band: null });
                } else {
                    await BandEndpoints.editBand(band.id, values);
                    // Navigate back to the appropriate screen based on navigation state
                    if (navigation.canGoBack()) {
                        // Go back to the top of the current stack
                        navigation.goBack();
                    } else {
                        // Fallback to MyBands if we can't go back
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MyBands' }],
                        })
                    }
                }
            } catch (error) {
                console.error(error?.response?.data || error);
                band ?
                    showToast('Error', error?.response?.data?.message || 'No se pudo actualizar la banda. Inténtalo de nuevo más tarde.', 'error') :
                    showToast('Error', error?.response?.data?.message || 'No se pudo crear la banda. Inténtalo de nuevo más tarde.', 'error');
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Handle image selection
    const handleImageSelected = (imageUri) => {
        setImagePreview(imageUri);
        formik.setFieldValue('profile_picture', imageUri);
        formik.setFieldValue('delete_profile_picture', false);
    };

    // Handle removing the selected image
    const handleImageRemoved = () => {
        setImagePreview(null);
        formik.setFieldValue('profile_picture', null);
        formik.setFieldValue('delete_profile_picture', true);
    };

    // Show delete confirmation bottom sheet
    const handleDeleteBand = () => {
        deleteSheetRef.current?.present();
    }

    // Confirm and delete band
    const confirmDeleteBand = async () => {
        deleteSheetRef.current?.dismiss();
        try {
            await BandEndpoints.deleteBand(band.id);
            navigation.pop(2)

        } catch (error) {
            console.error('Error al eliminar la banda:', error);
            showToast('Error', 'Ocurrió un error al eliminar la banda. Por favor, inténtalo de nuevo.', 'error');
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={true}>
                <TopContainer
                    title="Crear banda"
                    editEnabled={false}
                />
                <View style={styles.bodyContainer}>

                    <View style={styles.formContainer} >
                        <View style={{ marginTop: -25, marginBottom: 30 }}>
                            <Text style={styles.label}>Logo de la Banda</Text>
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
                        </View>
                        <View style={styles.inputContainer}>
                            <Input
                                label="Nombre de la banda"
                                value={formik.values.name}
                                placeholder={"Introduce el nombre de la banda"}
                                onChangeText={formik.handleChange('name')}
                            />
                            <Error name="name" formik={formik} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Input
                                label="Lugar de origen"
                                value={formik.values.location}
                                placeholder={"Introduce el lugar de origen"}
                                onChangeText={formik.handleChange('location')}
                            />
                            <Error name="location" formik={formik} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Input
                                label="Número de teléfono"
                                value={formik.values.phone}
                                placeholder={"Introduce el número de teléfono"}
                                onChangeText={formik.handleChange('phone')}
                            />
                            <Error name="phone" formik={formik} />
                        </View>
                        <View style={styles.inputContainer}>
                            <Input
                                label="Tipo de banda"
                                value={formik.values.type}
                                placeholder={"Introduce el tipo de banda"}
                                onChangeText={formik.handleChange('type')}
                            />
                            <Error name="type" formik={formik} />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button onPress={formik.handleSubmit} disabled={formik.isSubmitting}>
                            {band ? 'Guardar cambios' : 'Siguiente'}
                        </Button>
                        {band && <Text style={styles.deleteText} onPress={handleDeleteBand}>Eliminar banda</Text>}
                    </View>

                    <ImagePickerSheet
                        sheetRef={imageSheetRef}
                        imagePreview={imagePreview}
                        onImageSelected={handleImageSelected}
                        onImageRemoved={handleImageRemoved}
                    />

                    <BottomSheet sheetRef={deleteSheetRef} snapPoints={['38%']} style={{ gap: 14 }}>
                        <Text style={styles.sheetTitle}>¿Eliminar banda?</Text>
                        <Text style={styles.sheetMessage}>
                            Esta acción no se puede deshacer. La banda será eliminada permanentemente.
                        </Text>
                        <TouchableOpacity
                            style={styles.dangerAction}
                            onPress={confirmDeleteBand}
                        >
                            <Text style={styles.dangerActionText}>Eliminar banda</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryAction}
                            onPress={() => deleteSheetRef.current?.dismiss()}
                        >
                            <Text style={styles.secondaryActionText}>Cancelar</Text>
                        </TouchableOpacity>
                    </BottomSheet>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}


export default BandFormScreen

const styles = StyleSheet.create({

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    bodyContainer: {
        flex: 1,
        paddingHorizontal: 25,
        marginBottom: 100,
    },
    formContainer: {
        marginTop: 45,
        flex: 1,
        alignItems: 'center',
        gap: 15,
    },
    buttonContainer: {
        marginTop: 30,
        alignItems: 'center',
        gap: 15
    },
    inputContainer: {
        marginBottom: 20,
        width: '100%'
    },
    label: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        marginBottom: 2,
        textAlign: 'center',
    },
    selectImageButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f1eade',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: 128,
        height: 128,
        borderWidth: 2,
        borderColor: GlobalStyles.yellow,
        borderStyle: 'dashed'
    },
    selectImageText: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.yellow,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        alignItems: 'center',
        gap: 10
    },
    imagePreview: {
        width: 128,
        height: 128,
        borderRadius: 10,
        backgroundColor: GlobalStyles.white
    },
    deleteText: {
        fontSize: 16,
        paddingInline: 5,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.red,
        borderBottomWidth: 2,
        borderBottomColor: GlobalStyles.red,
    },
    sheetTitle: {
        fontSize: 22,
        fontFamily: 'Oswald_600',
        color: GlobalStyles.black,
        textAlign: 'center',
    },
    sheetMessage: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyles.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    dangerAction: {
        backgroundColor: '#fef2f2',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    dangerActionText: {
        fontWeight: '600',
        color: '#dc2626',
    },
    secondaryAction: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#e5e7eb'
    },
    secondaryActionText: {
        fontWeight: '600',
        color: '#111827',
    }
})