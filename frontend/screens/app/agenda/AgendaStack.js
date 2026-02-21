import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import EventScreen from '../events/EventScreen';
import AgendaScreen from './AgendaScreen';

const Stack = createStackNavigator();

const Agenda = () => {

    const {logout} = useContext(AuthContext)

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
        }}>
            {/* EVENT */}
            <Stack.Screen name="Agenda" component={AgendaScreen} />
            <Stack.Screen name="Event" component={EventScreen} />
        </Stack.Navigator>
    )
}

export default Agenda;