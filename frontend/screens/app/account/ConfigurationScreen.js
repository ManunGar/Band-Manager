import { useContext } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import profileDefault from '../../../assets/milestones/profile_default.png';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const ConfigurationScreen = ({ route }) => {
    const { logout } = useContext(AuthContext)
    const { musician } = route.params;

  return (
    <View style={{ flex: 1 }}>
        <TopContainer backEnabled title={'Configuración'} editEnabled={false}
            style={{ alignItems: 'flex-start' }}>
            <View style={styles.profileImageContainer}>
                <Image 
                    source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                    style={styles.profileImage}
                />
                <View style={ styles.musicianInfoContainer }>
                    <Text style={styles.nameText}>{musician?.full_name}</Text>
                    <Text style={styles.usernameText}>@{musician?.username}</Text>
                    <LinkText>Editar Perfil</LinkText>
                </View>
            </View>
        </TopContainer>
      <View style={styles.bodyContainer}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.sectionContainer}>
            <Text style={styles.logoutText} onPress={logout}>Cerrar sesión</Text>
        </View>
      </View>
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
        paddingInline: 10
    },
    logoutText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.red,
    }
})