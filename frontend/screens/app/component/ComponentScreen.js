import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import ComponentEndpoints from '../../../api/ComponentEndpoints';
import profileDefaultImage from '../../../assets/milestones/profile_default.png';
import ComponentAttendance from '../../../components/ComponentAttendance';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import * as GlobalStyle from '../../../GlobalStyle';

const { width: SCREENW } = Dimensions.get('window')
const ComponentScreen = ({ route }) => {
    const [component, setComponent] = useState(null);
    const { setIsBandAdministrator, isBandAdministrator, user } = useContext(AuthContext);
    const { showToast } = useToast();
    const componentId = route.params.component.id;
    const band = route.params.band;
    const navigation = useNavigation();

    // Refresh component details when the screen is focused
    useFocusEffect(
        useCallback(() => {
            const isAdmin = band?.components?.some(component => component.musicianId === user?.musician?.id && component.administrator) ?? false;
            setIsBandAdministrator(isAdmin);
            fetchComponentDetails();
        }, [componentId])
    )

    const fetchComponentDetails = async () => {
        try {
            const detailedComponent = await ComponentEndpoints.getComponentDetails(componentId);
            setComponent(detailedComponent);
        } catch (error) {
            console.error("Error fetching component details:", error);
        }
    };

    const promoteComponent = async () => {
        try {
            await ComponentEndpoints.promoteComponent(componentId);
            showToast(
                component?.administrator ? 'Administrador eliminado' : 'Administrador asignado',
                component?.administrator
                    ? 'El componente ya no es administrador.'
                    : 'El componente ha sido asignado como administrador.',
                'success'
            );
            navigation.goBack();
        } catch (error) {
            console.error("Error promoting component:", error);
            showToast('Error', 'No se pudo actualizar el rol del componente.', 'error');
        }
    };

    const leaveComponent = async () => {
        try {
            await ComponentEndpoints.leaveComponent(componentId);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MyBands' }],
            });
        } catch (error) {
            console.error("Error leaving component:", error);
            showToast('Error', 'No se pudo salir del equipo.', 'error');
        }
    };

    const deleteComponent = async () => {
        try {
            await ComponentEndpoints.leaveComponent(componentId);
            showToast('Componente eliminado', 'El componente ha sido eliminado del equipo.', 'success');
            navigation.goBack();
        } catch (error) {
            console.error("Error deleting component:", error);
            showToast('Error', 'No se pudo eliminar el componente.', 'error');
        }
    };


    return (
        <View style={{ flex: 1 }}>
            <TopContainer
                title={'Componente'}
                editEnabled={false}
                pictureEnabled={true}
                pictureUrl={band?.profile_picture}>
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
                                        <Text style={[styles.instrumentText, { borderBottomColor: GlobalStyle.yellow, borderBottomWidth: instrument.ComponentInstruments.principal ? 2 : 0 }]}>{instrument?.name}</Text>
                                    </View>
                                ))}
                            </View> :
                            <Text style={styles.instrumentText}>Sin instrumento asignado</Text>
                        }
                        {(isBandAdministrator || user?.musician?.id === component?.musicianId) && (
                            <LinkText style={{ marginTop: 10 }} onPress={() => navigation.navigate('EditComponent', { band, component })}>Editar instrumentos</LinkText>
                        )}
                    </View>
                </View>
            </TopContainer>
            <ScrollView style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>Asistencia a eventos</Text>
                    {/* <FilterIcon width={22} height={21} /> */}
                </View>
                <FlatList
                    data={component?.eventsAttended}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ComponentAttendance eventAttendance={item} />}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.noContentText}>No hay registros de asistencia</Text>}
                    ItemSeparatorComponent={<View style={{ height: 10 }}></View>}
                />
                <View style={{ marginTop: 30, gap: 15, paddingBottom: 60 }}>
                    {isBandAdministrator && (<LinkText onPress={promoteComponent}>
                        {component?.administrator ? 'Designar como no administrador/a' : 'Asignar como administrador/a'}
                    </LinkText>)}
                    {user?.musician?.id !== component?.musicianId && isBandAdministrator && (<LinkText style={{ color: GlobalStyle.red }}
                        onPress={deleteComponent}>
                        Eliminar componente
                    </LinkText>)}
                    {user?.musician?.id === component?.musicianId && (
                        <LinkText style={{ color: GlobalStyle.red }} onPress={leaveComponent}>
                            Salir del equipo
                        </LinkText>)}
                </View>
            </ScrollView>
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
        fontSize: 16,
        color: GlobalStyle.darkGray,
    },
    container: {
        paddingInline: 25,
        marginTop: 5,
    },
    sectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 17,
        color: GlobalStyle.black,
    },
    noContentText: {
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textAlign: 'center',
        marginTop: 10,
    }
})