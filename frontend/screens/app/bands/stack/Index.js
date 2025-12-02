import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import BandEndpoints from '../../../../api/BandEndpoints';
import Component from '../../../../components/Component';
import LinkText from '../../../../components/LinkText';
import * as GlobalStyle from '../../../../GlobalStyle';

export default function Index({ route }) {
    const [band, setBand] = useState(null);
    const bandId = route?.params?.bandId;

    useEffect(() => {
        fetchBandData();
    }, [bandId]);

    const fetchBandData = async () => {
        const fetchedData = await BandEndpoints.getBandDetails(bandId);
        setBand(fetchedData.band);
    }

    return (
        <View style={{ paddingInline: 25, gap: 20 }}>
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Próximos eventos</Text>
                    <LinkText>Crear evento</LinkText>
                </View>
            </View>
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Miembros ({band?.components.length})</Text>
                    <LinkText>Añadir miembro</LinkText>
                </View>
                <FlatList 
                    data={band?.components || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Component component={item} />
                    )}
                    ItemSeparatorComponent={(<View style={{ height: 10 }}></View>)}
                    ListEmptyComponent={() => {
                        return  <Text>No hay miembros</Text>
                    }}
                />

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    }
})
