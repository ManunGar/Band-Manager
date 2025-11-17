import { useContext } from 'react'
import { Image } from 'react-native'
import { AuthContext } from '../../contexts/AuthContext'
import * as GlobalStyle from '../../GlobalStyle'

const ProfileIcon = ({ width, height }) => {

    const { user } = useContext(AuthContext);

  return (
    <Image 
        source={{ uri: user?.profile_picture }} 
        style={{ width: width || 40, height: height || 40, borderRadius: (width || 40) / 2, backgroundColor: GlobalStyle.lightBackground }}
    />
  )
}

export default ProfileIcon