import { useContext, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import AgreementEndpoints from '../../../../api/AgreementEndpoints';
import AgreementCard from '../../../../components/AgreementCard';
import Tag from '../../../../components/Tap';
import { AuthContext } from '../../../../contexts/AuthContext';

const Agreement = () => {
    const { user } = useContext(AuthContext);
    const [instrumentId, setInstrumentId] = useState(null);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            console.log("🚀 ~ Agreement ~ offset:", offset)
            const fetchedAgreements = await AgreementEndpoints.listAgreements(instrumentId, search, offset, 5, startDate, endDate);
            console.log("🚀 ~ fetchAgreements ~ fetchedAgreements:", fetchedAgreements)
            setAgreements(fetchedAgreements.data);
            setHasMore(fetchedAgreements.hasMore);
        } catch (error) {
            console.error("Error fetching agreements:", error);
        }
    }


    return (
        <View style={{ flex: 1, paddingInline: 25 }}>

            <FlatList
                ListHeaderComponent={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <Tag selected={instrumentId === null} onPress={() => setInstrumentId(null)}>Todos</Tag>
                        {user?.musician?.instruments?.map((instrument) => (
                            <Tag key={instrument.id} selected={instrumentId === instrument.id} onPress={() => setInstrumentId(instrument.id)}>
                                {instrument.name}
                            </Tag>
                        ))}
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
            //         setOffset(prevOffset => prevOffset + 5);
            //         fetchAgreements();
            //     }
            // }}
            />

        </View>
    )

}

export default Agreement