import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import AccountDetailScreen from './AccountDetailScreen';
import AccountEditScreen from './AccountEditScreen';
import InstrumentsScreen from './InstrumentsScreen';

const Stack = createStackNavigator();

const Account = () => {

    const {logout} = useContext(AuthContext)

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
        }}>
            <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
            <Stack.Screen name="Instruments" component={InstrumentsScreen} />
            <Stack.Screen name="AccountEdit" component={AccountEditScreen} />
        </Stack.Navigator>
    )
}

export default Account