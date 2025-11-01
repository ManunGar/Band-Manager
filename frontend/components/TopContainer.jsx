import { StyleSheet, View } from 'react-native'
import * as GlobalStyle from '../GlobalStyle'
import BackIcon from './icons/BackIcons'
import ConfigurationIcon from './icons/ConfigurationIcon'
import EditIcon from './icons/EditIcon'

const TopContainer = ({ children, style, editEnabled = true, backEnabled = true, configEnabled = false }) => {
    return (
        <View style={[styles.topContainer, style]}>
            <View style={styles.container}>
                <View>
                    {backEnabled && <BackIcon />}
                </View>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', alignContent: 'center' }}>
                    {configEnabled && <ConfigurationIcon />}
                    {editEnabled && <EditIcon />}
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
    }
})