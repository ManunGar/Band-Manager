import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import profileDefault from '../../../assets/milestones/profile_default.png';
import LogoutIcon from '../../../components/icons/LogoutIcon';
import RightArrowIcon from '../../../components/icons/RightArrowIcon';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const ConfigurationScreen = ({ route }) => {
    const { logout } = useContext(AuthContext)
    const { musician } = route.params;
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <TopContainer backEnabled title={'Configuración'} editEnabled={false}
                style={{ alignItems: 'flex-start' }}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                        style={styles.profileImage}
                    />
                    <View style={styles.musicianInfoContainer}>
                        <Text style={styles.nameText}>{musician?.full_name}</Text>
                        <Text style={styles.usernameText}>@{musician?.username}</Text>
                        <LinkText onPress={() => navigation.navigate('AccountEdit')}>Editar Perfil</LinkText>
                    </View>
                </View>
            </TopContainer>
            <ScrollView style={styles.bodyContainer}>
                <Text style={styles.sectionTitle}>Cuenta</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('PasswordForm')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.subSectionTitle}>Cambiar contraseña</Text>
                        <RightArrowIcon fill={GlobalStyle.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <LogoutIcon width={25} height={25} strokeWidth={0.5} stroke={GlobalStyle.red} fill={GlobalStyle.red} />
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.sectionTitle}>Aplicación</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <View style={styles.subSectionContainer}>
                            <Text style={styles.subSectionTitle}>Tema</Text>
                            <LinkText>Claro</LinkText>
                        </View>
                        <RightArrowIcon fill={GlobalStyle.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <View>
                            <Text style={styles.subSectionTitle}>Idioma</Text>
                            <LinkText>Español</LinkText>
                        </View>
                        <RightArrowIcon fill={GlobalStyle.gray} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.sectionTitle}>Ayuda</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.subSectionContainer}>
                        <Text style={styles.subSectionTitle}>Sobre la aplicación</Text>
                        <Text style={styles.subSectionText}>Versión 0.1.2</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default ConfigurationScreen
const styles = StyleSheet.create({
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
    },
    profileImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    musicianInfoContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    nameText: {
        fontFamily: 'Oswald_500',
        fontSize: 22
    },
    usernameText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        marginTop: -5,
        color: GlobalStyle.gray
    },
    bodyContainer: {
        flex: 1,
        paddingInline: 25,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        textTransform: 'uppercase',
        color: GlobalStyle.gray,
        marginBottom: 15
    },
    sectionContainer: {
        paddingInline: 10,
        marginBottom: 40,
        gap: 15,
    },
    subSectionContainer: {
        flexDirection: 'column',
    },
    subSectionTitle: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
    },
    subSectionText: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.gray
    },
    logoutText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.red,
    }
})