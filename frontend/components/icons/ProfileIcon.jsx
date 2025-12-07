import { useContext } from 'react'
import { Image } from 'react-native'
import profileDefault from '../../assets/milestones/profile_default.png'
import { AuthContext } from '../../contexts/AuthContext'
import * as GlobalStyle from '../../GlobalStyle'

const ProfileIcon = ({ width, height }) => {

    const { user } = useContext(AuthContext);

  return (
    <Image 
        source={user?.profile_picture ? { uri: user.profile_picture } : profileDefault} 
        style={{ width: width || 40, height: height || 40, borderRadius: (width || 40) / 2, backgroundColor: GlobalStyle.lightBackground }}
    />
  )
}

export default ProfileIcon