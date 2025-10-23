import { useContext } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import TopBar from '../../../components/TopBar'
import { AuthContext } from '../../../contexts/AuthContext'
import * as GlobalStyle from '../../../GlobalStyle'

const AccountDetailScreen = () => {

    const {logout} = useContext(AuthContext)

    return (
        <ScrollView style={styles.container}>
            <TopBar />
            <View style={styles.topContainer}>
                
            </View>
            <View>

            </View>
        </ScrollView>
    )
}

export default AccountDetailScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        backgroundColor: GlobalStyle.lightBackground
    },
    topContainer: {
        paddingTop: 70,
        backgroundColor: GlobalStyle.white,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 20,
        paddingBottom: 30,
    }
})