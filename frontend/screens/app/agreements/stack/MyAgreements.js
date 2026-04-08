import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import MyAgreementCard from '../../../../components/MyAgreementCard';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';

const MyAgreements = () => {
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const [agreements, setAgreements] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchMyAgreements = async () => {
            try {
                const fetched = await AgreementEndpoints.listMyAgreements(
                    null,
                    debouncedSearch,
                    startDate,
                    endDate
                );
                setAgreements(fetched || []);
            } catch (error) {
                console.error('Error fetching my agreements:', error);
            }
        };

        fetchMyAgreements();
    }, [debouncedSearch, startDate, endDate]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const fetched = await AgreementEndpoints.listMyAgreements(
                null,
                debouncedSearch,
                startDate,
                endDate
            );
            setAgreements(fetched || []);
        } catch (error) {
            console.error('Error refreshing my agreements:', error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <View style={{ flex: 1, paddingInline: 25, paddingTop: 20 }}>
            <FlatList
                data={agreements}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <MyAgreementCard agreement={item} />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={(
                    <Text style={{ textAlign: 'center', marginTop: 25, color: '#8C8C8C', fontFamily: 'Oswald_400' }}>
                        No tienes contratos creados con esos filtros.
                    </Text>
                )}
            />
        </View>
    );

};

export default MyAgreements