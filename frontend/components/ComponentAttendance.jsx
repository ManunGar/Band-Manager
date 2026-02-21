import { StyleSheet, Text, View } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';
import { parseDate } from '../helpers/ParseHelpers';

const ComponentAttendance = ({ eventAttendance }) => {
    return (
        <View style={styles.container}>
            <View style={styles.attendanceContainer}>
                <Text style={styles.date}>
                    {parseDate(eventAttendance.date)}
                </Text>
                <Text style={[styles.attendanceText, { color: eventAttendance.EventAttendances.present === true ? GlobalStyle.darkGreen : eventAttendance.EventAttendances.present === false ? GlobalStyle.darkRed : GlobalStyle.gray }]}>
                    {eventAttendance.EventAttendances.present === true && 'Ha asistido'}
                    {eventAttendance.EventAttendances.present === false && 'No ha asistido'}
                    {eventAttendance.EventAttendances.present === null && 'Sin registro de asistencia'}
                </Text>
            </View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
                {eventAttendance.Performance ? eventAttendance.Performance.name : 'Ensayo'}
            </Text>
            <Text style={styles.placeText} numberOfLines={1} ellipsizeMode='tail'>
                {eventAttendance.Performance && eventAttendance.Performance.place }
            </Text>
        </View>
    )

}

export default ComponentAttendance
const styles = StyleSheet.create({
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 22
    },
    date: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase'
    },
    attendanceText: {
        fontFamily: 'Oswald_500',
        fontSize: 16
    },
    attendanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    placeText: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.gray,
        marginTop: -4
    },
    container: {
        backgroundColor: GlobalStyle.white,
        padding: 14,
        borderRadius: 10,
    }
})