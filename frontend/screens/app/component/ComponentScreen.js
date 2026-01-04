import { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import ComponentEndpoints from '../../../api/ComponentEndpoints';
import profileDefaultImage from '../../../assets/milestones/profile_default.png';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';

const { width: SCREENW } = Dimensions.get('window')
const ComponentScreen = ({ route }) => {
    const [component, setComponent] = useState(null);
    const {isBandAdministrator, user} = useContext(AuthContext);

    useEffect(() => {
        fetchComponentDetails();
    });

    const fetchComponentDetails = async () => {
        try {
            const detailedComponent = await ComponentEndpoints.getComponentDetails(route.params.component.id);
            setComponent(detailedComponent);

        } catch (error) {
            console.error("Error fetching component details:", error);
        }
    };


    return (
        <View>
            <TopContainer
                title={'Componente'}
                editEnabled={false}>
                <View style={styles.componentContainer}>
                    <Image source={component?.musician.user.profile_picture ? { uri: component.musician.user.profile_picture } : profileDefaultImage}
                        style={{ width: 80, height: 80, borderRadius: 50 }} />
                    <View>
                        <Text style={{ fontFamily: 'BebasNeue', fontSize: 26, }}>
                            {component?.musician.user.full_name}
                        </Text>
                        {component?.instruments.length > 0 ?
                            <View style={styles.instruments}>
                                {component.instruments.map((instrument, idx) => (
                                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instrument?.image}` }} style={{ width: 18, height: 18, marginTop: 4 }} />
                                        <Text style={[styles.instrumentText, {borderBottomColor: GlobalStyle.yellow, borderBottomWidth: instrument.ComponentInstruments.principal ? 2 : 0}]}>{instrument?.name}</Text>
                                    </View>
                                ))}
                            </View> :
                            <Text style={styles.instrumentText}>Sin instrumento asignado</Text>
                        }
                        {(isBandAdministrator || user?.musician?.id === component?.musicianId) && (
                            <LinkText style={{ marginTop: 10 }}>Editar instrumentos</LinkText>
                        )}
                    </View>
                </View>

            </TopContainer>
        </View>
    )
}

export default ComponentScreen

const styles = StyleSheet.create({
    componentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        gap: 16
    },
    instruments: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: SCREENW - 160,
        alignItems: 'center',
        gap: 12,
        rowGap: 4
    },
    instrumentText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.darkGray,
    }
})