import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createStackNavigator } from '@react-navigation/stack';
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AuthProvider from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AppNav from './screens/AppNav';

const Stack = createStackNavigator();

export default function App() {

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#FFFFFF");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right', 'bottom']} >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <ToastProvider>
                <AuthProvider>
                  <AppNav />
                </AuthProvider>
              </ToastProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

