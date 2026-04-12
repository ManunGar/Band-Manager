import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import profileDefault from '../assets/milestones/profile_default.png';
import * as GlobalStyle from '../GlobalStyle';
import LocationIcon from './icons/LocationIcon';
import StarIcon from './icons/StarIcon';

const formatRate = (rate) => {
    if (rate === null || rate === undefined || Number.isNaN(Number(rate))) {
        return '_._';
    }
    return `${Number(rate).toFixed(1)}`;
};

const MusicianCard = ({ musician, onPress }) => {
    const user = musician?.user || {};
    const instruments = musician?.instruments || [];

    return (
        <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.cardPressed]}>
            <View style={styles.headerRow}>
                <Image
                    source={user?.profile_picture ? { uri: user.profile_picture } : profileDefault}
                    style={styles.profileImage}
                />

                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
                        {user?.full_name || 'Músico'}
                    </Text>
                    <View style={styles.metaRow}>
                        <LocationIcon width={13} height={16} fill={GlobalStyle.gray} />
                        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode='tail'>
                            {user?.location || 'Ubicación no disponible'}
                        </Text>
                    </View>
                </View>

                <View style={styles.ratingBadge}>
                    <StarIcon width={13} height={13} fill={GlobalStyle.yellow} stroke={GlobalStyle.yellow} strokeWidth={0.2} />
                    <Text style={styles.ratingText}>{formatRate(musician?.averageRate)}</Text>
                </View>
            </View>

            <View style={styles.instrumentsSection}>
                {instruments.length === 0 ? (
                    <Text style={styles.emptyInstruments}>Sin instrumentos registrados</Text>
                ) : (
                    instruments.map((instrument) => (
                        <View key={instrument.id} style={styles.instrumentPill}>
                            <Image
                                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }}
                                style={styles.instrumentImage}
                            />
                            <Text style={styles.instrumentText} numberOfLines={1} ellipsizeMode='tail'>
                                {instrument.name}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </Pressable>
    );
};

export default MusicianCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        padding: 14,
        gap: 12,
    },
    cardPressed: {
        opacity: 0.92,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    profileImage: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: GlobalStyle.lightGray,
    },
    name: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -2,
        maxWidth: '95%',
    },
    metaText: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
        flexShrink: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    ratingText: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.yellow,
    },
    instrumentsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: GlobalStyle.lightGray,
        paddingTop: 10,
    },
    instrumentPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        backgroundColor: GlobalStyle.lightBackground,
        paddingHorizontal: 10,
        paddingVertical: 6,
        maxWidth: '100%',
    },
    instrumentImage: {
        width: 16,
        height: 16,
    },
    instrumentText: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    emptyInstruments: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
    },
});
