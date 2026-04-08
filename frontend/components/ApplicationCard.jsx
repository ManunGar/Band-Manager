import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import bandProfileDefault from '../assets/milestones/band_default.png';
import * as GlobalStyle from '../GlobalStyle';
import { parseDate } from '../helpers/ParseHelpers';

const STATUS_CONFIG = {
    pending:  { label: 'Pendiente', bg: '#FFF5E6', color: GlobalStyle.yellow   },
    accepted: { label: 'Aceptado',  bg: '#E8F6EA', color: GlobalStyle.green    },
    rejected: { label: 'Rechazado', bg: '#F4E8E8', color: GlobalStyle.red      },
};

const ApplicationCard = ({ application }) => {
    const navigation = useNavigation();
    const agreement = application?.agreement;
    const event = agreement?.performance?.Event;
    const band = event?.band;
    const instrument = agreement?.instrument;
    const isBandInvite = application?.type === 'band_invite';
    const statusConfig = STATUS_CONFIG[application?.status] ?? STATUS_CONFIG.pending;

    const instrumentImageUri = instrument?.image
        ? `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}`
        : null;

    return (
        <Pressable
            onPress={() => navigation.navigate('AgreementDetail', { agreementId: agreement?.id })}
            style={styles.card}
        >
            {/* TOP ROW: band image + event name + status badge */}
            <View style={styles.topRow}>
                <Image
                    source={band?.profile_picture ? { uri: band.profile_picture } : bandProfileDefault}
                    style={styles.bandImage}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.eventName} numberOfLines={1}>{event?.name}</Text>

                    {/* Instrument row */}
                    {isBandInvite ? (
                        <Text style={styles.inviteText}>
                            {instrument?.name ? `${instrument.name} solicitado/a` : 'Invitación de banda'}
                        </Text>
                    ) : (
                        <View style={styles.instrumentRow}>
                            {instrumentImageUri ? (
                                <Image source={{ uri: instrumentImageUri }} style={styles.instrumentImage} />
                            ) : (
                                <View style={styles.instrumentImageFallback} />
                            )}
                            <Text style={styles.instrumentName}>{instrument?.name ?? '-'}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
            </View>

            {/* BOTTOM: date + location */}
            <View style={styles.bottomRow}>
                {event?.date && (
                    <Text style={styles.date}>{parseDate(event.date)}</Text>
                )}
                {event?.location && (
                    <Text style={styles.location} numberOfLines={1}>{event.location}</Text>
                )}
            </View>
        </Pressable>
    );
};

export default ApplicationCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        padding: 14,
        gap: 10,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bandImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: GlobalStyle.lightGray,
    },
    eventName: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    },
    instrumentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    instrumentImage: {
        width: 14,
        height: 14,
    },
    instrumentImageFallback: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: GlobalStyle.lightGray,
    },
    instrumentName: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    inviteText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontFamily: 'Oswald_500',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    bottomRow: {
        borderTopWidth: 1,
        borderTopColor: GlobalStyle.lightGray,
        paddingTop: 8,
        gap: 2,
    },
    date: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    location: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase',
    },
});
