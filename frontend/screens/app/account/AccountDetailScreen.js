import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import MusicianEndpoints from '../../../api/MusicianEndpoints'
import bandDefaultImage from '../../../assets/milestones/band_default.png'
import profileDefault from '../../../assets/milestones/profile_default.png'
import LocationIcon from '../../../components/icons/LocationIcon'
import PhoneIcon from '../../../components/icons/PhoneIcon'
import StarIcon from '../../../components/icons/StarIcon'
import InstrumentLevel from '../../../components/InstrumentLevel'
import LinkText from '../../../components/LinkText'
import ProfilePhotoSheet from '../../../components/ProfilePhotoSheet'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const { width: SCREENW } = Dimensions.get('window')

const AccountDetailScreen = () => {
    const [musician, setMusician] = useState(null)
    const { logout } = useContext(AuthContext)
    const sheetRef = useRef(null)
    const navigation = useNavigation()

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

    // Close the bottom sheet when the screen is unfocused
    useFocusEffect(
        useCallback(() => {
            // Refresh account details when returning to the screen
            fetchAccountDetails();
            return () => {
                sheetRef.current?.dismiss();
            };
        }, [])
    );

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const goToInstruments = () => {
        navigation.navigate('Instruments', {
            userInstruments: musician?.musician.instruments || []
        })
    }

    return (
        <ScrollView style={styles.container}>
            {/* Profile picture section */}
            <TopContainer
                configEnabled
                onEdit={() => navigation.navigate('AccountEdit')}>
                <Image
                    source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                    style={styles.profilePicture}
                />
                <LinkText onPress={openSheet} style={{ marginTop: 10, }}>Cambiar Imagen</LinkText>
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
            </TopContainer>
            {/* Bands and Instruments section */}
            <View style={styles.bottomContainer}>
                <View>
                    <Text style={styles.subTitle}>Bandas:</Text>
                    <FlatList
                        style={{ marginTop: 10 }}
                        contentContainerStyle={{ gap: 15 }}
                        data={musician?.musician.components || []}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Image
                                key={item.id}
                                source={item?.band.profile_picture ? { uri: item.band.profile_picture } : bandDefaultImage}
                                style={styles.bandPicture}
                            />
                        )}
                    />
                </View>
                <View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, marginBottom: 10 }}>
                        <Text style={styles.subTitle}>Instrumentos:</Text>
                        <LinkText onPress={goToInstruments}>Editar Instrumento</LinkText>
                    </View>
                    {(musician?.musician.instruments || []).map((instrument, i) => (
                        <View key={i}>
                            <InstrumentLevel
                                instrument={instrument}
                            />
                            <View style={{
                                marginVertical: 10
                            }}>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            {/* Image Picker component */}
            <ProfilePhotoSheet
                sheetRef={sheetRef}
                onUploaded={fetchAccountDetails}
            />
        </ScrollView>
    )
}

export default AccountDetailScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    profilePicture: {
        width: 160,
        height: 160,
        borderRadius: 10,
        backgroundColor: GlobalStyle.lightBackground,
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
    header: {
        backgroundColor: GlobalStyle.white,
        shadowColor: GlobalStyle.black,
        shadowOffset: { width: -1, height: -3 },
        shadowRadius: 5,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    panelHeader: {
        alignItems: 'center',
    },
    panelHandle: {
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: GlobalStyle.darkGray,
        marginBottom: 10,
    }
})