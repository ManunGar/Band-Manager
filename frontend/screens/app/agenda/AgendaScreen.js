import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import EventEndpoints from '../../../api/EventEndpoints'
import Event from '../../../components/Event'
import Tag from '../../../components/Tap'
import TopContainer from '../../../components/TopContainer'
import * as GlobalStyle from '../../../GlobalStyle'

const AgendaScreen = () => {
    const [timeScope, setTimeScope] = useState('upcoming')
    const [type, setType] = useState('')
    const [events, setEvents] = useState([])

    useEffect(() => {
      fetchEvents();
    }, [timeScope, type]);

    const fetchEvents = async () => {
        try {
            const fetchedEvents = await EventEndpoints.listEvents('', timeScope, type);
            setEvents(fetchedEvents);            
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }


    return (
        <View>
            <TopContainer backEnabled={false} editEnabled={false} 
                style={{ paddingBottom: 24, paddingTop: 18, alignItems: 'flex-start' }}
                createEnabled={true}>
                <Text style={styles.title}>Agenda Musical</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5}}>
                    <Text onPress={() => setTimeScope('upcoming')}
                        style={[styles.timeScope, {color: timeScope === 'upcoming' ? GlobalStyle.yellow : GlobalStyle.gray}]}>
                        PRÓXIMAS
                    </Text>
                    <Text onPress={() => setTimeScope('past')}
                        style={[styles.timeScope, {color: timeScope === 'past' ? GlobalStyle.yellow : GlobalStyle.gray}]}>
                        ANTERIORES
                    </Text>
                </View>
            </TopContainer>
            <View style={styles.tagContainer}>
                <Tag selected={type === ''} onPress={() => setType('')}>
                    Todos
                </Tag>
                <Tag selected={type === 'performances'} onPress={() => setType('performances')}>
                    Actuaciones
                </Tag>
                <Tag selected={type === 'rehearsals'} onPress={() => setType('rehearsals')}>
                    Ensayos
                </Tag>
            </View>
            <FlatList 
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <Event event={item} />}
                ItemSeparatorComponent={() => <View style={{ paddingTop: 16 }}></View>}
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 200, paddingTop: 10 }}
                ListEmptyComponent={<Text style={{ fontFamily: 'Oswald_400', fontSize: 16, color: GlobalStyle.gray, marginTop: 20 }}>No hay eventos para mostrar</Text>}
            />
        </View>
    )
}

export default AgendaScreen

const styles = StyleSheet.create({
    title: {
        fontFamily: 'BebasNeue',
        fontSize: 36,
    },
    timeScope: {
        fontFamily: 'Oswald_500',
        fontSize: 16,
        color: GlobalStyle.gray,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        gap: 10,
        marginTop: -10,
        marginBottom: 10,
        paddingInline: 25,
    }
})