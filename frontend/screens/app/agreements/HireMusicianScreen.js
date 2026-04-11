import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AgreementEndpoints from '../../../api/AgreementEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import BottomSheet from '../../../components/BottomSheet';
import TopContainer from '../../../components/TopContainer';
import { useToast } from '../../../contexts/ToastContext';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const HireMusicianScreen = ({ route, navigation }) => {
    const { musicianId, musicianName, musicianInstruments } = route.params;
    const { showToast } = useToast();
    const [myAgreements, setMyAgreements] = useState([]);
    const [adminPerformances, setAdminPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invitingId, setInvitingId] = useState(null);
    const [pendingInviteAgreement, setPendingInviteAgreement] = useState(null);
    const inviteSheetRef = useRef(null);
    const inviteSheetSnapPoints = useMemo(() => ['38%'], []);

    const musicianInstrumentIds = (musicianInstruments || []).map((i) => i.id);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [agreements, performances] = await Promise.all([
                AgreementEndpoints.listMyAgreements(null, null, null, null),
                AgreementEndpoints.listAdminPerformances(),
            ]);

            const open = (agreements || []).filter(
                (a) => a.status === 'open' && musicianInstrumentIds.includes(a.instrumentId)
            );

            setMyAgreements(open);
            setAdminPerformances(performances || []);
        } catch (error) {
            console.error('Error fetching hire musician data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = (agreement) => {
        setPendingInviteAgreement(agreement);
        inviteSheetRef.current?.present();
    };

    const closeInviteSheet = () => {
        if (invitingId) return;
        inviteSheetRef.current?.dismiss();
        setPendingInviteAgreement(null);
    };

    const confirmInvite = async () => {
        if (!pendingInviteAgreement?.id) return;

        try {
            inviteSheetRef.current?.dismiss();
            setInvitingId(pendingInviteAgreement.id);
            await AgreementEndpoints.inviteMusician(pendingInviteAgreement.id, musicianId);
            showToast('¡Invitación enviada!', `${musicianName || 'El músico'} ha sido invitado al contrato.`, 'success');
            setPendingInviteAgreement(null);
            fetchData();
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al enviar la invitación.', 'error');
        } finally {
            setInvitingId(null);
        }
    };

    const handleCreateAgreement = (performance) => {
        navigation.navigate('CreateAgreement', {
            performanceId: performance.id,
            eventName: performance.Event?.name,
            eventDate: performance.Event?.date,
            bandName: performance.Event?.band?.name,
            musicianId,
            musicianName,
            musicianInstruments,
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GlobalStyle.yellow} />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
            <TopContainer
                title={`Contratar músico`}
                editEnabled={false}
                configEnabled={false}
            />

            <View style={styles.body}>
                {/* SECTION 1: Existing open agreements matching musician's instruments */}
                <View>
                    <Text style={styles.sectionTitle}>Mis Contratos Abiertos</Text>
                    <Text style={styles.sectionSubtitle}>
                        Contratos que requieren instrumentos de {musicianName || 'este músico'}.
                    </Text>

                    {myAgreements.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>
                                No tienes contratos abiertos que requieran los instrumentos de este músico.
                            </Text>
                        </View>
                    ) : (
                        myAgreements.map((agreement) => {
                            const event = agreement?.performance?.Event;
                            const band = event?.band;
                            const instrument = agreement?.instrument;
                            const isInviting = invitingId === agreement.id;
                            const alreadyInvited = (agreement.applications || []).some(
                                (app) => app.musicianId === musicianId
                            );

                            return (
                                <Pressable
                                    key={agreement.id}
                                    style={[styles.card, alreadyInvited && styles.cardDisabled]}
                                    onPress={() => !alreadyInvited && !isInviting && handleInvite(agreement)}
                                    disabled={alreadyInvited || Boolean(invitingId)}
                                >
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage}
                                            style={styles.bandImage}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardTitle} numberOfLines={1}>{event?.name}</Text>
                                            <Text style={styles.cardSub} numberOfLines={1}>{band?.name}</Text>
                                        </View>
                                        <View style={styles.paymentBadge}>
                                            <Text style={styles.paymentText}>{agreement.payment}€</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        {event?.date && <Text style={styles.cardDate}>{parseDate(event.date)}</Text>}
                                        <Text style={styles.cardInstrument}>
                                            {agreement.amount}× {instrument?.name}
                                        </Text>
                                    </View>

                                    {alreadyInvited ? (
                                        <View style={styles.alreadyInvitedBadge}>
                                            <Text style={styles.alreadyInvitedText}>Músico ya invitado</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.actionRow, isInviting && { opacity: 0.6 }]}>
                                            <Text style={styles.actionRowText}>
                                                {isInviting ? 'Enviando invitación...' : 'Invitar a este contrato'}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })
                    )}
                </View>

                {/* SECTION 2: Future admin performances */}
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>Actuaciones Futuras</Text>
                    <Text style={styles.sectionSubtitle}>
                        Crea un nuevo contrato para una de tus actuaciones y contrata a {musicianName || 'este músico'}.
                    </Text>

                    {adminPerformances.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>
                                No tienes actuaciones futuras como administrador de banda.
                            </Text>
                        </View>
                    ) : (
                        adminPerformances.map((performance) => {
                            const event = performance?.Event;
                            const band = event?.band;

                            return (
                                <Pressable
                                    key={performance.id}
                                    style={styles.card}
                                    onPress={() => handleCreateAgreement(performance)}
                                >
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage}
                                            style={styles.bandImage}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardTitle} numberOfLines={1}>{event?.name}</Text>
                                            <Text style={styles.cardSub} numberOfLines={1}>{band?.name}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        {event?.date && <Text style={styles.cardDate}>{parseDate(event.date)}</Text>}
                                        {event?.location && (
                                            <Text style={styles.cardLocation} numberOfLines={1}>{event.location}</Text>
                                        )}
                                    </View>

                                    <View style={[styles.actionRow, { backgroundColor: GlobalStyle.blue }]}>
                                        <Text style={[styles.actionRowText, { color: GlobalStyle.yellow }]}>
                                            Crear contrato e invitar
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </View>

            <View style={{ height: 40 }} />
            </ScrollView>

            <BottomSheet sheetRef={inviteSheetRef} snapPoints={inviteSheetSnapPoints} uploading={Boolean(invitingId)}>
                <Text style={styles.sheetTitle}>Invitar músico</Text>
                <Text style={styles.sheetMessage}>
                    {`¿Quieres invitar a ${musicianName || 'este músico'} al contrato de "${pendingInviteAgreement?.performance?.Event?.name || 'este evento'}"?`}
                </Text>
                <Pressable
                    style={[styles.primaryAction, Boolean(invitingId) && styles.disabledAction]}
                    onPress={confirmInvite}
                    disabled={Boolean(invitingId)}
                >
                    <Text style={styles.primaryActionText}>{invitingId ? 'Enviando...' : 'Invitar'}</Text>
                </Pressable>
                <Pressable
                    style={[styles.secondaryAction, Boolean(invitingId) && styles.disabledAction]}
                    onPress={closeInviteSheet}
                    disabled={Boolean(invitingId)}
                >
                    <Text style={styles.secondaryActionText}>Cancelar</Text>
                </Pressable>
            </BottomSheet>
        </>
    );
};

export default HireMusicianScreen;

const styles = StyleSheet.create({
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
    body: {
        paddingHorizontal: 25,
        gap: 16,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
        marginBottom: 2,
    },
    sectionSubtitle: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
        marginBottom: 12,
    },
    emptyBox: {
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
    card: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 10,
    },
    cardDisabled: {
        opacity: 0.7,
    },
    cardHeader: {
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
    cardTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    },
    cardSub: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
    },
    paymentBadge: {
        backgroundColor: '#FFF5E6',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    paymentText: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.yellow,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: GlobalStyle.lightGray,
        paddingTop: 8,
        gap: 2,
    },
    cardDate: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    cardInstrument: {
        fontFamily: 'Oswald_500',
        fontSize: 13,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    cardLocation: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase',
    },
    actionRow: {
        backgroundColor: GlobalStyle.yellow,
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    actionRowText: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
    alreadyInvitedBadge: {
        backgroundColor: GlobalStyle.lightGray,
        borderRadius: 8,
        paddingVertical: 7,
        alignItems: 'center',
    },
    alreadyInvitedText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    sheetTitle: {
        fontSize: 22,
        fontFamily: 'Oswald_600',
        color: GlobalStyle.black,
        textAlign: 'center',
    },
    sheetMessage: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    primaryAction: {
        backgroundColor: `${GlobalStyle.yellow}a9`,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryActionText: {
        fontWeight: '600',
        color: '#111827',
    },
    secondaryAction: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
        marginTop: 10,
    },
    secondaryActionText: {
        fontWeight: '600',
        color: '#111827',
    },
    disabledAction: {
        opacity: 0.6,
    },
});
