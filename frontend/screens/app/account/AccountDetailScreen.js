import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import MusicianEndpoints from '../../../api/MusicianEndpoints'
import LocationIcon from '../../../components/icons/LocationIcon'
import PhoneIcon from '../../../components/icons/PhoneIcon'
import StarIcon from '../../../components/icons/StarIcon'
import InstrumentLevel from '../../../components/InstrumentLevel'
import LinkText from '../../../components/LinkText'
import ProfilePhotoSheet from '../../../components/ProfilePhotoSheet'
import TopBar from '../../../components/TopBar'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const { width: SCREENW } = Dimensions.get('window')

const AccountDetailScreen = () => {
    const [musician, setMusician] = useState(null)
    const { logout } = useContext(AuthContext)
    const sheetRef = useRef(null)

    useEffect(() => {
        fetchAccountDetails()
    }, [])

    // Close the bottom sheet when the screen is unfocused
    useFocusEffect(
        useCallback(() => {
            return () => {
                sheetRef.current?.dismiss();
            };
        }, [])
    );


    const fetchAccountDetails = async () => {
        try {
            const data = await MusicianEndpoints.accountDetails()
            setMusician(data?.musician)
        } catch (error) {
            console.error(error)
            logout()
        }
    }

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    return (
        <ScrollView style={styles.container}>
            {/* Top bar component */}
            <TopBar backEnabled={false} configEnabled />
            {/* Profile picture section */}
            <View style={styles.topContainer}>
                <Image
                    source={{ uri: musician?.profile_picture }}
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
            </View>
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
                                source={{ uri: item?.band.profile_picture }}
                                style={styles.bandPicture}
                            />
                        )}
                    />
                </View>
                <View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, marginBottom: 10 }}>
                        <Text style={styles.subTitle}>Instrumentos:</Text>
                        <LinkText>Agregar Instrumento</LinkText>
                    </View>
                    {(musician?.musician.instruments || []).map((instrument, i) => (
                        <>
                            <InstrumentLevel
                                key={instrument.id}
                                instrument={instrument}
                            />
                            <View key={instrument.id + instrument.id} style={{ 
                                marginVertical: 10 }}>
                            </View>
                        </>
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
    topContainer: {
        paddingTop: 75,
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