import { Text, View } from 'react-native'
import TopContainer from '../../../components/TopContainer'

const Notification = () => {

    return (
        <View style={{ flex: 1 }}>
            <TopContainer backEnabled={false} editEnabled={false} style={{ paddingTop: 40 }}>
                <View style={{ width: '100%' }}>
                    <Text style={{ fontSize: 34, fontFamily: 'BebasNeue', textAlign: 'left' }}>
                        Notificaciones
                    </Text>
                </View>
            </TopContainer>
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', fontFamily: 'Oswald_300' }}>
                    Esta funcionalidad no está aún disponible.
                    {'\n'}Estamos trabajando para incluirla próximamente en la aplicación.
                </Text>
            </View>
        </View>
    )
}

export default Notification