import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import * as GlobalStyle from '../GlobalStyle';

const Input = ({ placeholder, label, value, onChangeText, secureTextEntry, keyboardType, onPress }) => {
    const [showPassword, setShowPassword] = useState(!secureTextEntry);

    return (
        <Pressable style={styles.inputContainer} onPress={onPress}>
            <Text style={styles.inputLabel}>
                {label}
            </Text>
            <TextInput
                onPress={onPress}
                style={styles.input}
                value={value}
                placeholder={placeholder}
                onChangeText={onChangeText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                keyboardType={keyboardType || 'default'}
                editable={onPress ? false : true}
            />
            {secureTextEntry && <Pressable style={styles.eyeContainer} onPress={() => setShowPassword(!showPassword)}>
                <Svg style={styles.eyeSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <G strokeWidth={2} fill="none" stroke={GlobalStyle.darkGray} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M3 13c3.6-8 14.4-8 18 0" />
                        <Path fill={GlobalStyle.darkGray} d="M12 17a3 3 0 1 1 0-6a3 3 0 0 1 0 6" />
                    </G>
                </Svg>
                {!showPassword && <Svg style={styles.eyeSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <Path fill={GlobalStyle.darkGray} d="M5.1 9.2C13.3-1.2 28.4-3.1 38.8 5.1l592 464c10.4 8.2 12.3 23.3 4.1 33.7s-23.3 12.3-33.7 4.1l-592-464C-1.2 34.7-3.1 19.6 5.1 9.2" />
                </Svg>}
            </Pressable>}
        </Pressable>
    )
}

export default Input

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: GlobalStyle.gray,
        borderRadius: 30,
        height: 35,
        paddingHorizontal: 17,
    },
    inputLabel: {
        color: GlobalStyle.black,
        fontFamily: 'Oswald_500',
        fontSize: 16,
        position: 'absolute',
        top: -28
    },
    input: {
        backgroundColor: 'transparent',
        fontSize: 16,
        fontFamily: 'Oswald_400',
        borderRadius: 30,
        height: 50,
        marginTop: -9,
    },
    eyeContainer: {
        position: 'absolute',
        top: 0,
        right: 10
    },
    eyeSvg: {
        position: 'absolute',
        top: 6,
        right: 5,
        width: 22,
        height: 22
    },
})