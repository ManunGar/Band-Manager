import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountIcon from '../../components/icons/AccountIcon';
import AgendaIcon from '../../components/icons/AgendaIcon';
import AgreementIcon from '../../components/icons/AgreementIcon';
import BandIcon from '../../components/icons/BandIcon';
import NotificationIcon from '../../components/icons/NotificationIcon';
import MyTabBar from '../../components/MyTabBar';
import Account from './account/Account';
import Agenda from './agenda/Agenda';
import Agreement from './agreements/Agreement';
import Band from './bands/Band';
import Notification from './notifications/Notification';

const Tab = createBottomTabNavigator();

const AppStack = () => {
  return (
    <Tab.Navigator tabBar={(props) => <MyTabBar {...props} />}>
        <Tab.Screen name="Agenda" component={Agenda} options={{
          tabBarIcon: ({ color, size }) => (
            <AgendaIcon width={size} height={size} fill={color} stroke={color}/>
          )
        }}/>
        <Tab.Screen name="Agreements" component={Agreement} options={{
          tabBarIcon: ({ color, size }) => (
            <AgreementIcon width={size} height={size} fill={color} stroke={color}/>
          )
        }}/>
        <Tab.Screen name="Band" component={Band} options={{
          tabBarIcon: ({color, size}) => (
            <BandIcon width={size} height={size} fill={color} stroke={color}/>
          )
        }}/>
        <Tab.Screen name="Notification" component={Notification} options={{
          tabBarIcon: ({ color, size }) => (
            <NotificationIcon width={size} height={size} fill={color} stroke={color}/>
          )
        }}/>
        <Tab.Screen name="Account" component={Account} options={{
          tabBarIcon: ({ color, size }) => (
            <AccountIcon width={size} height={size} fill={"none"} stroke={color}/>
          )
        }}/>
    </Tab.Navigator>
  )
}

export default AppStack