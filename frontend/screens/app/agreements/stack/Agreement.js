import { useContext, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import AgreementCard from '../../../../components/AgreementCard';
import Tag from '../../../../components/Tap';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import { AuthContext } from '../../../../contexts/AuthContext';

const Agreement = () => {
    const { user } = useContext(AuthContext);
    const { debouncedSearch, startDate, endDate } = useAgreementSearch();
    const [instrumentId, setInstrumentId] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchAgreements();
    }, [instrumentId, debouncedSearch, offset, startDate, endDate]);

    const fetchAgreements = async () => {
        try {
            const fetchedAgreements = await AgreementEndpoints.listAgreements(
                instrumentId,
                debouncedSearch,
                offset,
                5,
                startDate,
                endDate
            );
            setAgreements(fetchedAgreements.data);
            setHasMore(fetchedAgreements.hasMore);
        } catch (error) {
            console.error('Error fetching agreements:', error);
        }
    };

    const onChangeInstrument = (id) => {
        setOffset(0);
        setInstrumentId(id);
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
                // onEndReached={() => {
                //     if (hasMore) {
                //         setOffset((prevOffset) => prevOffset + 5);
                //     }
                // }}
            />

        </View>
    );

};

export default Agreement