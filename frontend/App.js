import { createStackNavigator } from '@react-navigation/stack';
import { initialWindowMetrics, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AuthProvider from './contexts/AuthContext';
import AppNav from './screens/AppNav';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
          <AuthProvider>
            <AppNav />
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

