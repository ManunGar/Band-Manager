import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import EventEndpoints from '../../../api/EventEndpoints';
import performancePictureDefault from '../../../assets/milestones/performance_default.jpg';
import rehearsalPictureDefault from '../../../assets/milestones/rehearsal_default.jpg';
import BottomSheet from '../../../components/BottomSheet';
import AgendaIcon from '../../../components/icons/AgendaIcon';
import AttendanceIcon from '../../../components/icons/AttendanceIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import MusicIcon from '../../../components/icons/MusicIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import LinkText from '../../../components/LinkText';
import TopContainer from '../../../components/TopContainer';
import { AuthContext } from '../../../contexts/AuthContext';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const EventScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null)
    const { setIsBandAdministrator, isBandAdministrator } = useContext(AuthContext)
    const [attendance, setAttendance] = useState(null)
    const [comment, setComment] = useState(null)
    const snapPoints = useMemo(() => [])
    const sheetRef = useRef(null)

    useEffect(() => {
        fetchEventDetails();
    }, [eventId])

    useFocusEffect(
        useCallback(() => {
            return closeSheet;
        }, [])
    );

    const openSheet = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const closeSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const fetchEventDetails = async () => {
        const fetchedEvent = await EventEndpoints.getEventDetails(eventId);
        fetchedEvent ? setIsBandAdministrator(fetchedEvent.band.components[0].administrator) : setIsBandAdministrator(false);
        setEvent(fetchedEvent);
        setAttendance(fetchedEvent?.attendance.present);
    }

    const handleAttendance = async (confirm) => {
        setAttendance(confirm);
        openSheet();
    }

    const handleSaveAttendance = async () => {
        try {
            await EventEndpoints.takeComponentAttendance(eventId, { present: attendance, reason: comment || '' });
            await fetchEventDetails();
            closeSheet();
        } catch (error) {
            console.log("🚀 ~ handleSaveAttendance ~ error:", error)
            Alert.alert('Error', error.message || 'Hubo un error al guardar tu asistencia.');
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} style={{ flex: 1 }}>
            <ScrollView>
                <TopContainer style={{ paddingBottom: 0, marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} editEnabled={isBandAdministrator} />
                {/* HEADER */}
                <View style={styles.headerContainer}>
                    <Image source={event?.Performance ? event.Performance.picture ? { uri: event.Performance.picture } : performancePictureDefault : rehearsalPictureDefault}
                        style={styles.image} />
                    <View style={{ paddingHorizontal: 8, paddingBottom: 15, width: '100%' }}>
                        <Text style={styles.bandName}>{event?.band?.name}</Text>
                        <Text style={styles.title}>{event?.Performance ? event.Performance.name : "Ensayo"}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, gap: 10, paddingBottom: 30, paddingTop: 20, width: '100%', borderTopWidth: 1, borderTopColor: GlobalStyle.lightGray }}>
                        {event?.Performance &&
                            <View style={styles.textContainer}>
                                <MusicIcon width={20} height={20} fill={GlobalStyle.black} />
                                <Text style={styles.text}>{event.Performance.type}</Text>
                            </View>}
                        {event &&
                            <View style={styles.textContainer}>
                                <AgendaIcon width={20} height={20} fill={GlobalStyle.black} strokeWidth={30} />
                                <Text style={styles.text}>{parseDate(event?.date)}</Text>
                            </View>}
                        {event &&
                            <View style={styles.textContainer}>
                                <TimeIcon width={20} height={20} fill={GlobalStyle.black} />
                                <Text style={styles.text}>{event?.initialTime.substring(0, 5)} - {event?.endTime.substring(0, 5)}</Text>
                            </View>
                        }
                        {event?.Performance &&
                            <View style={styles.textContainer}>
                                <LocationIcon width={20} height={22} fill={GlobalStyle.black} />
                                <Text style={styles.text}>{event.Performance.place}</Text>
                            </View>
                        }
                    </View>
                </View>
                {/* BODY */}
                <View style={{ paddingBottom: 60 }}>
                    <View style={{ paddingHorizontal: 25, paddingTop: 22, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <AttendanceIcon width={25} height={22} />
                            <Text style={styles.subtitle}>Asistencia</Text>
                        </View>
                        {isBandAdministrator && <LinkText>Pasar Lista</LinkText>}
                    </View>
                    {event?.attendance.participates ? <View>
                        {event?.date > new Date().toISOString() ?
                            <View style={{ flex: 1 }}>
                                {/* BUTTONS */}
                                <View style={{ flexDirection: 'row', gap: 20, maxWidth: 400, margin: 'auto' }}>
                                    <Pressable onPress={() => handleAttendance(true)}
                                        style={[styles.button, { backgroundColor: event.attendance.present === true ? GlobalStyle.green : GlobalStyle.lightGreen, borderColor: GlobalStyle.darkGreen, borderWidth: 1 }]}>
                                        <Text style={styles.buttonText}>Confirmar</Text>
                                    </Pressable>
                                    <Pressable onPress={() => handleAttendance(false)}
                                        style={[styles.button, { backgroundColor: event.attendance.present === false ? GlobalStyle.red : GlobalStyle.lightRed, borderColor: GlobalStyle.darkRed, borderWidth: 1 }]}>
                                        <Text style={styles.buttonText}>Negar</Text>
                                    </Pressable>
                                </View>
                                {/* COMMENT */}
                                <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints} style={{ paddingInline: 5 }}>
                                    <Text style={{ fontFamily: 'Oswald_500', color: attendance === true ? GlobalStyle.green : GlobalStyle.red, fontSize: 16 }}>
                                        Vas a {attendance === true ? "confirmar tu asistencia" : "negar tu asistencia"} a este evento.
                                    </Text>
                                    <Text style={{ fontFamily: 'Oswald_400', color: GlobalStyle.darkGray, fontSize: 16, marginBottom: 10 }}>
                                        ¿Quieres añadir algún comentario o justificación? (opcional)
                                    </Text>
                                    {/* INPUT */}
                                    <View style={styles.input}>
                                        <BottomSheetTextInput
                                            style={styles.textInput}
                                            placeholder="Escribe un comentario/justificación..."
                                            value={comment}
                                            onChangeText={setComment}
                                            multiline
                                        />
                                    </View>
                                    {/* SEND BUTTON */}
                                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                                        <Pressable onPress={handleSaveAttendance} 
                                            style={[styles.button, { backgroundColor: GlobalStyle.yellow, borderColor: GlobalStyle.yellow, borderWidth: 1, width: '60%' }]}>
                                            <Text style={[styles.buttonText, { color: GlobalStyle.blue }]}>Guardar Asistencia</Text>
                                        </Pressable>
                                    </View>
                                </BottomSheet>
                                <View style={[styles.input, { marginInline: 20, marginTop: 20 }]}>
                                    <Text onPress={() => handleAttendance(event.attendance.present)} style={[styles.textInput, { color: event.attendance.reason ? GlobalStyle.black : GlobalStyle.gray }]}>{event.attendance.reason || "No has añadido ningún comentario."}</Text>
                                </View>
                            </View> :
                            <View style={[styles.button, { backgroundColor: event?.attendance.present === true ? GlobalStyle.lightGreen : event?.attendance.present === false ? GlobalStyle.lightRed : GlobalStyle.gray, borderColor: event?.attendance.present === true ? GlobalStyle.darkGreen : event?.attendance.present === false ? GlobalStyle.darkRed : GlobalStyle.gray, borderWidth: 1, alignSelf: 'center', width: '80%' }]}>
                                <Text style={[styles.buttonText ]}>
                                    {event?.attendance.present === true ? "Asistencia Confirmada" : event?.attendance.present === false ? "Asistencia Negada" : "Asistencia sin Confirmar"}
                                </Text>
                            </View>
                        }
                    </View> : <Text style={{ fontFamily: 'Oswald_400', fontSize: 16, color: GlobalStyle.gray, textAlign: 'center', marginTop: 20 }}>No participas en este evento</Text>}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default EventScreen
const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 12,
        backgroundColor: GlobalStyle.white,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        maxWidth: 380
    },
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 30
    },
    bandName: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.gray,
        marginBlock: 4
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        alignItems: 'center',
    },
    text: {
        fontFamily: 'Oswald_400',
        fontSize: 17,
        color: GlobalStyle.black
    },
    subtitle: {
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black
    },
    button: {
        padding: 10,
        paddingVertical: 8,
        borderRadius: 40,
        alignItems: 'center',
        width: '40%'
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.white
    },
    input: {
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        borderRadius: 8,
        paddingInline: 10,
        fontFamily: 'Oswald_400',
        fontSize: 16,
        minHeight: 80,
    },
    textInput: {
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.black
    }
})