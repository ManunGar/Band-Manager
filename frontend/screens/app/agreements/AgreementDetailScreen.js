import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AgreementEndpoints from '../../../api/AgreementEndpoints';
import bandProfileDefault from '../../../assets/milestones/band_default.png';
import performancePictureDefault from '../../../assets/milestones/performance_default.jpg';
import profileDefault from '../../../assets/milestones/profile_default.png';
import BottomSheet from '../../../components/BottomSheet';
import EventMapView from '../../../components/EventMapView';
import AgendaIcon from '../../../components/icons/AgendaIcon';
import AttendanceIcon from '../../../components/icons/AttendanceIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import MusicIcon from '../../../components/icons/MusicIcon';
import StarIcon from '../../../components/icons/StarIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const APPLICATION_STATUS = {
    pending: { label: 'Solicitud Pendiente', bg: '#FFF5E6', border: GlobalStyle.yellow, color: GlobalStyle.yellow },
    accepted: { label: 'Solicitud Aceptada', bg: '#E8F6EA', border: GlobalStyle.darkGreen, color: GlobalStyle.green },
    rejected: { label: 'Solicitud Rechazada', bg: '#F4E8E8', border: GlobalStyle.darkRed, color: GlobalStyle.red },
};

const AgreementDetailScreen = ({ route }) => {
    const { agreementId } = route.params;
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [agreement, setAgreement] = useState(null);
    const [applying, setApplying] = useState(false);
    const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [selectedApplicationToRate, setSelectedApplicationToRate] = useState(null);
    const [selectedRate, setSelectedRate] = useState(0);
    const [ratingApplicationId, setRatingApplicationId] = useState(null);
    const [deletingAgreement, setDeletingAgreement] = useState(false);
    const navigation = useNavigation();
    const rateSheetRef = useRef(null);
    const rateSheetSnapPoints = useMemo(() => ['50%'], []);

    useEffect(() => {
        fetchAgreement();
    }, [agreementId]);

    const fetchAgreement = async () => {
        const fetched = await AgreementEndpoints.getAgreement(agreementId);
        setAgreement(fetched);
    };

    const event = agreement?.performance?.Event;
    const performance = agreement?.performance;
    const band = event?.band;

    const eventLat = Number.parseFloat(event?.latitude);
    const eventLng = Number.parseFloat(event?.longitude);
    const hasValidCoordinates = Number.isFinite(eventLat) && Number.isFinite(eventLng);

    const startDateText = event?.date ? parseDate(event.date) : '';
    const endDateText = event?.endDate ? parseDate(event.endDate) : '';
    const startDay = event?.date?.slice(0, 10);
    const endDay = event?.endDate?.slice(0, 10);
    const isSameDay = startDay && endDay && startDay === endDay;

    const isAfterDeadline = event?.date ? new Date() > new Date(event.date) : false;
    const isOpen = agreement?.status === 'open' && !isAfterDeadline;
    const hasEventStarted = useMemo(() => {
        if (!event?.date) return false;
        const eventStart = new Date(event.date);
        const [hours, minutes, seconds] = (event.initialTime || '00:00:00').split(':').map(Number);
        eventStart.setHours(hours || 0, minutes || 0, seconds || 0, 0);
        return eventStart <= new Date();
    }, [event?.date, event?.initialTime]);

    const hasEventEnded = useMemo(() => {
        if (!event?.date) return false;

        const eventEnd = new Date(event.endDate || event.date);
        const [hours, minutes, seconds] = (event.endTime || event.initialTime || '00:00:00').split(':').map(Number);
        eventEnd.setHours(hours || 0, minutes || 0, seconds || 0, 0);

        return eventEnd <= new Date();
    }, [event?.date, event?.endDate, event?.initialTime, event?.endTime]);

    const isOwner = agreement?.musicianId === user?.musician?.id;
    const myApplication = agreement?.applications?.find(app => app.musicianId === user?.musician?.id);
    const appStatus = myApplication ? APPLICATION_STATUS[myApplication.status] : null;
    const ownerApplications = agreement?.applications ?? [];
    const hasAcceptedApplications = ownerApplications.some((application) => application?.status === 'accepted');

    const totalApplicants = agreement?.applications?.length ?? 0;

    const ownerPhone = agreement?.musician?.user?.phone;

    const handleApply = async () => {
        try {
            setApplying(true);
            await AgreementEndpoints.applyToAgreement(agreementId);
            await fetchAgreement();
            showToast('¡Solicitud enviada!', 'Tu solicitud ha sido enviada correctamente.', 'success');
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al enviar tu solicitud.', 'error');
        } finally {
            setApplying(false);
        }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        try {
            setUpdatingApplicationId(applicationId);
            const response = await AgreementEndpoints.updateApplicationStatus(agreementId, applicationId, status);
            await fetchAgreement();

            if (response?.reopened) {
                showToast('Solicitud actualizada', 'La solicitud ha sido rechazada y el contrato se ha reabierto.', 'info');
                return;
            }

            showToast('Solicitud actualizada', `La solicitud ha sido ${status === 'accepted' ? 'aceptada' : 'rechazada'} correctamente.`, 'success');
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al actualizar la solicitud.', 'error');
        } finally {
            setUpdatingApplicationId(null);
        }
    };

    const handleStatusChange = (applicationId, status, currentStatus) => {
        const isRejectingAccepted = status === 'rejected' && currentStatus === 'accepted';

        Alert.alert(
            status === 'accepted' ? 'Aceptar solicitud' : 'Rechazar solicitud',
            status === 'accepted'
                ? '¿Quieres aceptar esta solicitud?'
                : isRejectingAccepted
                    ? '¿Quieres rechazar esta solicitud ya aceptada? Si el contrato estaba cerrado, se volverá a abrir.'
                    : '¿Quieres rechazar esta solicitud?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: status === 'accepted' ? 'Aceptar' : 'Rechazar',
                    style: status === 'accepted' ? 'default' : 'destructive',
                    onPress: () => updateApplicationStatus(applicationId, status),
                }
            ]
        );
    };

    const formatAverageRate = (averageRate) => {
        if (averageRate === null || averageRate === undefined || Number.isNaN(Number(averageRate))) {
            return '_._';
        }
        return `${Number(averageRate).toFixed(1)} / 5`;
    };

    const formatApplicationRate = (rate) => {
        if (rate === null || rate === undefined || Number.isNaN(Number(rate))) {
            return 'Sin calificar';
        }
        return `${Number(rate).toFixed(1)} / 5`;
    };

    const getNormalizedRate = (rate) => {
        const parsedRate = Number(rate);
        if (!Number.isFinite(parsedRate)) return 0;
        const clampedRate = Math.max(0, Math.min(5, parsedRate));
        return Math.round(clampedRate * 2) / 2;
    };

    const getRateIconName = (rate, starNumber) => {
        if (rate >= starNumber) return 'star';
        if (rate >= starNumber - 0.5) return 'star-half';
        return 'star-border';
    };

    const openRateSheet = (application) => {
        setSelectedApplicationToRate(application);
        setSelectedRate(getNormalizedRate(application?.rate));
        rateSheetRef.current?.present();
    };

    const closeRateSheet = () => {
        if (ratingApplicationId) return;
        rateSheetRef.current?.dismiss();
        setSelectedApplicationToRate(null);
    };

    const handleRateApplication = async () => {
        if (!selectedApplicationToRate?.id) return;

        try {
            setRatingApplicationId(selectedApplicationToRate.id);
            await AgreementEndpoints.rateApplication(agreementId, selectedApplicationToRate.id, selectedRate);
            await fetchAgreement();
            rateSheetRef.current?.dismiss();
            setSelectedApplicationToRate(null);
            showToast('Calificación guardada', 'La calificación se registró correctamente.', 'success');
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al calificar al músico.', 'error');
        } finally {
            setRatingApplicationId(null);
        }
    };

    const deleteAgreement = async () => {
        try {
            setDeletingAgreement(true);
            await AgreementEndpoints.deleteAgreement(agreementId);
            showToast('Contrato eliminado', 'El contrato se eliminó correctamente.', 'success');
            navigation.goBack();
        } catch (error) {
            showToast('Error', error.message || 'No se pudo eliminar el contrato.', 'error');
        } finally {
            setDeletingAgreement(false);
        }
    };

    const handleDeleteAgreement = () => {
        Alert.alert(
            'Eliminar contrato',
            '¿Seguro que quieres eliminar este contrato? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: deleteAgreement,
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false}>
                <TopContainer
                    style={{ paddingBottom: 0, marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    editEnabled={false}
                    title={band?.name || 'Detalle del Contrato'}
                />

                {/* HEADER */}
                <View style={styles.headerContainer}>
                    <Image
                        source={performance?.picture ? { uri: performance.picture } : performancePictureDefault}
                        style={styles.image}
                    />

                    <View style={{ paddingHorizontal: 8, paddingBottom: 12, paddingTop: 10, width: '100%' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <Image
                                source={band?.profile_picture ? { uri: band.profile_picture } : bandProfileDefault}
                                style={styles.bandImage}
                            />
                            <Text style={styles.bandName}>{band?.name}</Text>
                        </View>

                        {/* Has application — small status chip */}
                        {myApplication && appStatus && (
                            <View style={[styles.statusChip, { marginBottom: 10, marginTop: 10, alignSelf: 'flex-start', backgroundColor: appStatus.bg, borderColor: appStatus.border }]}>
                                <Text style={[styles.statusChipText, { color: appStatus.color }]}>{appStatus.label}</Text>
                            </View>
                        )}
                        <Text style={styles.title}>{event?.name}</Text>
                        <Text style={styles.price}>{agreement?.payment}€</Text>
                    </View>

                    <View style={{ paddingHorizontal: 8, gap: 10, paddingBottom: 25, paddingTop: 15, width: '100%', borderTopWidth: 1, borderTopColor: GlobalStyle.lightGray }}>
                        {performance?.type && (
                            <View style={styles.detailRow}>
                                <MusicIcon width={20} height={20} fill={GlobalStyle.black} />
                                <Text style={styles.detailText}>{performance.type}</Text>
                            </View>
                        )}
                        {event && (
                            <View style={styles.detailRow}>
                                <AgendaIcon width={20} height={20} fill={GlobalStyle.black} strokeWidth={30} />
                                {isSameDay ? (
                                    <Text style={styles.detailText}>{startDateText}</Text>
                                ) : (
                                    <Text style={styles.detailText}>{startDateText}</Text>
                                )}
                            </View>
                        )}
                        {event && (
                            <View style={styles.detailRow}>
                                <TimeIcon width={20} height={20} fill={GlobalStyle.black} />
                                <Text style={styles.detailText}>
                                    {event?.initialTime?.substring(0, 5)} - {event?.endTime?.substring(0, 5)} {event?.date !== event?.endDate ? `· ${parseDate(event?.endDate).split('de')[0]}` : ''}
                                </Text>
                            </View>
                        )}
                        {event?.location && (
                            <View style={styles.detailRow}>
                                <LocationIcon width={20} height={22} fill={GlobalStyle.black} />
                                <Text style={styles.detailText}>{event.location}</Text>
                            </View>
                        )}
                    </View>

                    {/* MAP */}
                    <View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
                        {hasValidCoordinates ? (
                            <EventMapView
                                latitude={eventLat}
                                longitude={eventLng}
                                explorable={false}
                                selectable={false}
                                mapHeight={200}
                                zoomDelta={0.004}
                                onMapTouchStart={() => setScrollEnabled(false)}
                                onMapTouchEnd={() => setScrollEnabled(true)}
                            />
                        ) : (
                            <View style={styles.mapFallback}>
                                <Text style={styles.mapFallbackText}>Este evento no tiene coordenadas válidas para mostrar el mapa.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* BODY */}
                <View style={{ paddingHorizontal: 25, paddingBottom: 60 }}>
                    {/* Instrument */}
                    <View style={{ paddingTop: 22, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MusicIcon width={22} height={22} fill={GlobalStyle.black} />
                        <Text style={styles.subtitle}>Instrumento Solicitado</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            {agreement?.amount}× {agreement?.instrument?.name}
                        </Text>
                    </View>

                    {/* Description */}
                    {agreement?.description ? (
                        <>
                            <Text style={[styles.subtitle, { marginTop: 22, marginBottom: 12 }]}>Descripción</Text>
                            <View style={styles.infoBox}>
                                <Text style={[styles.infoText, { color: GlobalStyle.darkGray }]}>{agreement.description}</Text>
                            </View>
                        </>
                    ) : null}

                    {/* Applicants */}
                    <View style={{ paddingTop: 22, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <AttendanceIcon width={25} height={22} />
                            <Text style={styles.subtitle}>Músicos Inscritos</Text>
                        </View>
                        <Text style={[styles.subtitle, { color: GlobalStyle.yellow }]}>
                            {totalApplicants}
                        </Text>
                    </View>

                    {/* Owner applications list */}
                    {isOwner && (
                        <View style={{ marginTop: 6 }}>
                            {hasEventStarted && ownerApplications.length > 0 && (
                                <View style={styles.lockedStatusNotice}>
                                    <Text style={styles.lockedStatusNoticeText}>El evento ya ha empezado. No se pueden modificar estados de solicitudes.</Text>
                                </View>
                            )}
                            {ownerApplications.length === 0 ? (
                                <View style={styles.infoBox}>
                                    <Text style={[styles.infoText, { color: GlobalStyle.darkGray }]}>Aún no hay músicos inscritos en este contrato.</Text>
                                </View>
                            ) : (
                                ownerApplications.map((application) => {
                                    const musician = application?.musician;
                                    const musicianUser = musician?.user;
                                    const isBandInvite = application?.type === 'band_invite';
                                    const statusStyle = APPLICATION_STATUS[application?.status];
                                    const isPending = application?.status === 'pending';
                                    const isAccepted = application?.status === 'accepted';
                                    const isUpdating = updatingApplicationId === application?.id;
                                    const hasRate = application?.rate !== null && application?.rate !== undefined && !Number.isNaN(Number(application?.rate));
                                    const canRateApplication = hasEventEnded && isAccepted && application?.type === 'musician_apply';
                                    const showPendingActions = isPending && !hasEventStarted && !isBandInvite;
                                    const showRejectAction = !hasEventStarted && (isPending || isAccepted);
                                    const showAcceptedActionStatus = isAccepted && showRejectAction;

                                    return (
                                        <Pressable key={application.id} style={styles.applicantCard} onPress={() => navigation.navigate('MusicianProfile', { musicianId: musician?.id })}>
                                            <View style={styles.applicantHeader}>
                                                <Image
                                                    source={musicianUser?.profile_picture ? { uri: musicianUser.profile_picture } : profileDefault}
                                                    style={styles.applicantImage}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.applicantName}>{musicianUser?.full_name || 'Músico'}</Text>
                                                    <Text style={styles.applicantLevel}>{musician?.instrumentLevel || 'No indicado'}</Text>
                                                </View>
                                                {isBandInvite && (
                                                    <View style={styles.inviteBadge}>
                                                        <Text style={styles.inviteBadgeText}>Invitado</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 6 }}>
                                                <View style={styles.metaRow}>
                                                    <LocationIcon width={14} height={14} fill={GlobalStyle.gray} />
                                                    <Text style={styles.applicantMeta}>{musicianUser?.location || 'Sin ubicación'}</Text>
                                                </View>
                                                <View style={styles.metaRow}>
                                                    <StarIcon width={14} height={14} fill={GlobalStyle.gray} stroke={GlobalStyle.gray} strokeWidth={0.4} />
                                                    <Text style={styles.applicantMeta}>{formatAverageRate(musician?.averageRate)}</Text>
                                                </View>
                                            </View>

                                            {isBandInvite && isPending ? (
                                                <View style={styles.pendingInviteNotice}>
                                                    <Text style={styles.pendingInviteText}>Invitación pendiente de respuesta</Text>
                                                </View>
                                            ) : null}

                                            {(showPendingActions || showRejectAction) ? (
                                                <>
                                                    {showAcceptedActionStatus && (
                                                        <View style={[styles.statusChip, styles.inlineActionStatusChip, { backgroundColor: statusStyle?.bg }]}> 
                                                            <Text style={[styles.statusChipText, { color: statusStyle?.color }]}>{statusStyle?.label || application.status}</Text>
                                                        </View>
                                                    )}
                                                <View style={styles.applicantActions}>
                                                    {showPendingActions && (
                                                        <Pressable
                                                            onPress={() => handleStatusChange(application.id, 'accepted', application.status)}
                                                            disabled={Boolean(updatingApplicationId)}
                                                            style={[styles.actionButton, styles.acceptButton, Boolean(updatingApplicationId) && styles.actionButtonDisabled]}
                                                        >
                                                            <Text style={[styles.actionButtonText, styles.acceptButtonText]}>{isUpdating ? 'Procesando...' : 'Aceptar'}</Text>
                                                        </Pressable>
                                                    )}

                                                    <Pressable
                                                        onPress={() => handleStatusChange(application.id, 'rejected', application.status)}
                                                        disabled={Boolean(updatingApplicationId)}
                                                        style={[
                                                            styles.actionButton,
                                                            styles.rejectButton,
                                                            !showPendingActions && styles.singleActionButton,
                                                            Boolean(updatingApplicationId) && styles.actionButtonDisabled
                                                        ]}
                                                    >
                                                        <Text style={[styles.actionButtonText, styles.rejectButtonText]}>{isUpdating ? 'Procesando...' : isAccepted ? 'Revertir a rechazado' : 'Rechazar'}</Text>
                                                    </Pressable>
                                                </View>
                                                </>
                                            ) : (
                                                <View style={[styles.statusChip, styles.ownerStatusChip, { backgroundColor: statusStyle?.bg }]}>
                                                    <Text style={[styles.statusChipText, { color: statusStyle?.color }]}>{statusStyle?.label || application.status}</Text>
                                                </View>
                                            )}

                                            {canRateApplication && (
                                                <View style={styles.rateContainer}>
                                                    <View style={styles.rateMetaRow}>
                                                        <StarIcon width={14} height={14} fill={GlobalStyle.yellow} stroke={GlobalStyle.yellow} strokeWidth={0.2} />
                                                        <Text style={styles.rateMetaText}>{formatApplicationRate(application?.rate)}</Text>
                                                    </View>
                                                    <Pressable
                                                        onPress={() => openRateSheet(application)}
                                                        style={styles.rateButton}
                                                    >
                                                        <Text style={styles.rateButtonText}>{hasRate ? 'Editar calificación' : 'Calificar músico'}</Text>
                                                    </Pressable>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                })
                            )}

                            <View style={styles.ownerActionsSection}>
                                <Pressable
                                    onPress={handleDeleteAgreement}
                                    disabled={hasAcceptedApplications || deletingAgreement}
                                    style={[
                                        styles.deleteAgreementButton,
                                        (hasAcceptedApplications || deletingAgreement) && styles.deleteAgreementButtonDisabled
                                    ]}
                                >
                                    <Text style={styles.deleteAgreementButtonText}>
                                        {deletingAgreement ? 'Eliminando...' : 'Eliminar contrato'}
                                    </Text>
                                </Pressable>

                                {hasAcceptedApplications && (
                                    <Text style={styles.deleteAgreementHint}>
                                        No puedes eliminar este contrato porque ya tiene solicitudes aceptadas.
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Apply / Status section (non-owners only) */}
                    {!isOwner && (
                        <View style={{ marginTop: 8 }}>
                            {/* No application yet */}
                            {!myApplication && isOpen && (
                                <Pressable
                                    onPress={handleApply}
                                    disabled={applying}
                                    style={[styles.applyButton, {
                                        backgroundColor: applying ? GlobalStyle.lightGray : GlobalStyle.yellow,
                                        borderColor: applying ? GlobalStyle.lightGray : GlobalStyle.yellow,
                                    }]}
                                >
                                    <Text style={[styles.applyButtonText, { color: applying ? GlobalStyle.gray : GlobalStyle.blue }]}>
                                        {applying ? 'Enviando...' : 'Solicitar Contrato'}
                                    </Text>
                                </Pressable>
                            )}

                            {/* Closed with no application */}
                            {!myApplication && !isOpen && (
                                <View style={styles.closedBadge}>
                                    <Text style={styles.closedBadgeText}>Contrato cerrado</Text>
                                </View>
                            )}

                            {/* Phone number — only when accepted */}
                            {myApplication?.status === 'accepted' && ownerPhone && (
                                <Pressable
                                    onPress={() => Linking.openURL(`tel:${ownerPhone}`)}
                                    style={styles.phoneRow}
                                >
                                    <Text style={styles.phoneLabel}>Contactar con el organizador</Text>
                                    <Text style={styles.phoneNumber}>{ownerPhone}</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <BottomSheet sheetRef={rateSheetRef} snapPoints={rateSheetSnapPoints} uploading={Boolean(ratingApplicationId)}>
                <Text style={styles.rateSheetTitle}>Calificar músico contratado</Text>
                <Text style={styles.rateSheetName}>{selectedApplicationToRate?.musician?.user?.full_name || 'Músico'}</Text>
                <Text style={styles.rateSheetHint}>Selecciona una calificación entre 0 y 5 estrellas, con intervalos de 0.5.</Text>

                <View style={styles.rateStarsRow}>
                    {[1, 2, 3, 4, 5].map((starNumber) => (
                        <View key={starNumber} style={styles.rateStarWrapper}>
                            <Pressable style={styles.rateHalfLeft} onPress={() => setSelectedRate(starNumber - 0.5)} />
                            <Pressable style={styles.rateHalfRight} onPress={() => setSelectedRate(starNumber)} />
                            <MaterialIcons
                                name={getRateIconName(selectedRate, starNumber)}
                                size={40}
                                color={GlobalStyle.yellow}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.rateValueText}>{selectedRate.toFixed(1)} / 5</Text>

                <View style={styles.rateSheetButtonsRow}>
                    <Pressable
                        onPress={closeRateSheet}
                        disabled={Boolean(ratingApplicationId)}
                        style={[styles.rateSheetButton, styles.rateSheetCancelButton, Boolean(ratingApplicationId) && styles.actionButtonDisabled]}
                    >
                        <Text style={styles.rateSheetCancelButtonText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleRateApplication}
                        disabled={Boolean(ratingApplicationId)}
                        style={[styles.rateSheetButton, styles.rateSheetSubmitButton, Boolean(ratingApplicationId) && styles.actionButtonDisabled]}
                    >
                        <Text style={styles.rateSheetSubmitButtonText}>{ratingApplicationId ? 'Guardando...' : 'Guardar'}</Text>
                    </Pressable>
                </View>
            </BottomSheet>
        </KeyboardAvoidingView>
    );
};

export default AgreementDetailScreen;

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 12,
        backgroundColor: GlobalStyle.white,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        maxWidth: 380,
    },
    bandImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: GlobalStyle.lightGray,
    },
    bandName: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.gray,
    },
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 30,
        color: GlobalStyle.black,
    },
    price: {
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.yellow,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    detailText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.black,
        flexShrink: 1,
    },
    subtitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    infoBox: {
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 48,
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.black,
    },
    applyButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 40,
        borderWidth: 1,
        alignItems: 'center',
        alignSelf: 'center',
        width: '80%',
    },
    applyButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        textAlign: 'center',
    },
    closedBadge: {
        alignSelf: 'center',
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.lightGray,
    },
    closedBadgeText: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    statusChip: {
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusChipText: {
        fontFamily: 'Oswald_500',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    phoneRow: {
        marginTop: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    phoneLabel: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.darkGray,
    },
    phoneNumber: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.blue,
    },
    mapFallback: {
        height: 120,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: GlobalStyle.white,
    },
    mapFallbackText: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.gray,
        textAlign: 'center',
    },
    applicantCard: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    applicantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    applicantImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GlobalStyle.lightGray,
    },
    applicantName: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
        marginBottom: 2,
    },
    applicantLevel: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.yellow,
        marginTop: -6,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    applicantMeta: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.darkGray,
    },
    applicantActions: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 3,
        alignItems: 'center',
    },
    actionButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
    },
    acceptButton: {
        backgroundColor: '#E8F6EA',
        borderColor: GlobalStyle.darkGreen,
    },
    acceptButtonText: {
        color: GlobalStyle.darkGreen,
    },
    rejectButton: {
        backgroundColor: '#F4E8E8',
        borderColor: GlobalStyle.darkRed,
    },
    rejectButtonText: {
        color: GlobalStyle.darkRed,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    ownerStatusChip: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    inlineActionStatusChip: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    singleActionButton: {
        flex: 0,
        minWidth: 180,
    },
    lockedStatusNotice: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: GlobalStyle.white,
    },
    lockedStatusNoticeText: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.gray,
    },
    inviteBadge: {
        backgroundColor: '#EAF0FF',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    inviteBadgeText: {
        fontFamily: 'Oswald_500',
        fontSize: 11,
        color: '#3A5FC8',
        textTransform: 'uppercase',
    },
    pendingInviteNotice: {
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: GlobalStyle.white,
        alignItems: 'center',
    },
    pendingInviteText: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    rateContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: GlobalStyle.lightGray,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    rateMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rateMetaText: {
        fontFamily: 'Oswald_500',
        fontSize: 14,
        color: GlobalStyle.darkGray,
    },
    rateButton: {
        borderWidth: 1,
        borderColor: GlobalStyle.yellow,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFF5E6',
    },
    rateButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 13,
        color: GlobalStyle.yellow,
        textTransform: 'uppercase',
    },
    rateSheetTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.black,
    },
    rateSheetName: {
        marginTop: -4,
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.gray,
    },
    rateSheetHint: {
        marginTop: 10,
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.darkGray,
    },
    rateStarsRow: {
        marginTop: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rateStarWrapper: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    rateHalfLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        zIndex: 2,
    },
    rateHalfRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        zIndex: 2,
    },
    rateValueText: {
        marginTop: 10,
        textAlign: 'center',
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.yellow,
    },
    rateSheetButtonsRow: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 10,
    },
    rateSheetButton: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    rateSheetCancelButton: {
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.white,
    },
    rateSheetCancelButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    rateSheetSubmitButton: {
        borderColor: GlobalStyle.yellow,
        backgroundColor: GlobalStyle.yellow,
    },
    rateSheetSubmitButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
    ownerActionsSection: {
        marginTop: 14,
    },
    deleteAgreementButton: {
        alignSelf: 'center',
        width: '80%',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: GlobalStyle.darkRed,
        backgroundColor: '#F4E8E8',
        paddingVertical: 10,
        alignItems: 'center',
    },
    deleteAgreementButtonDisabled: {
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.lightGray,
    },
    deleteAgreementButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
        color: GlobalStyle.darkRed,
        textTransform: 'uppercase',
    },
    deleteAgreementHint: {
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
    },
});
