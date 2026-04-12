import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { AgreementSearchProvider } from '../../../contexts/AgreementSearchContext';
import AgreementDetailScreen from './AgreementDetailScreen';
import AgreementsScreen from './AgreementsScreen';
import CreateAgreementScreen from './CreateAgreementScreen';
import HireMusicianScreen from './HireMusicianScreen';
import MusicianProfileScreen from './MusicianProfileScreen';

const Stack = createStackNavigator();

const Agreement = () => {

    return (
        <View style={{ flex: 1 }}>
            <AgreementSearchProvider>
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right' }}>
                    <Stack.Screen name="AgreementScreen" component={AgreementsScreen} />
                    <Stack.Screen name="AgreementDetail" component={AgreementDetailScreen} />
                    <Stack.Screen name="MusicianProfile" component={MusicianProfileScreen} />
                    <Stack.Screen name="HireMusician" component={HireMusicianScreen} />
                    <Stack.Screen name="CreateAgreement" component={CreateAgreementScreen} />
                </Stack.Navigator>
            </AgreementSearchProvider>
        </View>
    )
}

export default Agreement