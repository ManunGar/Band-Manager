import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const Tag = ({ children, selected, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.tagContainer, selected && styles.selectedTag]}>{children}</Text>
        </TouchableOpacity>
    )

}

export default Tag
const styles = StyleSheet.create({
    tagContainer: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d3d3d3',
        width: 'min-content',
        paddingInline: 15,
        paddingBottom: 1,
        fontFamily: 'Oswald_500',
        fontSize: 16,
        backgroundColor: GlobalStyle.white,
        color: GlobalStyle.gray,
    },
    selectedTag: {
        color: GlobalStyle.yellow,
    }
})