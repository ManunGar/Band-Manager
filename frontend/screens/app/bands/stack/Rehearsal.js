import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import EventEndpoints from '../../../../api/EventEndpoints';
import Event from '../../../../components/Event';
import Tag from '../../../../components/Tap';

const Rehearsal = ({ route }) => {
  const [timeScope, setTimeScope] = useState('upcoming')
  const bandId = route?.params?.bandId;
  const [rehearsals, setRehearsals] = useState([])

  useEffect(() => {
    fetchRehearsals();
  }, [timeScope])

  const fetchRehearsals = async () => {
    try {
      const fetchedRehearsals = await EventEndpoints.listEvents(bandId, timeScope, 'rehearsals');
      setRehearsals(fetchedRehearsals);
    } catch (error) {
      console.error('Error fetching rehearsals:', error);
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingInline: 25 }}>
        <Tag selected={timeScope === 'upcoming'} onPress={() => setTimeScope('upcoming')}>Próximos</Tag>
        <Tag selected={timeScope === 'past'} onPress={() => setTimeScope('past')}>Pasados</Tag>
      </View>
      {/* REHEARSALS LIST */}
      <View style={{ marginTop: -10}}>
        <FlatList 
          data={rehearsals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Event event={item} />
          )}
          scrollEnabled={false}
          contentContainerStyle={{ padding: 25, gap: 15, alignItems: 'center' }}
          ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay ensayos para mostrar</Text>}
        />
      </View>
    </ScrollView>
  );
}

export default Rehearsal;
