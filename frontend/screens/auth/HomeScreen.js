import { useNavigation } from '@react-navigation/native';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as GlobalStyle from '../../GlobalStyle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = () => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Band Manager </Text>
            <Image source={require('../../assets/milestones/band_manager_image.png')} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>¡Bienvenido/a!</Text>
                <Text style={styles.infoDescription}>Descubre las ofertas y contratos disponibles que mejor se adaptan a tus necesidades en la mayor red de músicos. Gestiona también tus bandas, componentes, contratos y mucho más. ¿A que esperas para unirte?</Text>
                <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Música maestro</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.4,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 60,
        marginTop: 40,
        fontFamily: 'BebasNeue',
    },
    infoContainer: {
        width: SCREEN_WIDTH * 0.9,
        marginHorizontal: SCREEN_WIDTH * 0.05,
        alignItems: 'flex-start',
        marginBottom: 30
    },
    infoTitle: {
        fontSize: 18,
        fontFamily: 'Oswald_500',
    },
    infoDescription: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.darkGray,
    },
    button: {
        backgroundColor: GlobalStyle.yellow,
        width: SCREEN_WIDTH * 0.9,
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 30
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Oswald_600',
        color: GlobalStyle.blue
    }
})