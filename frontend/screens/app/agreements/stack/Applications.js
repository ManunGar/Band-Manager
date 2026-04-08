import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import ApplicationCard from '../../../../components/ApplicationCard';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const Applications = () => {
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const [applications, setApplications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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

    return (
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 20 }}>
            <FlatList
                data={applications}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
                renderItem={({ item }) => <ApplicationCard application={item} />}
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
