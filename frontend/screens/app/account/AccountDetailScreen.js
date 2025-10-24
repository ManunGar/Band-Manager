import { useContext, useEffect, useState } from 'react'
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import MusicianEndpoints from '../../../api/MusicianEndpoints'
import LocationIcon from '../../../components/icons/LocationIcon'
import PhoneIcon from '../../../components/icons/PhoneIcon'
import StarIcon from '../../../components/icons/StarIcon'
import TopBar from '../../../components/TopBar'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const { width: SCREENW } = Dimensions.get('window')

const AccountDetailScreen = () => {
    const [musician, setMusician] = useState(null)
    const { logout } = useContext(AuthContext)

    useEffect(() => {
        fetchAccountDetails()
    }, [])

    const fetchAccountDetails = async () => {
        try {
            const data = await MusicianEndpoints.accountDetails()
            setMusician(data?.musician)
        } catch (error) {
            console.error(error)
            logout()
        }
    }

    return (
        <ScrollView style={styles.container}>
            <TopBar />
            <View style={styles.topContainer}>
                <Image
                    source={{ uri: musician?.profilePicture }}
                    style={styles.profilePicture}
                />
                <Pressable><Text style={styles.changePictureButton}>Cambiar Imagen</Text></Pressable>
                <View style={{ width: SCREENW - 60, marginTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.profileName}>{musician?.full_name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <StarIcon />
                            <Text style={styles.infoText}>{musician?.rating || "__.___"}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, }}>
                            <LocationIcon />
                            <Text style={styles.infoText}>{musician?.location || "Desconocida"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, }}>
                            <PhoneIcon />
                            <Text style={styles.infoText}>{musician?.phone || "Desconocida"}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <View>
                    <Text style={styles.subTitle}>Bandas:</Text>
                    <FlatList 
                        style={{ marginTop: 10, gap: 15 }}
                        data={musician?.musician.components || []}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item?.band.profile_picture }}
                                style={styles.bandPicture}
                            />
                        )}
                    />

                </View>

            </View>
        </ScrollView>
    )
}

export default AccountDetailScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    topContainer: {
        paddingTop: 70,
        backgroundColor: GlobalStyle.white,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 20,
        paddingBottom: 30,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    profilePicture: {
        width: 160,
        height: 160,
        borderRadius: 10,
        backgroundColor: GlobalStyle.lightBackground,
    },
    changePictureButton: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.yellow,
        marginTop: 10,
    },
    profileName: {
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.black
    },
    infoText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.gray
    },
    bottomContainer: {
        paddingBottom: 30,
        paddingHorizontal: 30,
    },
    subTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    bandPicture: {
        width: 80,
        height: 80,
        borderRadius: 999,
        backgroundColor: GlobalStyle.white,
    },
})