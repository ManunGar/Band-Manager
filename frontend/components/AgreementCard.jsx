import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import bandProfileDefault from '../assets/milestones/band_default.png'
import { AuthContext } from '../contexts/AuthContext'
import * as GlobalStyle from '../GlobalStyle'
import { parseDate } from '../helpers/ParseHelpers'

const APPLICATION_TAG = {
    pending:  { label: 'Solicitado', bg: '#FFF5E6', border: GlobalStyle.yellow,   color: GlobalStyle.yellow },
    accepted: { label: 'Aceptado',   bg: '#E8F6EA', border: GlobalStyle.darkGreen, color: GlobalStyle.green  },
    rejected: { label: 'Rechazado',  bg: '#F4E8E8', border: GlobalStyle.darkRed,  color: GlobalStyle.red    },
};

const AgreementCard = ({ agreement }) => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);

    const myApplication = agreement?.applications?.find(app => app.musicianId === user?.musician?.id);
    const tag = myApplication ? APPLICATION_TAG[myApplication.status] : null;

    return (
        <Pressable onPress={() => navigation.navigate('AgreementDetail', { agreementId: agreement.id })} style={styles.cardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <Image style={styles.bandImage} source={agreement?.performance?.Event?.band?.profile_picture ? { uri: agreement?.performance?.Event?.band?.profile_picture } : bandProfileDefault} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.darkGray, fontSize: 14 }}>{agreement.amount} {agreement?.instrument?.name}</Text>
                    <Text style={{ color: GlobalStyle.black, fontFamily: 'Oswald_400', fontSize: 16, marginTop: -3 }}>{agreement?.performance?.Event?.band?.name}</Text>
                </View>
                {tag && (
                    <View style={[styles.tag, { backgroundColor: tag.bg, borderColor: tag.border }]}>
                        <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                    </View>
                )}
            </View>
            <View>
                <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.gray, fontSize: 12, textTransform: 'uppercase' }}>{parseDate(agreement?.performance?.Event?.date)}</Text>
                <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.black, fontSize: 20, marginTop: -5 }}>{agreement?.performance?.Event?.name}</Text>
                <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.yellow, fontSize: 14, textTransform: 'uppercase', marginTop: -5 }}>{agreement?.performance?.Event?.location}</Text>
            </View>
            <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.black, fontSize: 18, textAlign: 'right', marginTop: -5 }}>{agreement?.payment}€</Text>
        </Pressable>
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
    },
    tag: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    tagText: {
        fontFamily: 'Oswald_500',
        fontSize: 11,
        textTransform: 'uppercase',
    },
})