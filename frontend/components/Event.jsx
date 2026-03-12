import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import bandProfilePictureDefault from '../assets/milestones/band_default.png';
import performanceDefaultImage from '../assets/milestones/performance_default.jpg';
import rehearsalDefaultImage from '../assets/milestones/rehearsal_default.jpg';
import * as GlobalStyle from '../GlobalStyle';
import { parseDateTime } from '../helpers/ParseHelpers';

const Event = ({ event }) => {
    const navigation = useNavigation();


    return (
        <TouchableOpacity onPress={() => navigation.navigate('Event', { eventId: event.id })}>
            <Image source={event.Performance?.picture ? { uri: `${event.Performance.picture}` } : event.Performance ? performanceDefaultImage : rehearsalDefaultImage} style={{ width: 385, height: 180, borderRadius: 10 }} />
            <Image source={event.band.profile_picture ? { uri: `${event.band.profile_picture}` } : bandProfilePictureDefault} style={styles.bandPicture } />
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', width: 385 }}>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{event.name}</Text>
                    {event.attendance.participates && <Text style={{ fontFamily: 'Oswald_400', fontSize: 16, marginLeft: 10, flexShrink: 0, color: event.attendance.present === true ? GlobalStyle.darkGreen : event.attendance.present === false ? GlobalStyle.darkRed : GlobalStyle.gray }}>
                        { event.attendance.present && 'Asistencia Confirmada' }
                        { event.attendance.present === false && 'Asistencia Rechazada' }
                        { event.attendance.present === null && 'Sin Confirmar' }
                    </Text>}
                </View>
                <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{parseDateTime(event.date, event.initialTime)} {event.location ? `· ${event.location}` : ''}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default Event
const styles = StyleSheet.create({
    bandPicture: {
        width: 50,
        height: 50,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: GlobalStyle.white,
    },  
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        color: GlobalStyle.black,
        textTransform: 'uppercase',
        flexShrink: 1,
    },
    subtitle: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
        width: 280,
        textTransform: 'uppercase',
        marginTop: -7
    }
})