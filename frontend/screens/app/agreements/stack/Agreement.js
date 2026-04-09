import { useContext, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import AgreementCard from '../../../../components/AgreementCard';
import LinkText from '../../../../components/LinkText';
import Tag from '../../../../components/Tap';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const PAGE_SIZE = 5;

const Agreement = () => {
    const { user } = useContext(AuthContext);
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const [instrumentId, setInstrumentId] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // When filters change: reset list and fetch from page 0
    useEffect(() => {
        const fetch = async () => {
            try {
                const fetched = await AgreementEndpoints.listAgreements(
                    instrumentId, debouncedSearch, 0, PAGE_SIZE, startDate, endDate
                );
                setAgreements(fetched.data);
                setHasMore(fetched.hasMore);
                setOffset(0);
            } catch (error) {
                console.error('Error fetching agreements:', error);
            }
        };
        fetch();
    }, [instrumentId, debouncedSearch, startDate, endDate]);

    // When offset increases (load more): append to existing list
    useEffect(() => {
        if (offset === 0) return;
        const fetch = async () => {
            try {
                const fetched = await AgreementEndpoints.listAgreements(
                    instrumentId, debouncedSearch, offset, PAGE_SIZE, startDate, endDate
                );
                setAgreements(prev => [...prev, ...fetched.data]);
                setHasMore(fetched.hasMore);
            } catch (error) {
                console.error('Error fetching agreements:', error);
            }
        };
        fetch();
    }, [offset]);

    const onChangeInstrument = (id) => {
        setInstrumentId(id);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const fetched = await AgreementEndpoints.listAgreements(
                instrumentId, debouncedSearch, 0, PAGE_SIZE, startDate, endDate
            );
            setAgreements(fetched.data);
            setHasMore(fetched.hasMore);
            setOffset(0);
        } catch (error) {
            console.error('Error refreshing agreements:', error);
        } finally {
            setRefreshing(false);
        }
    };


    return (
        <View style={{ flex: 1, paddingInline: 25 }}>

            <FlatList
                ListHeaderComponent={() => (
                    <View style={{ marginBottom: 5, gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Tag selected={instrumentId === null} onPress={() => onChangeInstrument(null)}>Todos</Tag>
                            {user?.musician?.instruments?.map((instrument) => (
                                <Tag key={instrument.id} selected={instrumentId === instrument.id} onPress={() => onChangeInstrument(instrument.id)}>
                                    {instrument.name}
                                </Tag>
                            ))}
                        </View>
                    </View>
                )}
                data={agreements}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <AgreementCard agreement={item} />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={(
                    <Text style={{ textAlign: 'center', marginTop: 25, color: GlobalStyle.gray, fontFamily: 'Oswald_400' }}>
                        No se encontraron contratos para este instrumento.
                    </Text>
                )}
                ListFooterComponent={() =>
                    hasMore ? (
                        <LinkText
                            style={{ textAlign: 'center', paddingVertical: 10 }}
                            onPress={() => setOffset(prev => prev + PAGE_SIZE)}
                        >
                            Cargar Más
                        </LinkText>
                    ) : null
                }
            />

        </View>
    );

};

export default Agreement