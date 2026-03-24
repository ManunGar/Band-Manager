import { Pressable, StyleSheet, TextInput } from 'react-native';
import Svg, { Path } from "react-native-svg";
import * as GlobalStyle from '../GlobalStyle';

const InputSearch = ({ placeholder, value, onChangeText, keyboardType, onPress }) => {

    return (
        <Pressable style={styles.inputContainer} onPress={onPress}>
            <Svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <Path
                    d="M9.167 15a5.833 5.833 0 100-11.667 5.833 5.833 0 000 11.667z"
                    stroke="#8C8C8C"
                    strokeWidth={1.66667}
                />
                <Path
                    d="M16.666 16.667l-2.5-2.5"
                    stroke="#8C8C8C"
                    strokeWidth={1.66667}
                    strokeLinecap="round"
                />
            </Svg>
            <TextInput
                onPress={onPress}
                style={styles.input}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={GlobalStyle.gray}
                onChangeText={onChangeText}
                autoCapitalize="none"
                keyboardType={keyboardType || 'default'}
                editable={onPress ? false : true}
            />
        </Pressable>
    )
}

export default InputSearch

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        borderRadius: 8,
        backgroundColor: GlobalStyle.lightBackground,
        borderRadius: 30,
        height: 35,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    input: {
        backgroundColor: 'transparent',
        fontSize: 16,
        fontFamily: 'Oswald_400',
        borderRadius: 30,
        height: 50,
        marginTop: -1,
        color: GlobalStyle.black,
        flex: 1,
    },
})