import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MusicianEndpoints from '../../../api/MusicianEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import profileDefault from '../../../assets/milestones/profile_default.png';
import LocationIcon from '../../../components/icons/LocationIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import StarIcon from '../../../components/icons/StarIcon';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const CONTRACT_PAGE_SIZE = 8;

const normalizeProfileResponse = (data) => {
    if (!data) return null;

    if (data.user) {
        return {
            id: data.id,
            full_name: data.user.full_name,
            location: data.user.location,
            phone: data.user.phone,
            profile_picture: data.user.profile_picture,
            averageRate: data.averageRate,
            instruments: data.instruments || [],
            components: data.components || [],
        };
    }

    if (data.musician) {
        return {
            id: data.musician.id,
            full_name: data.full_name,
            location: data.location,
            phone: data.phone,
            profile_picture: data.profile_picture,
            averageRate: data.averageRate,
            instruments: data.musician.instruments || [],
            components: data.musician.components || [],
        };
    }

    return data;
};

const formatRate = (rate) => {
    if (rate === null || rate === undefined || Number.isNaN(Number(rate))) {
        return '_._';
    }
    return Number(rate).toFixed(1);
};

const MusicianProfileScreen = ({ route, navigation }) => {
    const { musicianId } = route.params;
    const [musician, setMusician] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [contractsOffset, setContractsOffset] = useState(0);
    const [hasMoreContracts, setHasMoreContracts] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMoreContracts, setLoadingMoreContracts] = useState(false);

    useEffect(() => {
        const fetchScreenData = async () => {
            try {
                setLoading(true);
                const [profileResponse, contractsResponse] = await Promise.all([
                    MusicianEndpoints.getMusicianProfile(musicianId),
                    MusicianEndpoints.listMusicianContracts(musicianId, null, 0, CONTRACT_PAGE_SIZE),
                ]);

                setMusician(normalizeProfileResponse(profileResponse));
                setContracts(contractsResponse?.data || []);
                setContractsOffset(0);
                setHasMoreContracts(Boolean(contractsResponse?.hasMore));
            } catch (error) {
                console.error('Error fetching musician profile screen:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchScreenData();
    }, [musicianId]);

    const loadMoreContracts = async () => {
        if (!hasMoreContracts || loadingMoreContracts) return;

        const nextOffset = contractsOffset + CONTRACT_PAGE_SIZE;

        try {
            setLoadingMoreContracts(true);
            const response = await MusicianEndpoints.listMusicianContracts(
                musicianId,
                null,
                nextOffset,
                CONTRACT_PAGE_SIZE
            );
            setContracts((prev) => [...prev, ...(response?.data || [])]);
            setContractsOffset(nextOffset);
            setHasMoreContracts(Boolean(response?.hasMore));
        } catch (error) {
            console.error('Error loading more musician contracts:', error);
        } finally {
            setLoadingMoreContracts(false);
        }
    };

    const bands = useMemo(() => {
        const profileBands = musician?.components || [];
        const dedup = new Map();

        profileBands.forEach((component) => {
            const band = component?.band;
            if (!band?.id || dedup.has(band.id)) return;
            dedup.set(band.id, {
                ...band,
                administrator: Boolean(component?.administrator),
            });
        });

        return Array.from(dedup.values());
    }, [musician]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={GlobalStyle.yellow} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <ScrollView style={styles.container}>
                <TopContainer title='Perfil de Músico' editEnabled={false} configEnabled={false}>
                <View style={styles.headerContent}>
                    <Image
                        source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                        style={styles.profilePicture}
                    />

                    <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
                            {musician?.full_name || 'Músico'}
                        </Text>

                        <View style={styles.rateBadge}>
                            <StarIcon width={14} height={14} fill={GlobalStyle.yellow} stroke={GlobalStyle.yellow} strokeWidth={0.2} />
                            <Text style={styles.rateText}>{formatRate(musician?.averageRate)} / 5</Text>
                        </View>

                        <View style={styles.contactList}>
                            <View style={styles.contactRow}>
                                <LocationIcon width={15} height={15} fill={GlobalStyle.gray} />
                                <Text style={styles.contactText} numberOfLines={1} ellipsizeMode='tail'>
                                    {musician?.location || 'Ubicación desconocida'}
                                </Text>
                            </View>
                            <View style={styles.contactRow}>
                                <PhoneIcon width={15} height={15} fill={GlobalStyle.gray} />
                                <Text style={styles.contactText} numberOfLines={1} ellipsizeMode='tail'>
                                    {musician?.phone || 'Teléfono desconocido'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TopContainer>

                <View style={styles.body}>
                    <View>
                        <Text style={styles.sectionTitle}>Bandas</Text>
                        {bands.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Este músico no pertenece a ninguna banda.</Text>
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.bandsList}
                                style={{ marginTop: 10 }}
                            >
                                {bands.map((band) => (
                                    <View key={band.id} style={styles.bandCard}>
                                        <Image
                                            source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage}
                                            style={styles.bandImage}
                                        />
                                        <Text style={styles.bandName} numberOfLines={1} ellipsizeMode='tail'>
                                            {band.name}
                                        </Text>
                                        <Text style={styles.bandRole}>{band.administrator ? 'Administrador' : 'Miembro'}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View>
                        <Text style={styles.sectionTitle}>Instrumentos</Text>
                        {musician?.instruments?.length ? (
                            <View style={styles.instrumentsList}>
                                {musician.instruments.map((instrument, index) => (
                                    <View key={`${instrument.id}-${index}`} style={styles.instrumentCard}>
                                        <View style={styles.instrumentImageWrapper}>
                                        <Image
                                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }}
                                            style={styles.instrumentImage}
                                        />
                                        </View>
                                        <View style={styles.instrumentInfo}>
                                            <Text style={styles.instrumentTitle} numberOfLines={1} ellipsizeMode='tail'>
                                                {instrument.name}
                                            </Text>
                                            <Text style={styles.instrumentLevelText}>
                                                {instrument?.MusicianLevel?.level || 'No definido'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Este músico no tiene instrumentos asignados.</Text>
                            </View>
                        )}
                    </View>

                    <View>
                        <Text style={styles.sectionTitle}>Contratos Realizados</Text>

                        {contracts.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay contratos registrados para este músico.</Text>
                            </View>
                        ) : (
                            <View style={styles.contractsList}>
                                {contracts.map((application) => {
                                    const agreement = application?.agreement;
                                    const event = agreement?.performance?.Event;
                                    const band = event?.band;
                                    const instrument = agreement?.instrument;

                                    return (
                                        <View key={application.id} style={styles.contractCard}>
                                            <View style={styles.contractHeader}>
                                                <Image
                                                    source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage}
                                                    style={styles.contractBandImage}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.contractEventName} numberOfLines={1} ellipsizeMode='tail'>
                                                        {event?.name || 'Evento'}
                                                    </Text>
                                                    <Text style={styles.contractDate}>
                                                        {event?.date ? parseDate(event.date) : 'Fecha no disponible'}
                                                    </Text>
                                                </View>
                                                <View style={styles.contractRateBadge}>
                                                    <StarIcon width={12} height={12} fill={GlobalStyle.yellow} stroke={GlobalStyle.yellow} strokeWidth={0.2} />
                                                    <Text style={styles.contractRateText}>{formatRate(application?.rate)}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.contractInstrumentRow}>
                                                {instrument?.image ? (
                                                    <Image
                                                        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument.image}` }}
                                                        style={styles.contractInstrumentImage}
                                                    />
                                                ) : (
                                                    <View style={styles.contractInstrumentFallback} />
                                                )}
                                                <Text style={styles.contractInstrumentText}>
                                                    {instrument?.name || 'Instrumento no disponible'}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {hasMoreContracts && (
                            <LinkText
                                onPress={loadMoreContracts}
                                style={{ textAlign: 'center', marginTop: 10 }}
                            >
                                {loadingMoreContracts ? 'Cargando...' : 'Cargar Más'}
                            </LinkText>
                        )}
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <Pressable
                style={styles.floatingButton}
                onPress={() => navigation.navigate('HireMusician', {
                    musicianId,
                    musicianName: musician?.full_name,
                    musicianInstruments: musician?.instruments ?? [],
                })}
                disabled={!musician}
            >
                <Text style={styles.floatingButtonText}>Contratar</Text>
            </Pressable>
        </View>
    );
};

export default MusicianProfileScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.gray,
    },
    headerContent: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
    },
    profilePicture: {
        width: 110,
        height: 110,
        borderRadius: 12,
        backgroundColor: GlobalStyle.lightGray,
    },
    name: {
        fontFamily: 'Oswald_500',
        fontSize: 23,
        color: GlobalStyle.black,
    },
    rateBadge: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        backgroundColor: '#FFF5E6',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    rateText: {
        fontFamily: 'Oswald_500',
        fontSize: 13,
        color: GlobalStyle.yellow,
    },
    contactList: {
        marginTop: 8,
        gap: 5,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        maxWidth: '95%',
    },
    contactText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.gray,
        flexShrink: 1,
    },
    body: {
        paddingHorizontal: 25,
        paddingBottom: 35,
        gap: 20,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    emptyBox: {
        marginTop: 10,
        borderRadius: 12,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    emptyText: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.gray,
        textAlign: 'center',
    },
    bandsList: {
        gap: 10,
        paddingRight: 10,
    },
    bandCard: {
        marginTop: 10,
        width: 108,
        borderRadius: 12,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 8,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 4,
    },
    bandImage: {
        width: 60,
        height: 60,
        borderRadius: 999,
        backgroundColor: GlobalStyle.lightGray,
    },
    bandName: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.black,
        textAlign: 'center',
        width: '100%',
    },
    bandRole: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
    },
    instrumentsList: {
        marginTop: 10,
        gap: 8,
    },
    instrumentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    instrumentImageWrapper: {
        width: 52,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instrumentImage: {
        width: 34,
        height: 34,
    },
    instrumentInfo: {
        flex: 1,
    },
    instrumentTitle: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        lineHeight: 28,
        color: GlobalStyle.black,
        textTransform: 'uppercase',
    },
    instrumentLevelText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        marginTop: -4,
        color: GlobalStyle.darkGray,
        textTransform: 'capitalize',
    },
    contractsList: {
        marginTop: 10,
        gap: 10,
    },
    contractCard: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        padding: 12,
        gap: 10,
    },
    contractHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    contractBandImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: GlobalStyle.lightGray,
    },
    contractEventName: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    },
    contractDate: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    contractRateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF5E6',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    contractRateText: {
        fontFamily: 'Oswald_500',
        fontSize: 12,
        color: GlobalStyle.yellow,
    },
    contractInstrumentRow: {
        borderTopWidth: 1,
        borderTopColor: GlobalStyle.lightGray,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contractInstrumentImage: {
        width: 15,
        height: 15,
    },
    contractInstrumentFallback: {
        width: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: GlobalStyle.lightGray,
    },
    contractInstrumentText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    bottomSpacer: {
        height: 92,
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        backgroundColor: GlobalStyle.yellow,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 12,
        shadowColor: GlobalStyle.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    floatingButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
});
