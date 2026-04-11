import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import ApplicationCard from '../../../../components/ApplicationCard';
import BottomSheet from '../../../../components/BottomSheet';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const Applications = () => {
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const { showToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [respondingId, setRespondingId] = useState(null);
    const [pendingResponse, setPendingResponse] = useState(null);
    const responseSheetRef = useRef(null);
    const responseSheetSnapPoints = useMemo(() => ['38%'], []);

    useEffect(() => {
        fetchApplications();
    }, [debouncedSearch, startDate, endDate]);

    const fetchApplications = async () => {
        try {
            const fetched = await AgreementEndpoints.listMyApplications(
                debouncedSearch || null,
                startDate,
                endDate
            );
            setApplications(fetched || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    };

    const handleRespond = (applicationId, status, bandName) => {
        setPendingResponse({ applicationId, status, bandName });
        responseSheetRef.current?.present();
    };

    const closeResponseSheet = () => {
        if (respondingId) return;
        responseSheetRef.current?.dismiss();
        setPendingResponse(null);
    };

    const confirmRespond = async () => {
        if (!pendingResponse?.applicationId || !pendingResponse?.status) return;

        try {
            responseSheetRef.current?.dismiss();
            setRespondingId(pendingResponse.applicationId);
            await AgreementEndpoints.respondToInvite(pendingResponse.applicationId, pendingResponse.status);
            await fetchApplications();
            setPendingResponse(null);
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al responder la invitación.', 'error');
        } finally {
            setRespondingId(null);
        }
    };

    return (
        <>
            <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 20 }}>
                <FlatList
                    data={applications}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isBandInvite = item?.type === 'band_invite';
                        const isPending = item?.status === 'pending';
                        const bandName = item?.agreement?.performance?.Event?.band?.name;

                        return (
                            <ApplicationCard
                                application={item}
                                onAccept={isBandInvite && isPending ? () => handleRespond(item.id, 'accepted', bandName) : undefined}
                                onReject={isBandInvite && isPending ? () => handleRespond(item.id, 'rejected', bandName) : undefined}
                                responding={respondingId === item.id}
                            />
                        );
                    }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={(
                        <Text style={{ textAlign: 'center', marginTop: 25, color: GlobalStyle.gray, fontFamily: 'Oswald_400' }}>
                            No tienes solicitudes con esos filtros.
                        </Text>
                    )}
                />
            </View>

            <BottomSheet sheetRef={responseSheetRef} snapPoints={responseSheetSnapPoints} uploading={Boolean(respondingId)}>
                <Text style={styles.sheetTitle}>{pendingResponse?.status === 'accepted' ? 'Aceptar invitación' : 'Rechazar invitación'}</Text>
                <Text style={styles.sheetMessage}>
                    {pendingResponse?.status === 'accepted'
                        ? `¿Quieres aceptar la invitación de ${pendingResponse?.bandName || 'la banda'}?`
                        : `¿Quieres rechazar la invitación de ${pendingResponse?.bandName || 'la banda'}?`}
                </Text>
                <Pressable
                    style={[
                        styles.sheetAction,
                        pendingResponse?.status === 'accepted' ? styles.sheetAcceptAction : styles.sheetDangerAction,
                        Boolean(respondingId) && styles.sheetDisabled,
                    ]}
                    onPress={confirmRespond}
                    disabled={Boolean(respondingId)}
                >
                    <Text style={[
                        styles.sheetActionText,
                        pendingResponse?.status === 'accepted' ? styles.sheetAcceptActionText : styles.sheetDangerActionText,
                    ]}>
                        {respondingId
                            ? 'Procesando...'
                            : pendingResponse?.status === 'accepted'
                                ? 'Aceptar'
                                : 'Rechazar'}
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.sheetCancelAction, Boolean(respondingId) && styles.sheetDisabled]}
                    onPress={closeResponseSheet}
                    disabled={Boolean(respondingId)}
                >
                    <Text style={styles.sheetCancelActionText}>Cancelar</Text>
                </Pressable>
            </BottomSheet>
        </>
    );
};

export default Applications;

const styles = StyleSheet.create({
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
    sheetAction: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        marginTop: 10,
    },
    sheetAcceptAction: {
        backgroundColor: `${GlobalStyle.yellow}a9`,
        marginTop: 10,
    },
    sheetDangerAction: {
        backgroundColor: '#fef2f2',
        marginTop: 10,
    },
    sheetActionText: {
        fontWeight: '600',
        color: '#111827',
    },
    sheetAcceptActionText: {
        color: '#111827',
    },
    sheetDangerActionText: {
        color: '#dc2626',
    },
    sheetCancelAction: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
        marginTop: 10,
    },
    sheetCancelActionText: {
        fontWeight: '600',
        color: '#111827',
    },
    sheetDisabled: {
        opacity: 0.6,
    },
});
