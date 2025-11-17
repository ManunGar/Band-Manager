import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AgendaIcon from '../../components/icons/AgendaIcon';
import AgreementIcon from '../../components/icons/AgreementIcon';
import BandIcon from '../../components/icons/BandIcon';
import NotificationIcon from '../../components/icons/NotificationIcon';
import ProfileIcon from '../../components/icons/ProfileIcon';
import MyTabBar from '../../components/MyTabBar';
import Account from './account/AccountStack';
import Agenda from './agenda/Agenda';
import Agreement from './agreements/Agreement';
import Bands from './bands/BandStack';
import Notification from './notifications/Notification';

const Tab = createBottomTabNavigator();

const AppStack = () => {
  return (
    <Tab.Navigator tabBar={(props) => {
      // name of the current route in the nested navigator
      const route = props.state.routes[props.state.index];
      let isTabBarVisible = true;

      const focusedNestedRouteName =
        getFocusedRouteNameFromRoute(route) ?? 'AccountDetail';// default screen

      const hiddenRoutes = ['Instruments', 'AccountEdit']; // screen list where tab bar is hidden

      if (hiddenRoutes.includes(focusedNestedRouteName)) {
        isTabBarVisible = false;
      }


      return <MyTabBar {...props} isTabBarVisible={isTabBarVisible} />;
    }} screenOptions={{
      headerShown: false,
    }}>
      <Tab.Screen name="Agenda" component={Agenda} options={{
        tabBarIcon: ({ color, size }) => (
          <AgendaIcon width={size} height={size} fill={color} stroke={color} />
        )
      }} />
      <Tab.Screen name="Agreements" component={Agreement} options={{
        tabBarIcon: ({ color, size }) => (
          <AgreementIcon width={size} height={size} fill={color} stroke={color} />
        )
      }} />
      <Tab.Screen name="Bands" component={Bands} options={{
        tabBarIcon: ({ color, size }) => (
          <BandIcon width={size} height={size} fill={color} stroke={color} />
        )
      }} />
      <Tab.Screen name="Notification" component={Notification} options={{
        tabBarIcon: ({ color, size }) => (
          <NotificationIcon width={size} height={size} fill={color} stroke={color} />
        )
      }} />
      <Tab.Screen name="Account" component={Account} options={{
        tabBarIcon: ({ color, size }) => (
          <ProfileIcon width={size*1.5} height={size*1.5} />
        )
      }} />
    </Tab.Navigator>
  )
}

export default AppStack