import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import EventEndpoints from '../../../../api/EventEndpoints'
import profileDefault from '../../../../assets/milestones/profile_default.png'
import ConfirmIcon from '../../../../components/icons/ConfirmIcon'
import DeniedIcon from '../../../../components/icons/DeniedIcon'
import NoConfirmIcon from '../../../../components/icons/NoConfirmIcon'
import TopContainer from '../../../../components/TopContainer'
import * as GlobalStyle from '../../../../GlobalStyle'

const TakeAttendanceScreen = ({ route }) => {
    const { event } = route.params
    const [attendance, setAttendance] = useState([])
    const [contractedMusicians, setContractedMusicians] = useState([])
    const [updatedAttendance, setUpdatedAttendance] = useState({})
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            fetchAttendance();
        }, [event])
    )

    const fetchAttendance = async () => {
        try {
            const attendanceData = await EventEndpoints.getEventAttendance(event?.id);
            setAttendance(attendanceData.componentsAttendance);
            setContractedMusicians(attendanceData.contractedMusicians || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            Alert.alert("Error", "No se pudo cargar la asistencia del evento. Por favor, inténtalo de nuevo más tarde.");
        }
    }

    const handleSave = async () => {
        try {
            const componentsPresent = [];
            const componentsAbsent = [];
            const componentsAlleged = [];
            const componentsNotConfirmed = [];

            // Process changes in updatedAttendance
            attendance.forEach(item => {
                const componentId = item.component.id;
                const updated = updatedAttendance[componentId];
                
                // If there is an update, use the updated value; If not, use the original
                const present = updated !== undefined ? updated.present : item.present;
                const alleged = updated !== undefined ? updated.alleged : item.alleged;

                if (present === true) {
                    componentsPresent.push(componentId);
                } else if (present === false) {
                    if (alleged) {
                        componentsAlleged.push(componentId);
                    } else {
                        componentsAbsent.push(componentId);
                    }
                } else if (present === null) {
                    componentsNotConfirmed.push(componentId);
                }
            });

            const body = {
                componentsPresent,
                componentsAbsent,
                componentsAlleged,
                componentsNotConfirmed,
            };

            await EventEndpoints.takeAttendance(event?.id, body);
            // Clean local changes after successful save
            setUpdatedAttendance({});
            navigation.goBack();
        } catch (error) {
            console.error("Error saving attendance:", error);
            Alert.alert("Error", "No se pudo guardar la asistencia. Por favor, inténtalo de nuevo.");
        }
    }



    // Calcular totales
    const calculateTotals = () => {
        const totalConfirmed = attendance.reduce((total, item) => {
            const componentId = item.component.id;
            const updated = updatedAttendance[componentId];
            const present = updated !== undefined ? updated.present : item.present;
            return present === true ? total + 1 : total;
        }, 0);
        const totalDenied = attendance.reduce((total, item) => {
            const componentId = item.component.id;
            const updated = updatedAttendance[componentId];
            const present = updated !== undefined ? updated.present : item.present;
            return present === false ? total + 1 : total;
        }, 0);
        const totalNotConfirmed = attendance.reduce((total, item) => {
            const componentId = item.component.id;
            const updated = updatedAttendance[componentId];
            const present = updated !== undefined ? updated.present : item.present;
            return present === null ? total + 1 : total;
        }, 0);
        const totalComponents = totalConfirmed + totalDenied + totalNotConfirmed;

        const confirmedPercentage = totalComponents > 0 ? (totalConfirmed / totalComponents) * 100 : 0;
        const deniedPercentage = totalComponents > 0 ? (totalDenied / totalComponents) * 100 : 0;

        return { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage };
    }

    const handleAttendanceChange = (componentId, currentPresent, currentAlleged) => {
        return (action) => {
            setUpdatedAttendance(prev => {
                const existing = prev[componentId] || { present: currentPresent, alleged: currentAlleged };
                
                if (action === 'yes') {
                    if (existing.present === true) {
                        // If it is already true, unmark it
                        return { ...prev, [componentId]: { present: null, alleged: null } };
                    }
                    return { ...prev, [componentId]: { present: true, alleged: null } };
                } else if (action === 'no') {
                    // If it is already false, mark as justified
                    if (existing.present === false) {
                        if (existing.alleged) {
                            // If it is already alleged, unmark it
                            return { ...prev, [componentId]: { present: null, alleged: null } };
                        }
                        if (!existing.alleged) {
                            return { ...prev, [componentId]: { present: false, alleged: true } };
                        }
                    }
                    // If not, simply mark as absent
                    return { ...prev, [componentId]: { present: false, alleged: null } };
                }
                return prev;
            });
        };
    };

    const { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage } = calculateTotals();


    return (
        <View style={{ flex: 1 }}>
            <TopContainer
                editEnabled={false}
                saveEnabled={true}
                onSave={handleSave}
                title={"Pasar Lista"}
                style={{ alignItems: 'left', marginBottom: 0 }}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{event?.name}</Text>
                    <Text style={styles.subTitle}>{event?.band.name}</Text>
                </View>
            </TopContainer>
            <View style={styles.bodyContainer}>
                <FlatList
                    ListHeaderComponent={() =>
                        <View style={styles.barContainer}>
                            <View style={styles.barLabelsContainer}>
                                <Text style={styles.confirmedLabel}>{totalConfirmed}</Text>
                                <Text style={styles.deniedLabel}>{totalDenied}</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.confirmedBar, { width: `${confirmedPercentage}%` }]} />
                                <View style={[styles.deniedBar, { width: `${deniedPercentage}%` }]} />
                            </View>
                        </View>}
                    ListFooterComponent={() => (
                        contractedMusicians.length > 0 ? (
                            <View style={{ marginTop: 26 }}>
                                <Text style={styles.contractedSectionTitle}>Musicos Contratados</Text>
                                <FlatList
                                    data={contractedMusicians}
                                    keyExtractor={(item, index) => item.musicianId?.toString() || index.toString()}
                                    renderItem={({ item }) => (
                                        <ContractedMusicianItem contracted={item} />
                                    )}
                                    scrollEnabled={false}
                                    ItemSeparatorComponent={() => <View style={{ height: 14 }}></View>}
                                />
                            </View>
                        ) : null
                    )}
                    data={Object.values(attendance)}
                    keyExtractor={(item, index) => item.instrument?.id?.toString() || index.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => <Text>No hay datos de asistencia disponibles.</Text>}
                    renderItem={({ item }) => (
                        <AttendanceComponent 
                            attendance={item} 
                            updatedAttendance={updatedAttendance[item.component.id]}
                            onAttendanceChange={handleAttendanceChange(item.component.id, item.present, item.alleged)}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 20 }}></View>}
                />
            </View>
        </View>
    )
}

