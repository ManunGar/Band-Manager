import { Image, StyleSheet, Text, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const Component = ({ component }) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: component.musician.user.profile_picture }} style={{ width: 60, height: 60, borderRadius: 30 }} />
            <View>
                <Text style={styles.name}>{component.musician.user.full_name}</Text>
                <View style={styles.instrument}>
                    <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${component.instruments[0]?.image}` }} style={{ width: 18, height: 18, marginTop: 4 }} />
                    <Text style={styles.instrumentText}>{component.instruments[0]?.name}</Text>
                </View>
            </View>
        </View>
    );
}

export default Component;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    name: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.black,
        marginBottom: -5
    },
    instrument: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    instrumentText: {
        fontFamily: 'Oswald_300',
        fontSize: 18,
        color: GlobalStyle.darkGray,
    }
})
