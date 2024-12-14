import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const TokenScreen = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [devicePushToken, setDevicePushToken] = useState("");

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
  
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token!");
        return;
      }
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const token2 = (await Notifications.getDevicePushTokenAsync()).data;

      setExpoPushToken(token);
      setDevicePushToken(token2);
      console.log("Expo Push Token:", token);
      console.log("Device Push Token:", token2);
    };

    registerForPushNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DEVICE PUSH Token:</Text>
      {devicePushToken ? (<Text style={styles.token}>{devicePushToken}</Text>) : (<Text>Loading token...</Text>)}
      <Text style={styles.title}>Expo PUSH Token:</Text>
      {expoPushToken ? (
        <Text style={styles.token}>{expoPushToken}</Text>
      ) : (
        <Text>Loading token...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: 'RobotoMono-Bold',
    marginBottom: 20,
  },
  token: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: 'RobotoMono-Bold',
    marginTop: 10,
  },
});

export default TokenScreen;
