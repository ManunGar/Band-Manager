import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import EventEndpoints from '../../../../api/EventEndpoints'
import profileDefault from '../../../../assets/milestones/profile_default.png'
import ConfirmIcon from '../../../../components/icons/ConfirmIcon'
import DeniedIcon from '../../../../components/icons/DeniedIcon'
import NoConfirmIcon from '../../../../components/icons/NoConfirmIcon'
import TopContainer from '../../../../components/TopContainer'
import { useToast } from '../../../../contexts/ToastContext'
import * as GlobalStyle from '../../../../GlobalStyle'

const AttendanceScreen = ({ route }) => {
    const { event } = route.params
    const [attendance, setAttendance] = useState({})
    const [contractedMusicians, setContractedMusicians] = useState([])
    const { showToast } = useToast();

    useFocusEffect(
        useCallback(() => {
            fetchAttendance();
        }, [event])
    )

    const fetchAttendance = async () => {
        try {
            const attendanceData = await EventEndpoints.getEventAttendance(event?.id);
            setAttendance(attendanceData.attendanceByInstrument);
            setContractedMusicians(attendanceData.contractedMusicians || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            showToast('Error', 'No se pudo cargar la asistencia del evento. Por favor, inténtalo de nuevo más tarde.', 'error');
        }

    }

    // Calcular totales
    const calculateTotals = () => {
        const attendanceArray = Object.values(attendance);
        const totalConfirmed = attendanceArray.reduce((sum, item) => sum + (item.presentCount || 0), 0);
        const totalDenied = attendanceArray.reduce((sum, item) => sum + (item.absentCount || 0), 0);
        const totalNotConfirmed = attendanceArray.reduce((sum, item) => sum + (item.notConfirmedCount || 0), 0);
        const totalComponents = totalConfirmed + totalDenied + totalNotConfirmed;

        const confirmedPercentage = totalComponents > 0 ? (totalConfirmed / totalComponents) * 100 : 0;
        const deniedPercentage = totalComponents > 0 ? (totalDenied / totalComponents) * 100 : 0;

        return { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage };
    }

    const { totalConfirmed, totalDenied, confirmedPercentage, deniedPercentage } = calculateTotals();

    return (
        <View style={{ flex: 1 }}>
            <TopContainer
                title="Asistencia"
                editEnabled={false}
                style={{ alignItems: 'left', marginBottom: 0 }}>
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
                    ListEmptyComponent={() => <Text style={styles.emptyText}>No hay datos de asistencia disponibles.</Text>}
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
                                style={{ marginTop: 10 }}
                                ItemSeparatorComponent={() => <View style={{ height: 15 }}></View>}
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
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
        <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <View style={styles.attendanceComponentContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image source={attendance.component.musician.user.profile_picture ? { uri: attendance.component.musician.user.profile_picture } : profileDefault} style={{ width: 50, height: 50, borderRadius: 25 }} />
                    <Text style={styles.attendanceComponentName}>{attendance.component.musician.user.full_name}</Text>
                </View>
                {attendance.present === true ? <ConfirmIcon width={25} height={25} /> : attendance.present === false ? <DeniedIcon width={25} height={25} stroke={attendance.alleged && GlobalStyle.yellow} fillStroke={attendance.alleged && GlobalStyle.yellow} /> : <NoConfirmIcon width={25} height={25} />}
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
                    <View style={styles.instrumentTag}>
                        {contracted?.instrument?.image ? (
                            <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${contracted.instrument.image}` }} style={{ width: 16, height: 16 }} />
                        ) : null}
                        <Text style={styles.instrumentTagText}>{contracted?.instrument?.name || 'Instrumento no indicado'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.contractedBadge}>
                <Text style={styles.contractedBadgeText}>Contratado/a</Text>
            </View>
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
    },
    instrumentTag: {
        marginTop: -4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    instrumentTagText: {
        fontFamily: 'Oswald_300',
        fontSize: 16,
        color: GlobalStyle.darkGray,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        textAlign: 'center',
        marginTop: 50,
    }

})