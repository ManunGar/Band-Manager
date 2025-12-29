import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as GlobalStyle from '../GlobalStyle';

const Instrument = ({ instrument, onPress, uploading }) => {
    const levelLabel = instrument.principal ? 'Instrumento Principal' : instrument.level;
    return (
        <TouchableOpacity disabled={uploading} onPress={onPress} style={[InstrumentStyles.instrumentContainer, instrument.selected && { borderColor: GlobalStyle.yellow }]}>
            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }} style={{ width: 40, height: 40 }} />
            <View>
                <Text style={InstrumentStyles.instrumentName}>{instrument.name}</Text>
                {levelLabel && <Text style={InstrumentStyles.instrumentLevel}>{levelLabel}</Text>}
            </View>
        </TouchableOpacity>
    )
}

export default Instrument;

const InstrumentStyles = StyleSheet.create({
    instrumentContainer: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 8,
        backgroundColor: GlobalStyle.white,
        borderColor: GlobalStyle.white,
        flexDirection: 'row',
        gap: 15,
    },
    instrumentName: {
        fontSize: 18,
        fontFamily: 'BebasNeue'
    },
    instrumentLevel: {
        fontSize: 14,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.darkGray,
        marginTop: -4,
        textTransform: 'capitalize',
    }
})