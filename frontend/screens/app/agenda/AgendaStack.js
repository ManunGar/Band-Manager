import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { EventFormProvider } from '../../../contexts/EventFormContext';
import AttendanceScreen from '../events/attendance/AttendanceScreen';
import EventScreen from '../events/EventScreen';
import EventFormScreen from '../events/form/EventFormScreen';
import EventInstruments from '../events/form/EventInstrumens';
import AgendaScreen from './AgendaScreen';

const Stack = createStackNavigator();

const Agenda = () => {

    const {logout} = useContext(AuthContext)

    return (
        <EventFormProvider>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}>
                {/* EVENT */}
                <Stack.Screen name="Index" component={AgendaScreen} />
                <Stack.Screen name="Event" component={EventScreen} />
                <Stack.Screen name="EventForm" component={EventFormScreen} />
                <Stack.Screen name="EventInstruments" component={EventInstruments} />
                <Stack.Screen name="Attendance" component={AttendanceScreen} />
            </Stack.Navigator>
        </EventFormProvider>
    )
}

export default Agenda;