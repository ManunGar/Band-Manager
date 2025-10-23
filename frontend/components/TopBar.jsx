import { StyleSheet, View } from 'react-native';
import BackIcon from './icons/BackIcons';
import EditIcon from './icons/EditIcon';

const TopBar = ({ editEnabled = true, backEnabled = true }) => {
    return (
        <View style={styles.container}>
            <View>
                {backEnabled && <BackIcon />}
            </View>
            <View>
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