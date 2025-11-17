import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import BandScreen from './BandScreen';
import BandsScreen from './BandsScreen';

const Stack = createStackNavigator();

const Bands = () => {

    const {logout} = useContext(AuthContext)

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
        }}>
            <Stack.Screen name="MyBands" component={BandsScreen} />
            <Stack.Screen name="BandDetails" component={BandScreen} />
        </Stack.Navigator>
    )
}

export default Bands;