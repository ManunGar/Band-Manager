import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { Oswald_300Light, Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import AppStack from './app/AppStack'
import AuthStack from './auth/AuthStack'
import LoadingScreen from './auth/LoadingScreen'

const AppNav = () => {

    const {user, getToken, isLoading} = useContext(AuthContext)
    const [isReady, setIsReady] = useState(false);
    
    const [fontsLoaded] = useFonts({
        'BebasNeue': BebasNeue_400Regular,
        'Oswald_400': Oswald_400Regular,
        'Oswald_600': Oswald_600SemiBold,
        'Oswald_500': Oswald_500Medium,
        'Oswald_300': Oswald_300Light,
        'Oswald_700': Oswald_700Bold,
    });
    
    const init = async () => {
        await getToken();
        console.log("🚀 ~ AppNav ~ user:", user)
        setTimeout(() => {
            setIsReady(true);
        }, 2000);
    }

    useEffect(() => {
        init();
    }, []);

    if (!fontsLoaded || !isReady) {
        return <LoadingScreen />;
    }


    return (
        <NavigationContainer>
           { !user ? <AuthStack /> : <AppStack /> }
        </NavigationContainer>
    )
}

export default AppNav