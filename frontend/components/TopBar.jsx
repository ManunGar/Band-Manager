import { StyleSheet, View } from 'react-native';
import BackIcon from './icons/BackIcons';
import ConfigurationIcon from './icons/ConfigurationIcon';
import EditIcon from './icons/EditIcon';

const TopBar = ({ editEnabled = true, backEnabled = true, configEnabled = false }) => {
    return (
        <View style={styles.container}>
            <View>
                {backEnabled && <BackIcon />}
            </View>
            <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', alignContent: 'center' }}>
                {configEnabled && <ConfigurationIcon />}
                {editEnabled && <EditIcon />}
            </View>
        </View>
    )
}

export default TopBar

const styles = StyleSheet.create({
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