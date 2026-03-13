import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import EventEndpoints from "../../../../api/EventEndpoints";
import InstrumentsEndpoints from "../../../../api/InstrumentsEndpoints";
import Button from "../../../../components/Button";
import InputSearch from "../../../../components/InputSearch";
import Instrument from "../../../../components/Instrument";
import TopContainer from "../../../../components/TopContainer";
import { useEventForm } from "../../../../contexts/EventFormContext";
import * as GlobalStyle from '../../../../GlobalStyle';

const EventInstruments = ({ route }) => {
    const { band, event } = route.params;
    const { eventFormData, updateEventFormData, resetEventFormData } = useEventForm();
    const [instruments, setInstruments] = useState([]);
    const [allInstruments, setAllInstruments] = useState([]);
    const [search, setSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        fetchInstruments();
    }, []);

    useEffect(() => { // Debounce search input
        const timeout = setTimeout(() => {
            if (!search.trim()) { // If search is empty, show all instruments
                setInstruments(allInstruments);
                return;
            }

            const lower = search.toLowerCase();
            const filtered = allInstruments.filter((inst) =>
                inst.name.toLowerCase().includes(lower)
            );
            setInstruments(filtered);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, allInstruments]);

    const fetchInstruments = async () => {
        try {
            const response = await InstrumentsEndpoints.getAllInstruments();
            // Mark instruments as selected based on eventFormData
            const instrumentsWithSelection = response.map(inst => ({
                ...inst,
                selected: eventFormData.instruments.includes(inst.id)
            }));
            setAllInstruments(instrumentsWithSelection);
            setInstruments(instrumentsWithSelection);
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }

    const selectInstrument = (instrument) => {
        const updatedInstruments = [...eventFormData.instruments];
        const instrumentSelected = allInstruments.find(i => i.id === instrument.id);

        if (updatedInstruments.includes(instrument.id)) {
            // Deselect instrument - remove from array
            const index = updatedInstruments.indexOf(instrument.id);
            updatedInstruments.splice(index, 1);
            instrumentSelected.selected = false;
        } else {
            // Select instrument - add to array
            updatedInstruments.push(instrument.id);
            instrumentSelected.selected = true;
        }

        updateEventFormData({ instruments: updatedInstruments });
        setAllInstruments([...allInstruments]); // Force re-render
    }

    const toggleAllInstruments = () => {
        if (eventFormData.instruments.length === 0) {
            // Currently all are selected, do nothing (already at desired state)
            return;
        } else {
            // Some instruments are selected, clear selection (select all)
            const updatedInstruments = allInstruments.map(inst => ({
                ...inst,
                selected: false
            }));
            setAllInstruments(updatedInstruments);
            updateEventFormData({ instruments: [] });
        }
    }

    const handleCreateEvent = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add all text fields
            formData.append('eventType', eventFormData.eventType);
            formData.append('date', eventFormData.date);
            formData.append('initialTime', eventFormData.initialTime);
            formData.append('endTime', eventFormData.endTime);
            formData.append('delete_picture', eventFormData.delete_picture);

            // Add event fields (required for all events)
            formData.append('name', eventFormData.name || '');
            formData.append('location', eventFormData.location || '');
            formData.append('latitude', eventFormData.latitude?.toString() || '0');
            formData.append('longitude', eventFormData.longitude?.toString() || '0');

            // Add performance-specific fields (backend will ignore them for rehearsals)
            formData.append('type', eventFormData.type || '');
            formData.append('comment', eventFormData.comment || '');

            console.log('Instruments being sent:', eventFormData);
            // Add instruments array if not empty
            if (eventFormData.instruments && eventFormData.instruments.length > 0) {
                formData.append('instruments', JSON.stringify(eventFormData.instruments));
            } else {
                formData.append('instruments', JSON.stringify([])); // Send empty array if no instruments selected
            }

            // Add picture if exists
            if (eventFormData.picture) {
                formData.append('picture', {
                    uri: eventFormData.picture,
                    name: `event_${Date.now()}.jpg`,
                    type: 'image/jpeg',
                });
            }

            !event ? await EventEndpoints.createEvent(band.id, formData) : await EventEndpoints.editEvent(event.id, formData);
            resetEventFormData();

            // Navigate back based on whether we're creating or editing
            if (event?.id) {
                // Editing: go back 2 screens (EventInstruments -> EventFormScreen -> EventScreen)
                navigation.pop(3);
            } else {
                // Creating: go back to the top of the stack
                navigation.pop(2);
            }
        } catch (error) {
            console.error('Error al crear el evento:', error);
            Alert.alert('Error', 'Ocurrió un error al guardar el evento. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <TopContainer
                title="Instrumentos"
                editEnabled={false}
                pictureEnabled={true}
                pictureUrl={band.profile_picture}
            />
            <View style={styles.container}>
                <Text style={styles.descriptionText}>Selecciona los instrumentos que deseas que  asistan al evento. Si no seleccionas ningún instrumento, todos participarán en el evento</Text>
                
                {/* Checkbox for selecting all instruments */}
                <Pressable 
                    style={styles.checkboxContainer} 
                    onPress={toggleAllInstruments}
                >
                    <View style={[
                        styles.checkbox, 
                        eventFormData.instruments.length === 0 && styles.checkboxChecked
                    ]}>
                    </View>
                    <Text style={styles.checkboxLabel}>Todos los instrumentos participan</Text>
                </Pressable>

                <View style={styles.searchContainer}>
                    <InputSearch
                        placeholder="Busca por nombre de instrumento"
                        value={search}
                        onChangeText={setSearch} />
                </View>
                <FlatList
                    data={instruments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Instrument
                            instrument={item}
                            onPress={() => selectInstrument(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleCreateEvent}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : event ? 'Guardar Cambios' : 'Crear Evento'}
                    </Button>
                </View>
            </View>
        </>
    )
}

export default EventInstruments;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20
    },
    searchContainer: {
        marginBottom: 20,
        width: '100%',
    },
    listContent: {
        gap: 15,
        paddingBottom: 30,
    },
    buttonContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        marginBottom: 10
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: GlobalStyle.darkGray,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: GlobalStyle.yellow,
        borderColor: GlobalStyle.yellow,
    },
    checkmark: {
        color: GlobalStyle.blue,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 16,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
    }
});