import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import MusicianEndpoints from '../../../api/MusicianEndpoints'
import bandDefaultImage from '../../../assets/milestones/band_default.png'
import profileDefault from '../../../assets/milestones/profile_default.png'
import LocationIcon from '../../../components/icons/LocationIcon'
import PhoneIcon from '../../../components/icons/PhoneIcon'
import ImagePickerSheet from '../../../components/ImagePickerSheet'
import InstrumentLevel from '../../../components/InstrumentLevel'
import LinkText from '../../../components/LinkText'
import TopContainer from '../../../components/TopContainer'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'
import { assertSizeLT3MB } from '../../../helpers/ImageHelpers'

const { width: SCREENW } = Dimensions.get('window')

const AccountDetailScreen = () => {
    const [musician, setMusician] = useState(null)
    const { logout, editMusician  } = useContext(AuthContext)
    const sheetRef = useRef(null)
    const navigation = useNavigation()

    useEffect(() => {
        fetchAccountDetails()
    }, [])

    const fetchAccountDetails = async () => {
        try {
            const data = await MusicianEndpoints.accountDetails()
            setMusician(data)
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

    const handleImageSelected = async (uri) => {
        try {
            await assertSizeLT3MB(uri);
            const form = new FormData();
            form.append('profile_picture', {
                uri: uri,
                name: `avatar_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            await editMusician(form);
            await fetchAccountDetails();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const handleImageRemoved = async () => {
        try {
            const form = new FormData();
            form.append('delete_profile_picture', true);
            await editMusician(form);
            await fetchAccountDetails();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

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
                onConfiguration={() => navigation.navigate('Configuration', { musician })}
                onEdit={() => navigation.navigate('AccountEdit')}>
                <Image
                    source={musician?.profile_picture ? { uri: musician.profile_picture } : profileDefault}
                    style={styles.profilePicture}
                />
                <LinkText onPress={openSheet} style={{ marginTop: 10, }}>Cambiar Imagen</LinkText>
                <View style={{ width: SCREENW - 60, marginTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.profileName}>{musician?.full_name}</Text>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <StarIcon />
                            <Text style={styles.infoText}>{musician?.rating || "__.___"}</Text>
                        </View> */}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '60%' }}>
                            <LocationIcon />
                            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">{musician?.location || "Desconocida"}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                        ListEmptyComponent={() => (
                            <View style={{ width: SCREENW - 60, paddingInline: 20 }}>
                                <Text style={{ textAlign: 'center', fontFamily: 'Oswald_300', fontSize: 16, color: GlobalStyle.gray }}>No formas parte de ninguna banda. Sé el primer en crearla o unirte a una.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => {
                            return <Image
                                key={item.id}
                                source={item?.band.profile_picture ? { uri: item.band.profile_picture } : bandDefaultImage}
                                style={styles.bandPicture}
                            />;
                        }}
                    />
                </View>
                <View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, marginBottom: 10 }}>
                        <Text style={styles.subTitle}>Instrumentos:</Text>
                        <LinkText onPress={goToInstruments}>Editar Instrumento</LinkText>
                    </View>
                    <FlatList
                        data={musician?.musician.instruments || []}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        ListEmptyComponent={() => (
                            <View>
                                <Text style={{ textAlign: 'center', fontFamily: 'Oswald_300', fontSize: 16, color: GlobalStyle.gray }}>No tienes ningún instrumento asignado.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={{ marginBottom: 10 }}>
                                <InstrumentLevel instrument={item} />
                            </View>
                        )}
                    />
                </View>
            </View>
            {/* Image Picker component */}
            <ImagePickerSheet
                sheetRef={sheetRef}
                imagePreview={musician?.profile_picture}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
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