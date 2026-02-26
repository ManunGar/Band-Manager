import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import * as GlobalStyle from '../GlobalStyle';

const Button = ({ onPress, children, disabled }) => {
    return (
        <Pressable style={[styles.button, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
            {!disabled && <Text style={styles.buttonText}>{children}</Text>}
            {disabled && <ActivityIndicator style={{ marginBlock: 5 }} color={GlobalStyle.blue} animating={disabled} />}
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
    },
})