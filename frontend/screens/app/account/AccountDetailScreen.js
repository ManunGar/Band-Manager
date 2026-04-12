import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import MusicianEndpoints from '../../../api/MusicianEndpoints'
import bandDefaultImage from '../../../assets/milestones/band_default.png'
import profileDefault from '../../../assets/milestones/profile_default.png'
import LocationIcon from '../../../components/icons/LocationIcon'
import PhoneIcon from '../../../components/icons/PhoneIcon'
import StarIcon from '../../../components/icons/StarIcon'
import ImagePickerSheet from '../../../components/ImagePickerSheet'
import LinkText from '../../../components/LinkText'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'
import { assertSizeLT3MB } from '../../../helpers/ImageHelpers'
import { parseDate } from '../../../helpers/ParseHelpers'

const { width: SCREENW } = Dimensions.get('window')

const CONTRACT_PAGE_SIZE = 8

const formatRate = (rate) => {
    if (rate === null || rate === undefined || Number.isNaN(Number(rate))) {
        return '_._'
    }
    return Number(rate).toFixed(1)
}

const normalizeProfileResponse = (data) => {
    if (!data) return null
    if (data.musician) return data

    const userData = data.user || {}
    return {
        ...userData,
        averageRate: data.averageRate,
        isOwner: data.isOwner,
        musician: {
            id: data.id,
            instruments: data.instruments || [],
            components: data.components || [],
            isProfilePrivate: data.isProfilePrivate
        }
    }
}

