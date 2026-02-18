import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import EventEndpoints from '../../../../api/EventEndpoints';
import Event from '../../../../components/Event';
import Tag from '../../../../components/Tap';

const Performances = ({ route }) => {
  const [timeScope, setTimeScope] = useState('upcoming')
  const bandId = route?.params?.bandId;
  const [performances, setPerformances] = useState([])

  useEffect(() => {
    fetchPerformances();
  }, [timeScope])

  const fetchPerformances = async () => {
    try {
      const fetchedPerformances = await EventEndpoints.listEvents(bandId, timeScope, 'performances');
      setPerformances(fetchedPerformances);
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingInline: 25 }}>
        <Tag selected={timeScope === 'upcoming'} onPress={() => setTimeScope('upcoming')}>Próximos</Tag>
        <Tag selected={timeScope === 'past'} onPress={() => setTimeScope('past')}>Pasados</Tag>
      </View>
      {/* PERFORMANCES LIST */}
      <View style={{ marginTop: -10}}>
        <FlatList 
          data={performances}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Event event={item} />
          )}
          scrollEnabled={false}
          contentContainerStyle={{ padding: 25, gap: 15, alignItems: 'center' }}
          ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay actuaciones para mostrar</Text>}
        />
      </View>
    </ScrollView>
  );
}

export default Performances;
