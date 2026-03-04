import { Text, View } from 'react-native';

const Repertoire = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', fontFamily: 'Oswald_300' }}>
          Esta funcionalidad no está aún disponible.
          {'\n'}Estamos trabajando para incluirla próximamente en la aplicación.
        </Text>
      </View>
    </View>
  );
}

export default Repertoire;