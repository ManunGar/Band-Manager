import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import AccountDetailScreen from './AccountDetailScreen';

const Stack = createStackNavigator();

const Account = () => {

    const {logout} = useContext(AuthContext)

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
        </Stack.Navigator>
    )
}

export default Account