import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import AgreementsScreen from './AgreementsScreen';

const Stack = createStackNavigator();

const Agreement = () => {

    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                animation: 'slide_from_right' }}>
                <Stack.Screen name="AgreementScreen" component={AgreementsScreen} />
            </Stack.Navigator>
        </View>
    )
}

export default Agreement