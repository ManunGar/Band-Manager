import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const Band = ({ band }) => {
    const navigation = useNavigation();


    return (
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('BandDetails', { band: band })}>
            <Image source={{ uri: band.profile_picture }} style={{ width: 85, height: 80 }} />
            <View style={{ marginLeft: 13, flex: 1, flexShrink: 1 }}>
                <Text style={styles.bandType} numberOfLines={1} ellipsizeMode="tail">{band.type}</Text>
                <Text style={styles.bandName} numberOfLines={1} ellipsizeMode="tail">{band.name}</Text>
                <Text style={styles.bandLocation} numberOfLines={1} ellipsizeMode="tail">{band.location}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default Band

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.white,
        borderRadius: 10,
        flexDirection: 'row',
        padding: 10
    },
    bandType: {
        fontFamily: 'Oswald_500',
        fontSize: 12,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase'
    },
    bandName: {
        fontFamily: 'BebasNeue',
        fontSize: 28,
        color: GlobalStyle.black,
    },
    bandLocation: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.darkGray,
        marginTop: -6
    }
})