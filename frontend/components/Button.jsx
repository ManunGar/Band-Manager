import { Pressable, StyleSheet, Text } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const Button = ({ onPress, children }) => {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{children}</Text>
        </Pressable>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: GlobalStyle.yellow,
        padding: 12,
        borderRadius: 40,
        alignItems: 'center',
        paddingHorizontal: 34,
        minWidth: 190
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.blue
    }
})