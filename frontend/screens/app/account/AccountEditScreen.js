import { useNavigation } from '@react-navigation/native';
import moment from 'moment/moment';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackIcon from '../../../components/icons/BackIcons';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const AccountEditScreen = () => {
    const { user } = useContext(AuthContext);

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
                <FormRow label="nombre completo" value={user.full_name} schema="full_name" />
                <FormRow label="correo electrónico" value={user.email} keyboardType="email-address" schema="email" />
                <FormRow label="teléfono" value={user.phone} keyboardType="numeric" schema="phone" />
                <FormRow label="fecha de nacimiento" value={formatDate(user.birthday)} keyboardType="datetime" schema="birthday"/>
                <FormRow label="nombre de usuario" value={user.username} schema="username" />
            </View>
        </ScrollView>
    )
}

const FormRow = ({label, value, alt, keyboardType, schema}) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.formRow} onPress={() => navigation.navigate('InfoEdit', {label, value, keyboardType, schema})}>
            <Text style={{ fontFamily: 'Oswald_500', fontSize: 16, textTransform: 'capitalize', flex: 1 }}>
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