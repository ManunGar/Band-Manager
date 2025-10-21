import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import BandManagerIcon from '../../components/icons/BandManager';
import Input from '../../components/Input';
import { AuthContext } from '../../contexts/AuthContext';
import * as GlobalStyle from '../../GlobalStyle';

const { width: SCREEN_W } = Dimensions.get('window');

const LoginScreen = () => {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const { login, user } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            await login({ username, password });
            console.log('Logging in with:', { username, password });
        } catch (error) {
            setError(error.message);
        }
    }

    const goToRegister = () => {
        navigation.navigate('Register');
    }


    return (
        <View style={styles.container}>
            <View>
                <View style={styles.headerContainer}>
                    <BandManagerIcon width={50} height={50} stroke={GlobalStyle.black} strokeWidth={40} />
                    <Text style={styles.title}>Band Manager</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.h1}>INICIAR SESIÓN</Text>
                    <View style={styles.h2Container}>
                        <Text style={[styles.h2, { color: GlobalStyle.gray }]}>¿Músico nuevo?</Text>
                        <Pressable onPress={goToRegister}>
                            <Text style={[styles.h2, { color: GlobalStyle.yellow }]}>Registrate aquí</Text>
                        </Pressable>
                    </View>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <View style={styles.inputContainer}>
                        <Input
                            placeholder={'Introduzca un correo o nombre de usuario'}
                            label={'Nombre de Usuario'}
                            value={username}
                            onChangeText={setUsername}
                        />
                        <Input
                            placeholder={'Introduzca su contraseña'}
                            label={'Contraseña'}
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>
                <Pressable>
                    <Text style={styles.h3}>¿Olvidaste tu contraseña?</Text>
                </Pressable>
            </View>
            <Button onPress={handleLogin}>Iniciar Sesión</Button>
        </View>
    )
}

export default LoginScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 25,
        justifyContent: 'space-between',
        backgroundColor: GlobalStyle.white,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Oswald_700',
        marginBottom: 2,
    },
    formContainer: {
        marginTop: 68,
        borderRadius: 8,
        width: SCREEN_W - 50,
    },
    h1: {
        fontSize: 65,
        fontFamily: 'BebasNeue',
    },
    h2Container: {
        flexDirection: 'row',
        gap: 5,
        marginTop: -10,
        marginBottom: 0,
    },
    h2: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
    },
    h3: {
        fontSize: 14,
        fontFamily: 'Oswald_500',
        textAlign: 'right',
    },
    inputContainer: {
        gap: 34,
        marginBottom: 3,
        marginTop: 30,
    },
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
});
