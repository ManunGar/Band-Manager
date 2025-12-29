import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import BandEndpoints from '../../../api/BandEndpoints'
import Band from '../../../components/Band'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'

const BandsScreen = () => {
    const [bands, setBands] = useState([])
    const { user } = useContext(AuthContext)
    const navigation = useNavigation()

    useFocusEffect(
        useCallback(() => {
            // Refresh bands when returning to the screen
            fetchBands();
        }, [])
    );

    const fetchBands = async () => {
        try {
            const bands = await BandEndpoints.listMyBands();
            setBands(bands.bands);
        } catch (error) {
            console.error("Error fetching bands:", error);
        }
    }

    return (
        <View>
            <TopContainer
                backEnabled={false}
                editEnabled={false}
                createEnabled={true}
                onCreate={() => navigation.navigate('CreateBand')}
                style={{ paddingBottom: 24, paddingTop: 24, alignItems: 'none' }}>
                <Text style={styles.title}>Bandas</Text>
            </TopContainer>
            <FlatList
                data={bands}
                style={{ paddingHorizontal: 25 }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Band band={item} />
                )}
                ItemSeparatorComponent={() => <View style={{paddingTop: 12}}></View>}
                ListEmptyComponent={<Text style={styles.noBandsText}>No perteneces a ninguna banda</Text>}
            />
        </View>
    )
}

export default BandsScreen

const styles = StyleSheet.create({
    title: {
        fontSize: 40,
        fontFamily: 'BebasNeue'
    },
    noBandsText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    }
})