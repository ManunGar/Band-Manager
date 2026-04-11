import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import ApplicationCard from '../../../../components/ApplicationCard';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const Applications = () => {
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const { showToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [respondingId, setRespondingId] = useState(null);

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
        const isAccepting = status === 'accepted';
        Alert.alert(
            isAccepting ? 'Aceptar invitación' : 'Rechazar invitación',
            isAccepting
                ? `¿Quieres aceptar la invitación de ${bandName || 'la banda'}?`
                : `¿Quieres rechazar la invitación de ${bandName || 'la banda'}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: isAccepting ? 'Aceptar' : 'Rechazar',
                    style: isAccepting ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            setRespondingId(applicationId);
                            await AgreementEndpoints.respondToInvite(applicationId, status);
                            await fetchApplications();
                        } catch (error) {
                            showToast('Error', error.message || 'Hubo un error al responder la invitación.', 'error');
                        } finally {
                            setRespondingId(null);
                        }
                    }
                }
            ]
        );
    };

    return (
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
    );
};

export default Applications;
