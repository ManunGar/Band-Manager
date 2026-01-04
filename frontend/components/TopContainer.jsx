import { useNavigation } from '@react-navigation/native'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import bandDefaultPicture from '../assets/milestones/band_default.png'
import * as GlobalStyle from '../GlobalStyle'
import BackIcon from './icons/BackIcons'
import ConfigurationIcon from './icons/ConfigurationIcon'
import CreateIcon from './icons/CreateIcon'
import EditIcon from './icons/EditIcon'
import SaveIcon from './icons/SaveIcon'

const {width: SCREENW} = Dimensions.get('window');

const TopContainer = ({ children, style, 
            title, 
            editEnabled = true, 
            backEnabled = true, 
            createEnabled = false,
            configEnabled = false, 
            saveEnabled = false,
            pictureEnabled = false,
            onEdit, onSave, onCreate, pictureUrl }) => {
    const navigation = useNavigation();
    
    return (
        <View style={[styles.topContainer, style]}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => { if (backEnabled) navigation.goBack() }} hitSlop={10}>
                    {backEnabled && <BackIcon />}
                </TouchableOpacity>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', alignContent: 'center' }}>
                    {configEnabled && <ConfigurationIcon />}
                    {editEnabled && <EditIcon onPress={onEdit}/>}
                    {createEnabled && <CreateIcon onCreate={onCreate}/>}
                    {saveEnabled && <SaveIcon onSave={onSave} />}
                    {pictureEnabled && <Image source={pictureUrl ? { uri: pictureUrl } : bandDefaultPicture} style={{ width: 50, height: 50, borderRadius: 50 }} />}
                </View>
            </View>
            {children}
        </View>
    )
}

export default TopContainer

const styles = StyleSheet.create({
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
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    title: {
        position: 'absolute',
        width: SCREENW,
        left: SCREENW / 2,
        transform: [{ translateX: -((SCREENW) / 2) }],
        fontFamily: 'Oswald_500',
        fontSize: 20,
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
        textAlign: 'center',
        zIndex: -1,
    }
})