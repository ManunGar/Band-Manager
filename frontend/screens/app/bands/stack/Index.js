import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BandEndpoints from '../../../../api/BandEndpoints';
import BottomSheet from '../../../../components/BottomSheet';
import Button from '../../../../components/Button';
import Component from '../../../../components/Component';
import LinkText from '../../../../components/LinkText';
import UpcomingEvent from '../../../../components/UpcomingEnvent';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as GlobalStyle from '../../../../GlobalStyle';

export default function Index({ route }) {
    const [band, setBand] = useState(null);
    const { isBandAdministrator } = useContext(AuthContext);
    const bandId = route?.params?.bandId;
    const snapPoints = useMemo(() => ['50%'], [])
    const sheetRef = useRef(null)
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            fetchBandData();
            return closeSheet;
        }, [])
    );

    const fetchBandData = async () => {
        const fetchedData = await BandEndpoints.getBandDetails(bandId);
        setBand(fetchedData);
    }

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const closeSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    return (
        <ScrollView style={{ paddingInline: 25 }}>
            {/* UPCOMING EVENT LIST */}
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Próximos eventos</Text>
                    {isBandAdministrator && <LinkText onPress={() => navigation.navigate('CreateEvent', { band: band })}>Crear evento</LinkText>}
                </View>
                <FlatList
                    data={band?.events || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <UpcomingEvent event={item} />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, minHeight: 60, paddingRight: 25 }}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    ListEmptyComponent={() => {
                        return <Text style={styles.noContentText}>No hay próximos eventos existentes</Text>
                    }}
                />
            </View>
            {/* MEMBER LIST */}
            <View style={{ marginTop: 30 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Miembros ({band?.components.length})</Text>
                    {isBandAdministrator && <LinkText onPress={openSheet}>Añadir miembro</LinkText>}
                </View>
                <FlatList
                    data={band?.components || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Component component={item} band={band} />
                    )}
                    scrollEnabled={false}
                    ItemSeparatorComponent={(<View style={{ height: 10 }}></View>)}
                    contentContainerStyle={{ gap: 10, width: '100%', minHeight: 60, paddingBottom: 40 }}
                    ListEmptyComponent={() => {
                        return <Text style={styles.noContentText}>No hay miembros existentes</Text>
                    }}
                />

            </View>
            {/* ADD MEMBER MODAL */}
            <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ paddingInline: 20 }}>
                <Text style={{ fontFamily: 'Oswald_500', color: GlobalStyle.darkGray, fontSize: 16, marginBottom: 10 }}>
                    Añade nuevos componentes a tu equipo mediante el código de invitación:
                </Text>
                <Text style={{ fontFamily: 'BebasNeue', color: GlobalStyle.black, fontSize: 24, color: GlobalStyle.black, margin: 'auto' }}>
                    {band?.code || 'Cargando...'}
                </Text>
                <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.gray, fontSize: 12, marginTop: 10 }}>
                    Comparte este código con las personas que quieras invitar a tu equipo o comparte el siguiente enlace para que puedan acceder con mayor rapidez.
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignContent: 'center', marginVertical: 15, paddingInline: 15, borderRadius: 8, backgroundColor: GlobalStyle.lightBackground }}>
                    <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.blue, fontSize: 16, marginVertical: 10, textDecorationLine: 'underline' }}>
                        {`${process.env.EXPO_PUBLIC_API_URL}/join/${band?.code}`}
                    </Text>
                    <LinkText style={{ marginBottom: 4 }}>Copiar</LinkText>
                </View>
                <Button>
                    Compartir
                </Button>
            </BottomSheet>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    },
    noContentText: {
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textAlign: 'center',
        marginTop: 10,
        width: '100%',
    }
})
