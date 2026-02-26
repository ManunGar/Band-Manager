import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { EventFormProvider } from '../../../contexts/EventFormContext';
import ComponentScreen from '../component/ComponentScreen';
import EditComponentScreen from '../component/EditComponentScreen';
import EventScreen from '../events/EventScreen';
import EventFormScreen from '../events/form/EventFormScreen';
import EventInstruments from '../events/form/EventInstrumens';
import BandCreate from './BandCreate';
import BandScreen from './BandScreen';
import BandsScreen from './BandsScreen';
import EditBandScreen from './EditBandScreen';
import JoinBandScreen from './JoinBandScreen';

const Stack = createStackNavigator();

const Bands = () => {

    const {logout} = useContext(AuthContext)

    return (
        <EventFormProvider>
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
                <Stack.Screen name="CreateEvent" component={EventFormScreen} />
                <Stack.Screen name="EventInstruments" component={EventInstruments} />
            </Stack.Navigator>
        </EventFormProvider>
    )
}

export default Bands;