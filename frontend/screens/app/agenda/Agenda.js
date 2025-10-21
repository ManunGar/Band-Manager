import { useContext } from 'react'
import { Pressable, Text, View } from 'react-native'
import { AuthContext } from '../../../contexts/AuthContext'

const Agenda = () => {

    const {logout} = useContext(AuthContext)

    return (
        <View>
            <Pressable onPress={logout}>
                <Text>Logout</Text>
            </Pressable>
        </View>
    )
}

export default Agenda