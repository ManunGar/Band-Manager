import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import profileDefaultImage from '../assets/milestones/profile_default.png';
import * as GlobalStyle from '../GlobalStyle';
import AdminIcon from './icons/AdminIcon';
import BackIcon from './icons/BackIcons';

const Component = ({ component, seeAttendance=false, seeInstrument=true }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Component')}>
            <View style={styles.container}>
                <Image source={component.musician.user.profile_picture ? { uri: component.musician.user.profile_picture } : profileDefaultImage} style={{ width: 60, height: 60, borderRadius: 30 }} />
                { !seeAttendance && component.administrator && <AdminIcon style={{ position: 'absolute', top: 40, left: 40 }} />}
                <View>
                    <Text style={styles.name}>{component.musician.user.full_name}</Text>
                    {component.instruments[0] && seeInstrument ?
                        <View style={styles.instrument}>
                            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${component.instruments[0]?.image}` }} style={{ width: 18, height: 18, marginTop: 4 }} />
                            <Text style={styles.instrumentText}>{component.instruments[0]?.name}</Text>
                        </View> :
                        <Text style={styles.instrumentText}>Sin instrumento asignado</Text>
                    }
                </View>
                <BackIcon fill={GlobalStyle.darkGray} style={{ marginLeft: 'auto', transform: [{ rotate: '180deg' }] }} />
            </View>
        </TouchableOpacity>
    );
}

export default Component;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    name: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.black,
        marginBottom: -5
    },
    instrument: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    instrumentText: {
        fontFamily: 'Oswald_300',
        fontSize: 18,
        color: GlobalStyle.darkGray,
    }
})
