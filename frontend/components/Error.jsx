import { StyleSheet, Text } from "react-native";
import * as GlobalStyle from '../GlobalStyle';

function Error({ name, formik }) {
    const touched = formik.touched[name];
    const error = formik.errors[name];
    if (!touched || !error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
}

export default Error;

const styles = StyleSheet.create({
    errorText: {
        color: GlobalStyle.red,
        fontFamily: 'Oswald_500',
        fontSize: 14,
    }
})