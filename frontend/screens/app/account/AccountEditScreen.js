import { useNavigation } from '@react-navigation/native';
import moment from 'moment/moment';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Input from '../../../components/Input';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const AccountEditScreen = () => {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();

    const formatDate = (date) => {
        return date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
    }

    const goToForm = (label, value, keyboardType, schema) => {
        navigation.navigate('AccountForm', { label, value, keyboardType, schema });
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TopContainer
                title="Editar Perfil"
                editEnabled={false}
                style={{ marginBottom: 0 }}
            />

            <View style={styles.sections}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos Personales</Text>
                    <View style={styles.card}>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Nombre completo"
                                value={user.full_name}
                                onPress={() => goToForm('Nombre completo', user.full_name, 'default', 'full_name')}
                            />
                        </View>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Fecha de nacimiento"
                                value={formatDate(user.birthday)}
                                keyboardType="datetime"
                                onPress={() => goToForm('Fecha de nacimiento', user.birthday, 'datetime', 'birthday')}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    <View style={styles.card}>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Teléfono"
                                value={user.phone}
                                keyboardType="numeric"
                                onPress={() => goToForm('Teléfono', user.phone, 'numeric', 'phone')}
                            />
                        </View>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Ubicación"
                                value={user.location}
                                onPress={() => goToForm('Ubicación', user.location, 'default', 'location')}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuenta</Text>
                    <View style={styles.card}>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Correo electrónico"
                                value={user.email}
                                keyboardType="email-address"
                                onPress={() => goToForm('Correo electrónico', user.email, 'email-address', 'email')}
                            />
                        </View>
                        <View style={styles.fieldWrapper}>
                            <Input
                                label="Nombre de usuario"
                                value={user.username}
                                onPress={() => goToForm('Nombre de usuario', user.username, 'default', 'username')}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default AccountEditScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    content: {
        paddingBottom: 40,
    },
    sections: {
        paddingHorizontal: 20,
        paddingTop: 24,
        gap: 24,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        color: GlobalStyle.gray,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    fieldWrapper: {
        paddingTop: 44,
    },
})
