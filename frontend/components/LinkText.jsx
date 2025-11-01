import { Pressable, StyleSheet, Text } from 'react-native'
import * as GlobalStyle from '../GlobalStyle'

const LinkText = ({children, style, onPress}) => {
  return (
    <Pressable onPress={onPress}><Text style={[styles.linkText, style]}>{children}</Text></Pressable>
  )
}

export default LinkText

const styles = StyleSheet.create({
    linkText: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.yellow,
    },
})