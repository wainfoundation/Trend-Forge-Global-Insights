import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Use your local IP here instead of 127.0.0.1
    fetch('http://192.168.0.123:3000/api/greeting')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error(err);
        setMessage('Failed to fetch');
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
