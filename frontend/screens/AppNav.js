import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold } from '@expo-google-fonts/oswald'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import AuthStack from './auth/AuthStack'

const AppNav = () => {

    const [fontsLoaded] = useFonts({
        'BebasNeue': BebasNeue_400Regular,
        'Oswald_400': Oswald_400Regular,
        'Oswald_600': Oswald_600SemiBold,
        'Oswald_500': Oswald_500Medium,
        'Oswald_400': Oswald_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }


    return (
        <NavigationContainer>
            <AuthStack />
        </NavigationContainer>
    )
}

export default AppNav