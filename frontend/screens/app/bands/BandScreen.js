import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import BandEndpoints from '../../../api/BandEndpoints'
import TopContainer from '../../../components/TopContainer'
import * as GlobalStyle from '../../../GlobalStyle'

const BandScreen = ({ route }) => {
    const [band, setBand] = useState(null)
    const { bandId } = route.params

    useEffect(() => {
        fetchBandDetails();
    }, [])

    const fetchBandDetails = async () => {
        try {
            const data = await BandEndpoints.getBandDetails(bandId)
            console.log(data)
            setBand(data?.band)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchBandDetails();
    }, [])

    return (
        <View>
            <TopContainer
                editEnabled={true} // TODO: Verify admin permissions
                createEnabled={true}
                style={{paddingTop: 5}}>
                <Image source={{ uri: band?.profile_picture }} style={{ width: 70, height: 70 }} />
                <Text style={{ fontSize: 26, fontFamily: 'BebasNeue', marginTop: 5 }}>
                    {band?.name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Oswald_500', color: GlobalStyle.yellow, textTransform: 'uppercase', textAlign: 'center' }}>
                    {band?.type}
                </Text>
            </TopContainer>
            {/* BAND HOME */}
            <View>

            </View>
        </View>
    )
}

export default BandScreen