import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import performanceDefaultImage from '../assets/milestones/performance_default.jpg';
import rehearsalDefaultImage from '../assets/milestones/rehearsal_default.jpg';
import * as GlobalStyle from '../GlobalStyle';
import { parseDateTime } from '../helpers/ParseHelpers';

const UpcomingEvent = ({ event }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Event', { eventId: event.id })}>
            <Image source={event.Performance?.picture ? { uri: `${event.Performance.picture}` } : event.Performance ? performanceDefaultImage : rehearsalDefaultImage} style={{ width: 280, height: 140, borderRadius: 10 }} />
            <View>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{event?.name || 'Evento'}</Text>
                <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{parseDateTime(event.date, event.initialTime)} {event.Performance?.place ? `· ${event.Performance.place}` : ''}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default UpcomingEvent
const styles = StyleSheet.create({
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 22,
        color: GlobalStyle.black,
        width: 280,
        textTransform: 'uppercase',
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