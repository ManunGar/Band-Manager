import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import MusicianEndpoints from '../../../../api/MusicianEndpoints';
import LinkText from '../../../../components/LinkText';
import MusicianCard from '../../../../components/MusicianCard';
import { useAgreementSearch } from '../../../../contexts/AgreementSearchContext';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const PAGE_SIZE = 8;

const Musicians = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const { debouncedSearch, musicianInstrumentId } = useAgreementSearch();
    const [musicians, setMusicians] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isProfilePrivate, setIsProfilePrivate] = useState(false);
    const loggedMusicianId = user?.musician?.id;

    const fetchOwnVisibility = useCallback(async () => {
        if (!loggedMusicianId) return;

        try {
            const fetched = await MusicianEndpoints.accountDetails(loggedMusicianId);
            const ownIsPrivate = fetched?.musician?.isProfilePrivate ?? fetched?.isProfilePrivate;
            setIsProfilePrivate(Boolean(ownIsPrivate));
        } catch (error) {
            console.error('Error fetching own visibility:', error);
        }
    }, [loggedMusicianId]);

    useFocusEffect(
        useCallback(() => {
            fetchOwnVisibility();
        }, [fetchOwnVisibility])
    );

    useEffect(() => {
        const fetch = async () => {
            try {
                const fetched = await MusicianEndpoints.listMusicians(
                    musicianInstrumentId,
                    debouncedSearch,
                    0,
                    PAGE_SIZE
                );

                setMusicians(fetched?.data || []);
                setHasMore(Boolean(fetched?.hasMore));
                setOffset(0);
            } catch (error) {
                console.error('Error fetching musicians:', error);
            }
        };

        fetch();
    }, [musicianInstrumentId, debouncedSearch]);

    useEffect(() => {
        if (offset === 0) return;

        const fetchMore = async () => {
            try {
                const fetched = await MusicianEndpoints.listMusicians(
                    musicianInstrumentId,
                    debouncedSearch,
                    offset,
                    PAGE_SIZE
                );

                setMusicians((prev) => [...prev, ...(fetched?.data || [])]);
                setHasMore(Boolean(fetched?.hasMore));
            } catch (error) {
                console.error('Error fetching more musicians:', error);
            }
        };

        fetchMore();
    }, [offset]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const [fetched] = await Promise.all([
                MusicianEndpoints.listMusicians(
                    musicianInstrumentId,
                    debouncedSearch,
                    0,
                    PAGE_SIZE
                ),
                fetchOwnVisibility(),
            ]);

            setMusicians(fetched?.data || []);
            setHasMore(Boolean(fetched?.hasMore));
            setOffset(0);
        } catch (error) {
            console.error('Error refreshing musicians:', error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 25 }}>
            <FlatList
                data={musicians}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ gap: 14, paddingVertical: 20 }}
                renderItem={({ item }) => (
                    <MusicianCard
                        musician={item}
                        onPress={() => navigation.navigate('MusicianProfile', { musicianId: item.id })}
                    />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    isProfilePrivate ? (
                        <View style={{
                            backgroundColor: '#FFF5E6',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#FFD892',
                            padding: 12,
                            marginBottom: 6,
                        }}>
                            <Text style={{ fontFamily: 'Oswald_500', fontSize: 16, color: GlobalStyle.blue }}>
                                Tu visibilidad está desactivada.
                            </Text>
                            <Text style={{ fontFamily: 'Oswald_400', fontSize: 14, color: GlobalStyle.darkGray }}>
                                No aparecerás para otras personas en esta lista. Si quieres aparecer, ve a tu configuración y activa esta opción.
                            </Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={(
                    <Text style={{ textAlign: 'center', marginTop: 25, color: GlobalStyle.gray, fontFamily: 'Oswald_400' }}>
                        No se encontraron músicos con esos filtros.
                    </Text>
                )}
                ListFooterComponent={() =>
                    hasMore ? (
                        <LinkText
                            style={{ textAlign: 'center', paddingVertical: 10 }}
                            onPress={() => setOffset((prev) => prev + PAGE_SIZE)}
                        >
                            Cargar Más
                        </LinkText>
                    ) : null
                }
            />
        </View>
    )

}

export default Musicians