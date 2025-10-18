import { NavigationContainer } from '@react-navigation/native'
import AuthStack from './auth/AuthStack'

const AppNav = () => {
  return (
    <NavigationContainer>
        <AuthStack />
    </NavigationContainer>
  )
}

export default AppNav