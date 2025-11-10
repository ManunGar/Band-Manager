import moment from 'moment/moment';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackIcon from '../../../components/icons/BackIcons';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const AccountEditScreen = () => {
    const { editMusician, user } = useContext(AuthContext);

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
        <ScrollView>
            <TopContainer
                title="Editar Cuenta"
                editEnabled={false}
                style={{ marginBottom: 10 }} />
            <View style={styles.form}>
                <FormRow label="Nombre completo" value={user.full_name} />
                <FormRow label="Correo electrónico" value={user.email} />
                <FormRow label="Teléfono" value={user.phone} />
                <FormRow label="Fecha de nacimiento" value={formatDate(user.birthday)} />
                <FormRow label="Nombre de usuario" value={user.username} />
                <FormRow label="Contraseña" alt="Cambiar contraseña" />
            </View>
        </ScrollView>
    )
}

const FormRow = ({label, value, alt}) => {
    return (
        <TouchableOpacity style={styles.formRow}>
            <Text style={{ fontFamily: 'Oswald_500', fontSize: 16 }}>
                {label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, alignContent: 'center' }}>
                <Text style={{ fontFamily: 'Oswald_400', fontSize: 14, 
                        color: value ? GlobalStyle.black : GlobalStyle.darkGray }}>
                    {value || alt || 'No especificado'}
                </Text>
                <BackIcon
                    width={8}
                    fill={GlobalStyle.darkGray}
                    style={{ transform: [{ rotate: '180deg' }], marginBottom: -2 }} />
            </View>
        </TouchableOpacity>
    )
}

export default AccountEditScreen

const styles = StyleSheet.create({
    form: {
        paddingHorizontal: 20,
        marginHorizontal: 10,
        paddingVertical: 20,
        gap: 25,
        borderRadius: 10,
        alignContent: 'center',
        backgroundColor: GlobalStyle.white,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
})