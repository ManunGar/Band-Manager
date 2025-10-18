import { StyleSheet, Text, View } from 'react-native';

const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Hello World!</Text>
        </View>
    )
}

export default LoginScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
