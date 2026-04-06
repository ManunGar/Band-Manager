import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAgreementSearch } from '../contexts/AgreementSearchContext';
import * as GlobalStyle from '../GlobalStyle';
import BottomSheet from './BottomSheet';
import Input from './Input';

const AgreementFilterSheet = ({ sheetRef }) => {
    const snapPoints = useMemo(() => ['40%'], []);
    const { startDate, setStartDate, endDate, setEndDate } = useAgreementSearch();
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const formatDate = (date) => {
        return date ? moment(date).format('DD/MM/YYYY') : '';
    };

    const hasFilters = startDate !== null || endDate !== null;

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <BottomSheet sheetRef={sheetRef} snapPoints={snapPoints}>
            <View style={styles.header}>
                <Text style={styles.title}>Filtros</Text>
                {hasFilters && (
                    <TouchableOpacity onPress={handleClear}>
                        <Text style={styles.clearLink}>Limpiar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputContainer}>
                <Input
                    label="Fecha inicio"
                    placeholder="Seleccionar fecha"
                    value={formatDate(startDate)}
                    onPress={() => setShowStartPicker(true)}
                />
                {showStartPicker && (
                    <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        onChange={(_, date) => {
                            setShowStartPicker(false);
                            if (date) setStartDate(date);
                        }}
                    />
                )}
            </View>

            <View style={styles.inputContainer}>
                <Input
                    label="Fecha fin"
                    placeholder="Seleccionar fecha"
                    value={formatDate(endDate)}
                    onPress={() => setShowEndPicker(true)}
                />
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate || startDate || new Date()}
                        mode="date"
                        onChange={(_, date) => {
                            setShowEndPicker(false);
                            if (date) setEndDate(date);
                        }}
                    />
                )}
            </View>

        </BottomSheet>
    );
};

export default AgreementFilterSheet;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Oswald_500',
        color: GlobalStyle.black,
        textTransform: 'uppercase',
    },
    clearLink: {
        fontSize: 16,
        fontFamily: 'Oswald_400',
        color: GlobalStyle.yellow,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyle.yellow,
    },
    inputContainer: {
        marginBottom: 35,
    },
});
