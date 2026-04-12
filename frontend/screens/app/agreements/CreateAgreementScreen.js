import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import AgreementEndpoints from '../../../api/AgreementEndpoints';
import InstrumentsEndpoints from '../../../api/InstrumentsEndpoints';
import { useToast } from '../../../contexts/ToastContext';
import bandDefaultImage from '../../../assets/milestones/band_default.png';
import TopContainer from '../../../components/TopContainer';
import * as GlobalStyle from '../../../GlobalStyle';
import { parseDate } from '../../../helpers/ParseHelpers';

const CreateAgreementScreen = ({ route, navigation }) => {
    // Pre-filled when coming from HireMusicianScreen
    const {
        performanceId: prefilledPerformanceId,
        eventName: prefilledEventName,
        eventDate: prefilledEventDate,
        bandName: prefilledBandName,
        musicianId,
        musicianName,
        musicianInstruments,
    } = route.params ?? {};

    const { showToast } = useToast();

    const [performances, setPerformances] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedPerformanceId, setSelectedPerformanceId] = useState(prefilledPerformanceId ?? null);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
    const [amount, setAmount] = useState('1');
    const [payment, setPayment] = useState('');
    const [description, setDescription] = useState('');

    // Whether performance is locked (came from HireMusician)
    const isPerformanceLocked = Boolean(prefilledPerformanceId);

    useEffect(() => {
        const init = async () => {
            try {
                setLoadingInit(true);
                const [perfData, instrData] = await Promise.all([
                    isPerformanceLocked ? Promise.resolve([]) : AgreementEndpoints.listAdminPerformances(),
                    musicianInstruments && musicianInstruments.length > 0
                        ? Promise.resolve(musicianInstruments)
                        : InstrumentsEndpoints.getAllInstruments(),
                ]);

                if (!isPerformanceLocked) setPerformances(perfData || []);
                setInstruments(instrData || []);
            } catch (error) {
                console.error('Error initializing CreateAgreement:', error);
            } finally {
                setLoadingInit(false);
            }
        };
        init();
    }, []);

    const selectedPerformance = isPerformanceLocked
        ? { id: prefilledPerformanceId, Event: { name: prefilledEventName, date: prefilledEventDate, band: { name: prefilledBandName } } }
        : performances.find((p) => p.id === selectedPerformanceId);

    const selectedInstrument = instruments.find((i) => i.id === selectedInstrumentId);

    const canSubmit =
        selectedPerformanceId &&
        selectedInstrumentId &&
        Number(amount) > 0 &&
        Number(payment) > 0 &&
        description.trim().length > 0;

    const handleSubmit = async () => {
        if (!canSubmit) {
            showToast('Formulario incompleto', 'Rellena todos los campos antes de continuar.', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const result = await AgreementEndpoints.createAgreement(
                selectedPerformanceId,
                selectedInstrumentId,
                parseInt(amount, 10),
                parseFloat(payment),
                description.trim()
            );

            // If we came from the hire flow, also invite the musician
            if (musicianId && result?.agreementId) {
                try {
                    await AgreementEndpoints.inviteMusician(result.agreementId, musicianId);
                    showToast('¡Contrato creado!', `Se ha creado el contrato y se ha enviado la invitación a ${musicianName || 'el músico'}.`, 'success');
                    navigation.pop(2);
                } catch {
                    // Agreement created but invite failed — still navigate back
                    showToast('Contrato creado', 'El contrato se ha creado, pero no se pudo enviar la invitación al músico. Puedes invitarlo desde el detalle del contrato.', 'info');
                    navigation.goBack();
                }
            } else {
                showToast('¡Contrato creado!', 'El contrato ha sido creado correctamente.', 'success');
                navigation.goBack();
            }
        } catch (error) {
            showToast('Error', error.message || 'Hubo un error al crear el contrato.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingInit) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GlobalStyle.yellow} />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: 'height' })}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <TopContainer title="Nuevo Contrato" editEnabled={false} configEnabled={false} />

                <View style={styles.body}>
                    {/* ── EVENTO / ACTUACIÓN ── */}
                    <View>
                        <Text style={styles.label}>Actuación</Text>

                        {isPerformanceLocked ? (
                            /* Pre-filled event card */
                            <View style={[styles.selectionCard, styles.selectionCardSelected]}>
                                <Image
                                    source={bandDefaultImage}
                                    style={styles.selectionImage}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.selectionTitle} numberOfLines={1}>
                                        {prefilledEventName}
                                    </Text>
                                    <Text style={styles.selectionSub} numberOfLines={1}>
                                        {prefilledBandName}
                                    </Text>
                                    {prefilledEventDate && (
                                        <Text style={styles.selectionDate}>{parseDate(prefilledEventDate)}</Text>
                                    )}
                                </View>
                            </View>
                        ) : performances.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>
                                    No hay actuaciones futuras sin contrato disponibles.
                                </Text>
                            </View>
                        ) : (
                            performances.map((perf) => {
                                const event = perf?.Event;
                                const band = event?.band;
                                const isSelected = selectedPerformanceId === perf.id;
                                return (
                                    <Pressable
                                        key={perf.id}
                                        style={[styles.selectionCard, isSelected && styles.selectionCardSelected]}
                                        onPress={() => setSelectedPerformanceId(perf.id)}
                                    >
                                        <Image
                                            source={band?.profile_picture ? { uri: band.profile_picture } : bandDefaultImage}
                                            style={styles.selectionImage}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.selectionTitle} numberOfLines={1}>{event?.name}</Text>
                                            <Text style={styles.selectionSub} numberOfLines={1}>{band?.name}</Text>
                                            {event?.date && (
                                                <Text style={styles.selectionDate}>{parseDate(event.date)}</Text>
                                            )}
                                        </View>
                                        {isSelected && (
                                            <View style={styles.checkDot} />
                                        )}
                                    </Pressable>
                                );
                            })
                        )}
                    </View>

                    {/* ── INSTRUMENTO ── */}
                    <View>
                        <Text style={styles.label}>Instrumento</Text>
                        {instruments.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay instrumentos disponibles.</Text>
                            </View>
                        ) : (
                            <View style={styles.chipGrid}>
                                {instruments.map((instr) => {
                                    const isSelected = selectedInstrumentId === instr.id;
                                    return (
                                        <Pressable
                                            key={instr.id}
                                            style={[styles.chip, isSelected && styles.chipSelected]}
                                            onPress={() => setSelectedInstrumentId(instr.id)}
                                        >
                                            {instr.image && (
                                                <Image
                                                    source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${instr.image}` }}
                                                    style={styles.chipImage}
                                                />
                                            )}
                                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                                {instr.name}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* ── CANTIDAD ── */}
                    <View>
                        <Text style={styles.label}>Cantidad de músicos</Text>
                        <View style={styles.counterRow}>
                            <Pressable
                                style={styles.counterBtn}
                                onPress={() => setAmount((v) => String(Math.max(1, Number(v) - 1)))}
                            >
                                <Text style={styles.counterBtnText}>−</Text>
                            </Pressable>
                            <TextInput
                                style={styles.counterInput}
                                value={amount}
                                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Pressable
                                style={styles.counterBtn}
                                onPress={() => setAmount((v) => String(Math.min(99, Number(v) + 1)))}
                            >
                                <Text style={styles.counterBtnText}>+</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* ── PAGO ── */}
                    <View>
                        <Text style={styles.label}>Pago por músico (€)</Text>
                        <TextInput
                            style={styles.input}
                            value={payment}
                            onChangeText={(t) => setPayment(t.replace(/[^0-9.]/g, ''))}
                            keyboardType="decimal-pad"
                            placeholder="Ej: 150"
                            placeholderTextColor={GlobalStyle.gray}
                        />
                    </View>

                    {/* ── DESCRIPCIÓN ── */}
                    <View>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe los requisitos del contrato..."
                            placeholderTextColor={GlobalStyle.gray}
                            multiline
                            numberOfLines={4}
                            maxLength={255}
                        />
                        <Text style={styles.charCount}>{description.length}/255</Text>
                    </View>

                    {/* ── SUBMIT ── */}
                    <Pressable
                        style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!canSubmit || submitting}
                    >
                        <Text style={styles.submitBtnText}>
                            {submitting
                                ? 'Creando contrato...'
                                : musicianId
                                    ? 'Crear contrato e invitar músico'
                                    : 'Crear contrato'}
                        </Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateAgreementScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: GlobalStyle.lightBackground,
    },
    loadingText: {
        fontFamily: 'Oswald_400',
        fontSize: 18,
        color: GlobalStyle.gray,
    },
    body: {
        paddingHorizontal: 25,
        gap: 22,
    },
    label: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.black,
        marginBottom: 10,
    },
    emptyBox: {
        borderRadius: 12,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    emptyText: {
        fontFamily: 'Oswald_400',
        fontSize: 15,
        color: GlobalStyle.gray,
        textAlign: 'center',
    },
    selectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: GlobalStyle.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectionCardSelected: {
        borderColor: GlobalStyle.yellow,
    },
    selectionImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlobalStyle.lightGray,
    },
    selectionTitle: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.black,
    },
    selectionSub: {
        fontFamily: 'Oswald_400',
        fontSize: 13,
        color: GlobalStyle.gray,
    },
    selectionDate: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    checkDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: GlobalStyle.yellow,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.white,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    chipSelected: {
        borderColor: GlobalStyle.yellow,
        backgroundColor: '#FFF5E6',
    },
    chipImage: {
        width: 16,
        height: 16,
    },
    chipText: {
        fontFamily: 'Oswald_400',
        fontSize: 14,
        color: GlobalStyle.darkGray,
        textTransform: 'uppercase',
    },
    chipTextSelected: {
        color: GlobalStyle.yellow,
        fontFamily: 'Oswald_500',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    counterBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: GlobalStyle.white,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterBtnText: {
        fontFamily: 'Oswald_500',
        fontSize: 22,
        color: GlobalStyle.black,
        lineHeight: 26,
    },
    counterInput: {
        width: 60,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        backgroundColor: GlobalStyle.white,
        textAlign: 'center',
        fontFamily: 'Oswald_500',
        fontSize: 18,
        color: GlobalStyle.black,
    },
    input: {
        backgroundColor: GlobalStyle.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: GlobalStyle.lightGray,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontFamily: 'Oswald_400',
        fontSize: 16,
        color: GlobalStyle.black,
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontFamily: 'Oswald_400',
        fontSize: 12,
        color: GlobalStyle.gray,
        textAlign: 'right',
        marginTop: 4,
    },
    submitBtn: {
        backgroundColor: GlobalStyle.yellow,
        borderRadius: 40,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 6,
    },
    submitBtnDisabled: {
        backgroundColor: GlobalStyle.lightGray,
    },
    submitBtnText: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.blue,
        textTransform: 'uppercase',
    },
});
