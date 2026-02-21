import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import ComponentScreen from '../component/ComponentScreen';
import EditComponentScreen from '../component/EditComponentScreen';
import EventScreen from '../events/EventScreen';
import BandCreate from './BandCreate';
import BandScreen from './BandScreen';
import BandsScreen from './BandsScreen';
import EditBandScreen from './EditBandScreen';
import JoinBandScreen from './JoinBandScreen';

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
            <Stack.Screen name="CreateBand" component={BandCreate} />
            <Stack.Screen name="EditBand" component={EditBandScreen} />
            <Stack.Screen name="JoinBand" component={JoinBandScreen} />
            {/* COMPONENT */}
            <Stack.Screen name="Component" component={ComponentScreen} />
            <Stack.Screen name="EditComponent" component={EditComponentScreen} />
            {/* EVENT */}
            <Stack.Screen name="Event" component={EventScreen} />
        </Stack.Navigator>
    )
}

export default Bands;