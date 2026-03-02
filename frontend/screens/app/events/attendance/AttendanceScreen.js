import { useEffect, useState } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native'
import EventEndpoints from '../../../../api/EventEndpoints'
import profileDefault from '../../../../assets/milestones/profile_default.png'
import ConfirmIcon from '../../../../components/icons/ConfirmIcon'
import DeniedIcon from '../../../../components/icons/DeniedIcon'
import NoConfirmIcon from '../../../../components/icons/NoConfirmIcon'
import TopContainer from '../../../../components/TopContainer'
import * as GlobalStyle from '../../../../GlobalStyle'

const AttendanceScreen = ({ route }) => {
    const { event } = route.params
    const [attendance, setAttendance] = useState({})

    useEffect(() => {
        if (event) {
            fetchAttendance()
        }
    }, [event])

    const fetchAttendance = async () => {
        try {
            const attendanceData = await EventEndpoints.getEventAttendance(event.id);
            setAttendance(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            Alert.alert("Error", "No se pudo cargar la asistencia del evento. Por favor, inténtalo de nuevo más tarde.");
        }

    }

    return (
        <View>
            <TopContainer
                title="Asistencia"
                editEnabled={true}
                style={{ alignItems: 'left', marginBottom: 10 }}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{event?.Performance?.name || "Ensayo"}</Text>
                    <Text style={styles.subTitle}>{event?.band.name}</Text>
                </View>
            </TopContainer>
            <View style={styles.bodyContainer}>
                <FlatList
                    data={Object.values(attendance)}
                    keyExtractor={(item, index) => item.instrument?.id?.toString() || index.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View>
                            <AttendanceHeader attendance={item} />
                            <FlatList
                                data={item.attendees}
                                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                                renderItem={({ item }) => (
                                    <AttendanceComponent attendance={item} />
                                )}
                                scrollEnabled={false}
                                style={{ marginTop: 10}}
                                ItemSeparatorComponent={() => <View style={{ height: 15}}></View>}
                            />
                        </View>
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 20 }}></View>}
                />
            </View>
        </View>
    )
}

const AttendanceHeader = ({ attendance }) => {
    return (
        <View style={styles.attendanceHeaderContainer}>
            <View style={styles.attendanceInstrumentContainer}>
                <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${attendance.instrument?.image}` }} style={{ width: 18, height: 18 }} />
                <Text style={styles.instrumentName}>{attendance.instrument?.name}</Text>
            </View>
            <View>
                {attendance.notConfirmedCount > 0 &&
                    <View style={styles.attendanceContainer}>
                        <NoConfirmIcon />
                        <Text style={styles.attendanceText}>{attendance.notConfirmedCount}</Text>
                    </View>
                }
                {attendance.presentCount > 0 &&
                    <View style={styles.attendanceContainer}>
                        <ConfirmIcon />
                        <Text style={styles.attendanceText}>{attendance.presentCount}</Text>
                    </View>
                }
                {attendance.absentCount > 0 &&
                    <View style={styles.attendanceContainer}>
                        <DeniedIcon />
                        <Text style={styles.attendanceText}>{attendance.absentCount}</Text>
                    </View>
                }
            </View>
        </View>
    )
}

const AttendanceComponent = ({ attendance }) => {
    return (
        <View style={styles.attendanceComponentContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={attendance.component.musician.user.profile_picture ? { uri: attendance.component.musician.user.profile_picture } : profileDefault} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <Text style={styles.attendanceComponentName}>{attendance.component.musician.user.full_name}</Text>
            </View>
            {attendance.present === true ? <ConfirmIcon width={25} height={25}/> : attendance.present === false ? <DeniedIcon width={25} height={25}/> : <NoConfirmIcon width={25} height={25}/>}
        </View>
    )
}

export default AttendanceScreen

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
        paddingRight: 10
    },
    attendanceComponentName: {
        fontSize: 18,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.black,
    }
})