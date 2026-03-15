import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import AccountDetailScreen from './AccountDetailScreen';
import AccountEditScreen from './AccountEditScreen';
import ConfigurationScreen from './ConfigurationScreen';
import AccountFormScreen from './form/AccountFormScreen';
import PasswordFormScreen from './form/PasswordFormScreen';
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
            <Stack.Screen name="AccountForm" component={AccountFormScreen} />
            <Stack.Screen name='Configuration' component={ConfigurationScreen} />
            <Stack.Screen name='PasswordForm' component={PasswordFormScreen} />
        </Stack.Navigator>
    )
}

export default Account