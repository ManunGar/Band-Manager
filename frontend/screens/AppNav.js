import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import AuthStack from './auth/AuthStack'

const AppNav = () => {

    const [fontsLoaded] = useFonts({
        BebasNeue_400Regular,
    });


    return (
        <NavigationContainer>
            <AuthStack />
        </NavigationContainer>
    )
}

export default AppNav