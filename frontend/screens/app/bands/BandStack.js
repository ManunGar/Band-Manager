import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { BandFormProvider } from '../../../contexts/BandFormContext';
import { EventFormProvider } from '../../../contexts/EventFormContext';
import ComponentScreen from '../component/ComponentScreen';
import EditComponentScreen from '../component/EditComponentScreen';
import AttendanceScreen from '../events/attendance/AttendanceScreen';
import TakeAttendanceScreen from '../events/attendance/TakeAttendanceScreen';
import EventScreen from '../events/EventScreen';
import EventFormScreen from '../events/form/EventFormScreen';
import EventInstruments from '../events/form/EventInstrumens';
import BandScreen from './BandScreen';
import BandsScreen from './BandsScreen';
import BandFormScreen from './form/BandFormScreen';
import BandInstruments from './form/BandInstruments';

const Stack = createStackNavigator();

const Bands = () => {

    const { logout } = useContext(AuthContext)

    return (
        <BandFormProvider>
            <EventFormProvider>
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right'
                }}>
                    <Stack.Screen name="MyBands" component={BandsScreen} />
                    <Stack.Screen name="BandDetails" component={BandScreen} />
                    <Stack.Screen name="BandForm" component={BandFormScreen} />
                    <Stack.Screen name="BandInstruments" component={BandInstruments} />
                    {/* COMPONENT */}
                    <Stack.Screen name="Component" component={ComponentScreen} />
                    <Stack.Screen name="EditComponent" component={EditComponentScreen} />
                    {/* EVENT */}
                    <Stack.Screen name="Event" component={EventScreen} />
                    <Stack.Screen name="EventForm" component={EventFormScreen} />
                    <Stack.Screen name="EventInstruments" component={EventInstruments} />
                    <Stack.Screen name="Attendance" component={AttendanceScreen} />
                    <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} />
                </Stack.Navigator>
            </EventFormProvider>
        </BandFormProvider>
    )
}

export default Bands;