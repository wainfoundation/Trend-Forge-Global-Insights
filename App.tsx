import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://192.168.1.14:3000/api/greeting') // <-- use your PC local IP here
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error('Fetch error:', error);
        setMessage('Failed to fetch from server');
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
  },
});
