import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
//import messaging from '@react-native-firebase/messaging';

const FirebaseMessaging = () => {
  const [deviceToken, setDeviceToken] = useState(null);

  // useEffect(() => {
  //   const getFCMToken = async () => {
  //     try {
  //       const token = await messaging().getToken();
  //       console.log('FCM Token:', token);
  //       setDeviceToken(token);
  //     } catch (error) {
  //       console.error('Error fetching FCM registration token:', error);
  //       Alert.alert('Error', 'Failed to fetch FCM registration token.');
  //     }
  //   };

  //   getFCMToken();
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FCM Registration Token:</Text>
      {deviceToken ? (
        <Text style={styles.token}>{deviceToken}</Text>
      ) : (
        <Text>Fetching FCM token...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  token: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: 'RobotoMono-Bold',
    marginTop: 10,
  },
});

export default FirebaseMessaging;
