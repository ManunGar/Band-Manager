import { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import * as GlobalStyle from '../../GlobalStyle';

const LoadingScreen = () => {
  const {loadingText} = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{loadingText}</Text>
      <ActivityIndicator size="large" color={GlobalStyle.blue} />
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
    fontFamily: 'BebasNeue',
    fontSize: 30,
    marginBottom: 20,
    color: GlobalStyle.blue,
  },
});

export default LoadingScreen;
