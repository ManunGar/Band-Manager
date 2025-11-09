import { Image, StyleSheet, Text, View } from 'react-native'
import * as GlobalStyle from '../GlobalStyle'

const InstrumentLevel = ({ instrument }) => {
    
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                <Image
                    source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }}
                    style={{ width: 40, height: 40 }}
                />
                <View>
                    <Text style={styles.name}>{instrument.name}</Text>
                    <Text style={styles.level}>{instrument.MusicianLevel.level}</Text>
                </View>
            </View>
        </View>
    )
}

export default InstrumentLevel

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    name: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    level: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        marginTop: -4,
        color: GlobalStyle.black,
        textTransform: 'capitalize'
    }
})