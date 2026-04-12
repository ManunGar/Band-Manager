import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import MyAgreementCard from '../../../../components/MyAgreementCard';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const MyAgreements = () => {
    const navigation = useNavigation();
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
                contentContainerStyle={{ gap: 14, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <MyAgreementCard agreement={item} />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={(
                    <Text style={{ textAlign: 'center', marginTop: 25, color: '#8C8C8C', fontFamily: 'Oswald_400' }}>
                        No tienes contratos creados con esos filtros.
                    </Text>
                )}
            />

            <Pressable
                style={styles.fab}
                onPress={() => navigation.navigate('CreateAgreement')}
            >
                <Text style={styles.fabText}>+ Nuevo Contrato</Text>
            </Pressable>
        </View>
    );

};

export default MyAgreements

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 0,
        bottom: 20,
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
    fabText: {
        fontFamily: 'Oswald_500',
        fontSize: 15,
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
})