const AttendanceComponent = ({ attendance, updatedAttendance, onAttendanceChange }) => {
    const currentPresent = updatedAttendance !== undefined ? updatedAttendance.present : attendance.present;
    const currentAlleged = updatedAttendance !== undefined ? updatedAttendance.alleged : attendance.alleged;

    return (
        <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <View style={styles.attendanceComponentContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image source={attendance.component.musician.user.profile_picture ? { uri: attendance.component.musician.user.profile_picture } : profileDefault} style={{ width: 50, height: 50, borderRadius: 25 }} />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.attendanceComponentName}>{attendance.component.musician.user.full_name}</Text>
                        <View style={styles.instrument}>
                            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${attendance.component.instruments[0]?.image}` }} style={{ width: 18, height: 18, marginTop: 4 }} />
                            <Text style={styles.instrumentText}>{attendance.component.instruments[0]?.name}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ position: 'absolute', left: 30, top: 30, borderRadius: 15 }}>
                    {attendance.present === true ? <ConfirmIcon width={25} height={25} stroke={GlobalStyle.lightBackground} fill={GlobalStyle.darkGreen} /> :
                        attendance.present === false ? <DeniedIcon width={25} height={25} fillStroke={GlobalStyle.lightBackground} stroke={GlobalStyle.lightBackground} fill={attendance.alleged ? GlobalStyle.yellow : GlobalStyle.darkRed} /> :
                            <NoConfirmIcon width={25} height={25} fillStroke={GlobalStyle.lightBackground} stroke={GlobalStyle.lightBackground} fill={GlobalStyle.gray} />}
                </View>
                <View style={styles.attendanceButtonContainer}>
                    <Pressable 
                        style={[styles.attendanceButton, currentPresent === true && styles.attendanceButtonActive]}
                        onPress={() => onAttendanceChange('yes')}
                    >
                        <Text style={[styles.attendanceButtonText, currentPresent === true && styles.attendanceButtonTextActive]}>Sí</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.attendanceButton, currentPresent === false && styles.attendanceDeniedButtonActive, currentAlleged && styles.attendanceButtonAlleged]}
                        onPress={() => onAttendanceChange('no')}
                    >
                        <Text style={[styles.attendanceButtonText, currentPresent === false && styles.attendanceButtonTextActive]}>No</Text>
                    </Pressable>
                </View>
            </View>
            {attendance.reason && attendance.reason.length > 0 &&
                <View style={styles.reasonContainer}>
                    <Text style={styles.reasonText}>{attendance.reason}</Text>
                </View>
            }
        </View>
    )
}

const ContractedMusicianItem = ({ contracted }) => {
    const user = contracted?.musician?.user;

    return (
        <View style={styles.contractedCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <Image source={user?.profile_picture ? { uri: user.profile_picture } : profileDefault} style={{ width: 46, height: 46, borderRadius: 23 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.attendanceComponentName}>{user?.full_name || 'Musico'}</Text>
                    <View style={styles.instrument}>
                        {contracted?.instrument?.image ? (
                            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${contracted.instrument.image}` }} style={{ width: 16, height: 16, marginTop: 4 }} />
                        ) : null}
                        <Text style={styles.instrumentText}>{contracted?.instrument?.name || 'Instrumento no indicado'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.contractedBadge}>
                <Text style={styles.contractedBadgeText}>Contratado/a</Text>
            </View>
        </View>
    )
}

