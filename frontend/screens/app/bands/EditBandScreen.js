import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Image, ScrollView, View } from 'react-native';
import BandEndpoints from '../../../api/BandEndpoints';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import LinkText from '../../../components/LinkText';
import ProfilePhotoSheet from '../../../components/ProfilePhotoSheet';
import TopContainer from '../../../components/TopContainer';
import { assertSizeLT3MB } from '../../../helpers/ImageHelpers';

const EditBandScreen = ({ route }) => {
    const { band } = route.params;
    const sheetRef = useRef(null)

    // Close the bottom sheet when the screen is unfocused
    useFocusEffect(
        useCallback(() => {
            return () => {
                sheetRef.current?.dismiss();
            };
        }, [])
    );

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const uploadingProfilePicture = async (uri) => {
        console.log("🚀 ~ uploadingProfilePicture ~ uri:", uri)
        await assertSizeLT3MB(uri);
        const form = new FormData();
        form.append('profile_picture', {
            uri: uri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
        });
        await BandEndpoints.editBandProfilePicture(band.id, form);
    }

    return (
        <ScrollView>
            <TopContainer
                title={"Editar Banda"}>
                <View style={{ alignItems: 'center' }}>
                    <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 100, height: 100, borderRadius: 10 }} />
                    <LinkText onPress={openSheet}>Cambiar foto</LinkText>
                </View>
            </TopContainer>
            <ProfilePhotoSheet
                sheetRef={sheetRef}
                uploadingFunction={uploadingProfilePicture}
                deleteProfilePicture={() => BandEndpoints.deleteBandProfilePicture(band.id)}
            />
            {/* Band Information */}
            <View>

            </View>
        </ScrollView>
    )
}

export default EditBandScreen