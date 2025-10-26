import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AuthProvider from './contexts/AuthContext';
import AppNav from './screens/AppNav';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <AuthProvider>
                <AppNav />
              </AuthProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

