import { createStackNavigator } from '@react-navigation/stack';
import Agenda from './agenda/Agenda';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen name="Agenda" component={Agenda} />
    </Stack.Navigator>
  )
}

export default AppStack