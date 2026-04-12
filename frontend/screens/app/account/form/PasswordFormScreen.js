import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import AuthEndpoints from '../../../../api/AuthEndpoints';
import Button from '../../../../components/Button';
import Error from '../../../../components/Error';
import Input from '../../../../components/Input';
import TopContainer from '../../../../components/TopContainer';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const schema = Yup.object({
    currentPassword: Yup.string().required('La contraseña actual es requerida'),
    password: Yup.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').required('La nueva contraseña es requerida'),
    repeatPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
        .required('Confirmar la nueva contraseña es requerido'),
})
const PasswordFormScreen = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            password: '',
            repeatPassword: ''
        },
        validationSchema: schema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting }) => {
            // Handle form submission
            try {
                setSubmitting(true);
                await AuthEndpoints.changePassword(values);
                navigation.goBack();
            } catch (error) {
                console.error(error);
                const errorMessage = error?.message || 'Ocurrió un error al cambiar la contraseña. Por favor, intenta nuevamente.';
                showToast('Error', errorMessage, 'error');
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: 'height' })}>
            <TopContainer title="Cambiar contraseña" editEnabled={false} />
            <View style={{ paddingHorizontal: 20, gap: 20, marginTop: 40 }}>
                <View style={styles.inputContainer}>
                    <Input
                        label="Contraseña actual"
                        placeholder="Ingresa tu contraseña actual"
                        secureTextEntry
                        value={formik.values.currentPassword}
                        onChangeText={formik.handleChange('currentPassword')}
                    />
                    <Error name="currentPassword" formik={formik} />
                </View>
                <View style={styles.inputContainer}>
                    <Input
                        label="Nueva contraseña"
                        placeholder="Ingresa tu nueva contraseña"
                        secureTextEntry
                        value={formik.values.password}
                        onChangeText={formik.handleChange('password')}
                    />
                    <Error name="password" formik={formik} />
                </View>
                <View style={styles.inputContainer}>
                    <Input
                        label="Confirmar nueva contraseña"
                        placeholder="Confirma tu nueva contraseña"
                        secureTextEntry
                        value={formik.values.repeatPassword}
                        onChangeText={formik.handleChange('repeatPassword')}
                    />
                    <Error name="repeatPassword" formik={formik} />
                </View>
                <Text style={{ color: GlobalStyle.gray, fontSize: 12, fontFamily: 'Oswald_400' }}>
                    {"¡La seguridad es importante para nosotros!\n" +
                        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."}
                </Text>
                <Button
                    onPress={formik.handleSubmit}
                    disabled={formik.isSubmitting}
                >
                    Guardar cambios
                </Button>
            </View >
        </KeyboardAvoidingView >
    )
}

export default PasswordFormScreen

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 20,
        width: '100%'
    },
})