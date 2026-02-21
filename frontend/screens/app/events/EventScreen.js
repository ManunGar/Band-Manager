import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import EventEndpoints from '../../../api/EventEndpoints';
import performancePictureDefault from '../../../assets/milestones/performance_default.jpg';
import rehearsalPictureDefault from '../../../assets/milestones/rehearsal_default.jpg';
import AgendaIcon from '../../../components/icons/AgendaIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import MusicIcon from '../../../components/icons/MusicIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const EventScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null)

    useEffect(() => {
        fetchEventDetails();
    }, [eventId])

    const fetchEventDetails = async () => {
        const fetchedEvent = await EventEndpoints.getEventDetails(eventId);
        setEvent(fetchedEvent);
    }

    return (
        <View>
            <TopContainer style={{ paddingBottom: 0, marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
            <View style={styles.headerContainer}>
                <Image source={event?.Performance ? event.Performance.picture ? { uri: event.Performance.picture } : performancePictureDefault : rehearsalPictureDefault}
                    style={styles.image} />
                <View style={{ paddingHorizontal: 8, paddingBottom: 15, width: '100%' }}>
                    <Text style={styles.bandName}>{event?.band?.name}</Text>
                    <Text style={styles.title}>{event?.Performance ? event.Performance.name : "Ensayo"}</Text>
                </View>
                <View style={{ paddingHorizontal: 8, gap: 10, paddingBottom: 30, paddingTop: 20, width: '100%', borderTopWidth: 1, borderTopColor: GlobalStyle.lightGray }}>
                    {event?.Performance &&
                        <View style={styles.textContainer}>
                            <MusicIcon width={20} height={20} fill={GlobalStyle.black} />
                            <Text style={styles.text}>{event.Performance.type}</Text>
                        </View>}
                    {event &&
                        <View style={styles.textContainer}>
                            <AgendaIcon width={20} height={20} fill={GlobalStyle.black} strokeWidth={30} />
                            <Text style={styles.text}>{parseDate(event?.date)}</Text>
                        </View>}
                    {event &&
                        <View style={styles.textContainer}>
                            <TimeIcon width={20} height={20} fill={GlobalStyle.black} />
                            <Text style={styles.text}>{event?.initialTime} - {event?.endTime}</Text>
                        </View>
                    }
                    {event?.Performance && 
                        <View style={styles.textContainer}>
                            <LocationIcon width={20} height={22} fill={GlobalStyle.black} />
                            <Text style={styles.text}>{event.Performance.place}</Text>
                        </View>
                    }
                </View>

            </View>
        </View>
    )
}

export default EventScreen
const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 12,
        backgroundColor: GlobalStyle.white,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        maxWidth: 380
    },
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 30
    },
    bandName: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.gray,
        marginBlock: 4
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        alignItems: 'center',
    },
    text: {
        fontFamily: 'Oswald_400',
        fontSize: 17,
        color: GlobalStyle.black
    }
})