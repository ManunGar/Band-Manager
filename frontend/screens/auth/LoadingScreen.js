import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const LoadingScreen = ({ loadingText }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111827" />
      <Text style={styles.text}>{loadingText || 'Procesando...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#111827',
  },
});

export default LoadingScreen;
