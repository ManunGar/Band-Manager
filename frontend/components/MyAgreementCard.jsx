import { Image, StyleSheet, Text, View } from 'react-native';
import bandProfileDefault from '../assets/milestones/band_default.png';
import * as GlobalStyle from '../GlobalStyle';
import { parseDate } from '../helpers/ParseHelpers';

const STATUS_LABELS = {
    open: 'Abierto',
    closed: 'Cerrado',
};

const MyAgreementCard = ({ agreement }) => {
    const isOpen = agreement?.status === 'open';
    const applicationsCount = agreement?.applications?.length || 0;
    const statusText = STATUS_LABELS[agreement?.status] || agreement?.status || '-';
    const instrumentImageUri = agreement?.instrument?.image
        ? `${process.env.EXPO_PUBLIC_API_URL}${agreement.instrument.image}`
        : null;

    return (
        <View style={styles.cardContainer}>
            {isOpen && (
                <View style={styles.applicationsBadge}>
                    <Text style={styles.applicationsValue}>{applicationsCount}</Text>
                    <Text style={styles.applicationsLabel}>Solicitudes</Text>
                </View>
            )}

            <Image
                style={styles.bandImage}
                source={agreement?.performance?.Event?.band?.profile_picture
                    ? { uri: agreement?.performance?.Event?.band?.profile_picture }
                    : bandProfileDefault}
            />

            <Text style={styles.eventName}>{agreement?.performance?.Event?.name || '-'}</Text>

            <View style={styles.metaRow}>
                <Text style={styles.instrumentCount}>Instrumentos solicitados: {agreement?.amount ?? 0}</Text>
                <View style={styles.instrumentRow}>
                    {instrumentImageUri ? (
                        <Image source={{ uri: instrumentImageUri }} style={styles.instrumentImage} />
                    ) : (
                        <View style={styles.instrumentImageFallback} />
                    )}
                    <Text style={styles.instrumentName}>{agreement?.instrument?.name || '-'}</Text>
                </View>
                <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                    <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>{statusText}</Text>
                </View>
            </View>

            <Text style={styles.eventDate}>{parseDate(agreement?.performance?.Event?.date)}</Text>
            <Text style={styles.eventLocation}>{agreement?.performance?.Event?.location || '-'}</Text>
        </View>
    );
};

export default MyAgreementCard;

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 15,
        position: 'relative',
        overflow: 'hidden',
    },
    bandImage: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: GlobalStyle.lightGray,
    },
    applicationsBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#FFF5E6',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
    },
    applicationsValue: {
        color: GlobalStyle.yellow,
        fontFamily: 'Oswald_500',
        fontSize: 14,
        lineHeight: 16,
    },
    applicationsLabel: {
        color: GlobalStyle.gray,
        fontFamily: 'Oswald_400',
        fontSize: 10,
        lineHeight: 12,
        textTransform: 'uppercase',
    },
    eventName: {
        paddingRight: 54,
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.black,
        letterSpacing: 0.4,
    },
    metaRow: {
        marginTop: -4,
        gap: 6,
        alignItems: 'flex-start',
    },
    instrumentCount: {
        flex: 1,
        fontFamily: 'Oswald_500',
        fontSize: 13,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    instrumentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    instrumentImage: {
        width: 16,
        height: 16,
    },
    instrumentImageFallback: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: GlobalStyle.lightGray,
    },
    instrumentName: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    statusOpen: {
        backgroundColor: '#E8F6EA',
    },
    statusClosed: {
        backgroundColor: '#F4E8E8',
    },
    statusText: {
        fontFamily: 'Oswald_500',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    statusTextOpen: {
        color: GlobalStyle.green,
    },
    statusTextClosed: {
        color: GlobalStyle.red,
    },
    eventDate: {
        marginTop: 8,
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    eventLocation: {
        marginTop: -1,
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase',
    },
});
