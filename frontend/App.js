import { createStackNavigator } from '@react-navigation/stack';
import AppNav from './screens/AppNav';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <AppNav />
    </>
  );
}

