import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import AppStack from './app/AppStack'
import AuthStack from './auth/AuthStack'

const AppNav = () => {

    const {user, getToken} = useContext(AuthContext)

    const [fontsLoaded] = useFonts({
        'BebasNeue': BebasNeue_400Regular,
        'Oswald_400': Oswald_400Regular,
        'Oswald_600': Oswald_600SemiBold,
        'Oswald_500': Oswald_500Medium,
        'Oswald_400': Oswald_400Regular,
        'Oswald_700': Oswald_700Bold,
    });

    const init = async () => {
        await getToken();
        console.log('AppNav user:', user);
    }

    useEffect(() => {
        init();
    }, []);

    if (!fontsLoaded) {
        return null;
    }


    return (
        <NavigationContainer>
           { !user ? <AuthStack /> : <AppStack /> }
        </NavigationContainer>
    )
}

export default AppNav