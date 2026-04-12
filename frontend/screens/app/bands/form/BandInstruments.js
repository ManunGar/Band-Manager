import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import BandEndpoints from '../../../../api/BandEndpoints';
import InstrumentsEndpoints from '../../../../api/InstrumentsEndpoints';
import bandDefaultImage from '../../../../assets/milestones/band_default.png';
import Button from '../../../../components/Button';
import InputSearch from '../../../../components/InputSearch';
import Instrument from '../../../../components/Instrument';
import TopContainer from '../../../../components/TopContainer';
import { useBandForm } from '../../../../contexts/BandFormContext';
import { useToast } from '../../../../contexts/ToastContext';
import * as GlobalStyle from '../../../../GlobalStyle';

const BandInstruments = ({ route }) => {
    const { band } = route.params;
    const [instruments, setInstruments] = useState([])
    const [allInstruments, setAllInstruments] = useState([])
    const { bandFormData, updateBandFormData, resetBandFormData } = useBandForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState('')
    const navigation = useNavigation();
    const { showToast } = useToast();

    useEffect(() => {
        fetchInstruments();
    }, []);

    useEffect(() => { // Debounce search input
        // Don't filter if instruments haven't loaded yet
        if (allInstruments.length === 0) return;
        
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
            setInstruments(response);
            setAllInstruments(response);
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }

    const selectInstrument = (instrument) => {
        const updatedInstruments = { ...bandFormData.instruments };
        
        if (Object.keys(updatedInstruments).includes(String(instrument.id))) {
            // Deselect instrument
            const wasPrincipal = updatedInstruments[String(instrument.id)] === true;
            delete updatedInstruments[String(instrument.id)];
            
            // If it was the main one and there are other instruments left, make the first main one
            if (wasPrincipal && Object.keys(updatedInstruments).length > 0) {
                const firstInstrumentId = Object.keys(updatedInstruments)[0];
                updatedInstruments[firstInstrumentId] = true;
                
                // Update allInstruments: deselect the current one and make the first one primary
                const updatedAll = allInstruments.map(inst => {
                    if (inst.id === instrument.id) {
                        return { ...inst, selected: false, principal: false };
                    } else if (inst.id.toString() === firstInstrumentId) {
                        return { ...inst, principal: true };
                    }
                    return inst;
                });
                setAllInstruments(updatedAll);
                
                // Update instruments immediately for visual feedback
                if (!search.trim()) {
                    setInstruments(updatedAll);
                } else {
                    const lower = search.toLowerCase();
                    setInstruments(updatedAll.filter(inst => inst.name.toLowerCase().includes(lower)));
                }
            } else {
                // Just deselect the instrument
                const updatedAll = allInstruments.map(inst => 
                    inst.id === instrument.id 
                        ? { ...inst, selected: false, principal: false }
                        : inst
                );
                setAllInstruments(updatedAll);
                
                // Update instruments immediately for visual feedback
                if (!search.trim()) {
                    setInstruments(updatedAll);
                } else {
                    const lower = search.toLowerCase();
                    setInstruments(updatedAll.filter(inst => inst.name.toLowerCase().includes(lower)));
                }
            }
        } else {
            // Select instrument
            const isPrincipal = Object.keys(updatedInstruments).length === 0;
            updatedInstruments[instrument.id] = isPrincipal;
            
            // Update allInstruments immutably
            const updatedAll = allInstruments.map(inst => 
                inst.id === instrument.id 
                    ? { ...inst, selected: true, principal: isPrincipal }
                    : inst
            );
            setAllInstruments(updatedAll);
            
            // Update instruments immediately for visual feedback
            if (!search.trim()) {
                setInstruments(updatedAll);
            } else {
                const lower = search.toLowerCase();
                setInstruments(updatedAll.filter(inst => inst.name.toLowerCase().includes(lower)));
            }
        }
        
        updateBandFormData({ instruments: updatedInstruments });
    }

    const handleCreateBand = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add picture if exists
            if (bandFormData.profile_picture) {
                formData.append('profile_picture', {
                    uri: bandFormData.profile_picture,
                    name: `band_${Date.now()}.jpg`,
                    type: 'image/jpeg',
                });
            }

            formData.append('name', bandFormData.name);
            formData.append('location', bandFormData.location);
            formData.append('phone', bandFormData.phone);
            formData.append('type', bandFormData.type);
            formData.append('instruments', JSON.stringify(bandFormData.instruments));

            !band ? await BandEndpoints.createBand(formData) : await BandEndpoints.joinBand(band.id, { instruments: bandFormData.instruments });
            resetBandFormData();

            navigation.reset({
                index: 0,
                routes: [{ name: 'MyBands' }],
            })

        } catch (error) {
            console.error(error?.message);
            showToast('Error', 'Hubo un error al crear la banda. Por favor, intenta de nuevo.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <TopContainer
                editEnabled={false}
                style={band && { paddingTop: 5, paddingBottom: 30 }}
                title={!band && 'Seleccionar Instrumento'}>
                {band && <>
                    <Image source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage} style={{ width: 70, height: 70 }} />
                    <Text style={{ fontSize: 26, fontFamily: 'BebasNeue', marginTop: 5 }}>
                        {band?.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Oswald_500', color: GlobalStyle.yellow, textTransform: 'uppercase', textAlign: 'center' }}>
                        {band?.type}
                    </Text>
                </>}
            </TopContainer>
            <View style={{ paddingHorizontal: 20, flex: 1 }}>
                <View style={{ marginBottom: 10, width: '100%' }}>
                    <InputSearch
                        placeholder="Busca por instrumento"
                        value={search}
                        onChangeText={setSearch} />
                </View>
                <Text style={styles.descriptionText}>Selecciona los instrumentos que pertenecerán a tu componente. Podrás editarlos posteriormente en cualquier momento.</Text>
                <FlatList
                    data={instruments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Instrument
                            instrument={item}
                            onPress={() => selectInstrument(item)}
                        />
                    )}
                    contentContainerStyle={{ gap: 15, paddingTop: 10, paddingBottom: 150 }}
                    style={{ flexGrow: 0 }}
                />
                {Object.keys(bandFormData.instruments).length > 0 &&
                    <View style={styles.buttonContainer}>
                        <Button
                            onPress={handleCreateBand}
                            disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : band ? 'Unirse' : 'Crear Banda'}
                        </Button>
                    </View>}
            </View>
        </View>
    );
}

export default BandInstruments

const styles = StyleSheet.create({
    buttonContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.gray,
        marginTop: 10,
        marginBottom: 20
    }
})