export default TakeAttendanceScreen

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 26,
        fontFamily: 'BebasNeue',
        color: GlobalStyle.black,
    },
    subTitle: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
    },
    bodyContainer: {
        paddingHorizontal: 30,
        flex: 1,
    },
    barContainer: {
        marginTop: 10,
        marginBottom: 30,
    },
    barLabelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    confirmedLabel: {
        fontSize: 18,
        fontFamily: 'Oswald_600',
        color: GlobalStyle.darkGreen,
    },
    deniedLabel: {
        fontSize: 18,
        fontFamily: 'Oswald_600',
        color: GlobalStyle.darkRed,
    },
    progressBarBackground: {
        height: 20,
        backgroundColor: GlobalStyle.lightGray,
        borderRadius: 15,
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
    },
    confirmedBar: {
        height: '100%',
        backgroundColor: GlobalStyle.darkGreen,
        position: 'absolute',
        left: 0,
    },
    deniedBar: {
        height: '100%',
        backgroundColor: GlobalStyle.darkRed,
        position: 'absolute',
        right: 0,
    },
    attendanceHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyle.lightGray,
        paddingBottom: 5
    },
    attendanceInstrumentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    instrumentName: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textTransform: 'uppercase',
    },
    attendanceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 5,
    },
    attendanceText: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.gray,
    },
    attendanceComponentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
        width: '100%'
    },
    attendanceComponentName: {
        fontSize: 18,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.black,
    },
    instrument: {
        marginTop: -4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    instrumentText: {
        fontFamily: 'Oswald_300',
        fontSize: 18,
        color: GlobalStyle.darkGray,
    },
    reasonContainer: {
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        width: '92%',
        borderRadius: 5,
        paddingInline: 8,
        paddingBlock: 2
    },
    reasonText: {
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        fontSize: 14
    },
    attendanceButtonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    attendanceButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: GlobalStyle.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: GlobalStyle.lightGray,
    },
    attendanceButtonActive: {
        backgroundColor: GlobalStyle.darkGreen,
        borderColor: GlobalStyle.darkGreen,
    },
    attendanceDeniedButtonActive: {
        backgroundColor: GlobalStyle.darkRed,
        borderColor: GlobalStyle.darkRed,
    },
    attendanceButtonAlleged: {
        backgroundColor: GlobalStyle.yellow,
        borderColor: GlobalStyle.yellow,
    },
    attendanceButtonText: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.gray,
    },
    attendanceButtonTextActive: {
        color: GlobalStyle.white,
    },
    contractedSectionTitle: {
        fontSize: 18,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
        marginBottom: 12,
    },
    contractedCard: {
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    contractedBadge: {
        backgroundColor: '#EAF0FF',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    contractedBadgeText: {
        fontFamily: 'Oswald_500',
        fontSize: 11,
        color: '#3A5FC8',
        textTransform: 'uppercase',
    }
})