import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import EventEndpoints from '../../../../api/EventEndpoints'
import ConfirmIcon from '../../../../components/icons/ConfirmIcon'
import DeniedIcon from '../../../../components/icons/DeniedIcon'
import NoConfirmIcon from '../../../../components/icons/NoConfirmIcon'
import TopContainer from '../../../../components/TopContainer'
import * as GlobalStyle from '../../../../GlobalStyle'

const TakeAttendanceScreen = ({ route }) => {
    const { event } = route.params
    const [attendance, setAttendance] = useState([])

    useFocusEffect(
        useCallback(() => {
            fetchAttendance();
        }, [event])
    )

    const fetchAttendance = async () => {
        try {
            const attendanceData = await EventEndpoints.getEventAttendance(event?.id);
            setAttendance(attendanceData.componentsAttendance);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            Alert.alert("Error", "No se pudo cargar la asistencia del evento. Por favor, inténtalo de nuevo más tarde.");
        }

    }

    // Calcular totales
    const calculateTotals = () => {
        const totalConfirmed = attendance.reduce((total, item) => item.present === true ? total + 1 : total, 0);
        const totalDenied = attendance.reduce((total, item) => item.present === false ? total + 1 : total, 0);
        const totalNotConfirmed = attendance.reduce((total, item) => item.present === null ? total + 1 : total, 0);
        const totalComponents = totalConfirmed + totalDenied + totalNotConfirmed;

        const confirmedPercentage = totalComponents > 0 ? (totalConfirmed / totalComponents) * 100 : 0;
        const deniedPercentage = totalComponents > 0 ? (totalDenied / totalComponents) * 100 : 0;

        return { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage };
    }

    const { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage } = calculateTotals();


    return (
        <View style={{ flex: 1 }}>
            <TopContainer
                editEnabled={false}
                saveEnabled={true}
                title={"Pasar Lista"}
                style={{ alignItems: 'left', marginBottom: 0 }}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{event?.Performance?.name || "Ensayo"}</Text>
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
                    data={Object.values(attendance)}
                    keyExtractor={(item, index) => item.instrument?.id?.toString() || index.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => <Text>No hay datos de asistencia disponibles.</Text>}
                    renderItem={({ item }) => (
                        <AttendanceComponent attendance={item} />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 20 }}></View>}
                />
            </View>
        </View>
    )
}

const AttendanceComponent = ({ attendance }) => {
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
                        attendance.present === false ? <DeniedIcon width={25} height={25} fillStroke={GlobalStyle.lightBackground} stroke={GlobalStyle.lightBackground} fill={GlobalStyle.darkRed} /> :
                            <NoConfirmIcon width={25} height={25} fillStroke={GlobalStyle.lightBackground} stroke={GlobalStyle.lightBackground} fill={GlobalStyle.gray} />}
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
    }
})