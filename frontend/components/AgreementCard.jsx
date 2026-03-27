import { Image, StyleSheet, Text, View } from 'react-native'
import bandProfileDefault from '../assets/milestones/band_default.png'
import * as GlobalStyle from '../GlobalStyle'
import { parseDate } from '../helpers/ParseHelpers'

const AgreementCard = ({ agreement }) => {
    return (
        <View style={styles.cardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <Image style={styles.bandImage} source={agreement?.performance?.Event?.band?.profile_picture ? { uri: agreement?.performance?.Event?.band?.profile_picture } : bandProfileDefault} />
                <View>
                    <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.darkGray, fontSize: 14 }}> {agreement.amount} {agreement?.instrument?.name} </Text>
                    <Text style={{ color: GlobalStyle.black, fontFamily: 'Oswald_400', fontSize: 16, marginTop: -5 }}> {agreement?.performance?.Event?.band?.name} </Text>
                </View>
            </View>
            <View>
                <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.gray, fontSize: 12, textTransform: 'uppercase' }}> {parseDate(agreement?.performance?.Event?.date)} </Text>
                <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.black, fontSize: 20, marginTop: -7, marginLeft: -2 }}> {agreement?.performance?.Event?.name} </Text>
                <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.yellow, fontSize: 14, textTransform: 'uppercase', marginTop: -5 }}> {agreement?.performance?.Event?.location} </Text>
            </View>
            <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.black, fontSize: 18, textAlign: 'right', marginTop: -5 }}> {agreement?.payment}€ </Text>
        </View>
    )

}

export default AgreementCard

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
    },
    bandImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlobalStyle.gray,
    }
})