const AccountDetailScreen = () => {
    const [musician, setMusician] = useState(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [contracts, setContracts] = useState([])
    const [contractsOffset, setContractsOffset] = useState(0)
    const [hasMoreContracts, setHasMoreContracts] = useState(false)
    const [loadingMoreContracts, setLoadingMoreContracts] = useState(false)
    const { user, logout, editMusician } = useContext(AuthContext)
    const sheetRef = useRef(null)
    const navigation = useNavigation()
    const musicianId = user?.musician?.id

    const bands = useMemo(() => musician?.musician?.components || [], [musician])
    const instruments = useMemo(() => musician?.musician?.instruments || [], [musician])
    const averageRate = useMemo(() => {
        if (typeof musician?.averageRate !== 'number') return '__.__'
        return musician.averageRate.toFixed(2)
    }, [musician])

    const fetchAccountDetails = useCallback(async () => {
        if (!musicianId) {
            setIsLoadingProfile(false)
            return
        }
        try {
            const [data, contractsResponse] = await Promise.all([
                MusicianEndpoints.accountDetails(musicianId),
                MusicianEndpoints.listMusicianContracts(musicianId, null, 0, CONTRACT_PAGE_SIZE),
            ])
            setMusician(normalizeProfileResponse(data))
            setContracts(contractsResponse?.data || [])
            setContractsOffset(0)
            setHasMoreContracts(Boolean(contractsResponse?.hasMore))
        } catch (error) {
            console.error(error)
            logout()
        } finally {
            setIsLoadingProfile(false)
        }
    }, [logout, musicianId])

    const loadMoreContracts = useCallback(async () => {
        if (!hasMoreContracts || loadingMoreContracts) return
        const nextOffset = contractsOffset + CONTRACT_PAGE_SIZE
        try {
            setLoadingMoreContracts(true)
            const response = await MusicianEndpoints.listMusicianContracts(musicianId, null, nextOffset, CONTRACT_PAGE_SIZE)
            setContracts((prev) => [...prev, ...(response?.data || [])])
            setContractsOffset(nextOffset)
            setHasMoreContracts(Boolean(response?.hasMore))
        } catch (error) {
            console.error('Error loading more contracts:', error)
        } finally {
            setLoadingMoreContracts(false)
        }
    }, [hasMoreContracts, loadingMoreContracts, contractsOffset, musicianId])

    // Close the bottom sheet when the screen is unfocused
    useFocusEffect(
        useCallback(() => {
            // Refresh account details when returning to the screen
            setIsLoadingProfile(true)
            fetchAccountDetails();
            return () => {
                sheetRef.current?.dismiss();
            };
        }, [fetchAccountDetails])
    );

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const handleImageSelected = async (uri) => {
        try {
            await assertSizeLT3MB(uri);
            const form = new FormData();
            form.append('profile_picture', {
                uri: uri,
                name: `avatar_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            await editMusician(form);
            await fetchAccountDetails();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const handleImageRemoved = async () => {
        try {
            const form = new FormData();
            form.append('delete_profile_picture', true);
            await editMusician(form);
            await fetchAccountDetails();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    const goToInstruments = () => {
        navigation.navigate('Instruments', {
            userInstruments: instruments
        })
    }

    if (isLoadingProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={GlobalStyle.yellow} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            {/* Profile picture section */}
            <TopContainer
                configEnabled
                onConfiguration={() => navigation.navigate('Configuration', { musician })}
                onEdit={() => navigation.navigate('AccountEdit')}>
                <View style={styles.profileHeaderContent}>
                    <Image
                        source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                        style={styles.profilePicture}
                    />
                    <View style={styles.profileMainInfo}>
                        <View>
                            <Text style={styles.profileName} numberOfLines={1} ellipsizeMode='tail'>{musician?.full_name}</Text>
                        </View>

                        <View style={styles.ratingBadge}>
                            <StarIcon width={16} height={16} />
                            <Text style={styles.ratingText}>{averageRate}</Text>
                        </View>

                        <LinkText onPress={openSheet}>Cambiar Imagen</LinkText>
                    </View>
                </View>

                <View style={styles.contactRow}>
                    <View style={styles.contactBadge}>
                        <LocationIcon />
                        <Text style={styles.contactText} numberOfLines={1} ellipsizeMode='tail'>
                            {musician?.location || 'Desconocida'}
                        </Text>
                    </View>
                    <View style={styles.contactBadge}>
                        <PhoneIcon />
                        <Text style={styles.contactText} numberOfLines={1} ellipsizeMode='tail'>
                            {musician?.phone || 'Desconocido'}
                        </Text>
                    </View>
                </View>
            </TopContainer>
            {/* Bands and Instruments section */}
            <View style={styles.bottomContainer}>
                <View>
                    <Text style={styles.sectionTitle}>Resumen:</Text>
                    <View style={styles.resumeRow}>
                        <View style={styles.resumeCard}>
                            <Text style={styles.resumeValue}>{bands.length}</Text>
                            <Text style={styles.resumeLabel}>Bandas</Text>
                        </View>
                        <View style={styles.resumeCard}>
                            <Text style={styles.resumeValue}>{instruments.length}</Text>
                            <Text style={styles.resumeLabel}>Instrumentos</Text>
                        </View>
                        <View style={styles.resumeCard}>
                            <Text style={styles.resumeValue}>{averageRate}</Text>
                            <Text style={styles.resumeLabel}>Valoración</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 16 }}>
                    <Text style={styles.subTitle}>Bandas:</Text>
                    {!bands.length && (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No formas parte de ninguna banda. Sé el primero en crearla o unirte a una.</Text>
                        </View>
                    )}
                    {!!bands.length && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.bandsList}
                            style={{ marginTop: 10 }}
                        >
                            {bands.map((item) => (
                                <View key={item.id} style={styles.bandCard}>
                                    <Image
                                        source={item?.band?.profile_picture ? { uri: item.band.profile_picture } : bandDefaultImage}
                                        style={styles.bandPicture}
                                    />
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.bandName}>{item?.band?.name || 'Banda'}</Text>
                                    <Text style={styles.bandRole}>{item?.administrator ? 'Administrador' : 'Miembro'}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
                <View>
                    <View style={styles.instrumentHeader}>
                        <Text style={styles.subTitle}>Instrumentos:</Text>
                        <LinkText onPress={goToInstruments}>Editar Instrumento</LinkText>
                    </View>
                    {!instruments.length && (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No tienes ningún instrumento asignado.</Text>
                        </View>
                    )}
                    {!!instruments.length && (
                        <View style={styles.instrumentsList}>
                            {instruments.map((item, index) => (
                                <View
                                    key={`${item.id}-${index}`}
                                    style={styles.instrumentCard}
                                >
                                    <View style={styles.instrumentImageWrapper}>
                                        <Image
                                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${item.image}` }}
                                            style={styles.instrumentImage}
                                        />
                                    </View>
                                    <View style={styles.instrumentInfo}>
                                        <Text style={styles.instrumentName} numberOfLines={1} ellipsizeMode='tail'>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.instrumentBadgeText}>
                                            {item?.MusicianLevel?.level || 'No definido'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View>
                    <Text style={styles.subTitle}>Contratos Realizados:</Text>
                    {contracts.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No tienes contratos realizados aún.</Text>
                        </View>
                    ) : (
                        <View style={styles.contractsList}>
                            {contracts.map((application) => {
                                const agreement = application?.agreement
                                const event = agreement?.performance?.Event
                                const band = event?.band
                                const instrument = agreement?.instrument

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
                                )
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
            {/* Image Picker component */}
            <ImagePickerSheet
                sheetRef={sheetRef}
                imagePreview={musician?.profile_picture}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
            />
        </ScrollView>
    )
}

export default AccountDetailScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.gray,
    },
    profileHeaderContent: {
        width: SCREENW - 60,
        flexDirection: 'row',
        gap: 14,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 10,
        backgroundColor: GlobalStyle.lightBackground,
    },
    profileMainInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileName: {
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.black,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 5,
        marginTop: -20,
    },
    ratingText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
        color: GlobalStyle.gray,
    },
    contactRow: {
        width: SCREENW - 60,
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    contactBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: GlobalStyle.lightBackground,
    },
    contactText: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.darkGray,
        flex: 1,
    },
    infoText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.gray
    },
    bottomContainer: {
        paddingBottom: 30,
        paddingHorizontal: 30,
        gap: 14,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    resumeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    resumeCard: {
        flex: 1,
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    resumeValue: {
        fontFamily: 'BebasNeue',
        fontSize: 28,
        color: GlobalStyle.black,
        lineHeight: 30,
    },
    resumeLabel: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
    },
    subTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    bandsList: {
        gap: 10,
        paddingRight: 10,
    },
    bandCard: {
        width: 110,
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        gap: 4,
    },
    bandPicture: {
        width: 62,
        height: 62,
        borderRadius: 999,
        backgroundColor: GlobalStyle.lightBackground,
    },
    bandName: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.black,
        width: '100%',
        textAlign: 'center',
    },
    bandRole: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
    },
    instrumentHeader: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: 10,
    },
    instrumentsList: {
        gap: 10,
    },
    instrumentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: GlobalStyle.white,
        borderRadius: 14,
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
    instrumentName: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        lineHeight: 28,
        color: GlobalStyle.black,
        textTransform: 'uppercase',
    },
    instrumentBadge: {
        alignSelf: 'flex-start',
    },
    instrumentBadgeText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        marginTop: -4,
        color: GlobalStyle.darkGray,
        textTransform: 'capitalize',
    },
    instrumentOrder: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.gray,
    },
    emptyBox: {
        marginTop: 10,
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    emptyText: {
        textAlign: 'center',
        fontFamily: 'Oswald_300',
        fontSize: 16,
        color: GlobalStyle.gray,
    },
    header: {
        backgroundColor: GlobalStyle.white,
        shadowColor: GlobalStyle.black,
        shadowOffset: { width: -1, height: -3 },
        shadowRadius: 5,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    panelHeader: {
        alignItems: 'center',
    },
    panelHandle: {
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: GlobalStyle.darkGray,
        marginBottom: 10,
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
        backgroundColor: GlobalStyle.lightBackground,
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
        borderTopColor: GlobalStyle.lightBackground,
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
        backgroundColor: GlobalStyle.lightBackground,
    },
    contractInstrumentText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
})