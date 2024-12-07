import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';

const FirebaseMessaging = () => {
  const [deviceToken, setDeviceToken] = useState(null);

  useEffect(() => {
    const requestPermissionsAndGetToken = async () => {
      try {
        // Yêu cầu quyền trên iOS
        if (Platform.OS === 'ios') {
          await messaging().requestPermission();
        }

        // Lấy device token
        const token = await messaging().getToken();
        console.log('Device Token:', token);
        setDeviceToken(token);
      } catch (error) {
        console.error('Error getting device token:', error);
      }
    };

    const handleForegroundNotification = async (remoteMessage) => {
      console.log('Notification received in foreground:', remoteMessage);

      // Hiện thông báo tùy chỉnh sử dụng notifee
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        android: {
          channelId: 'default', // Đảm bảo channelId tồn tại
          importance: AndroidImportance.HIGH,
        },
      });
    };

    const setupNotificationListeners = () => {
      // Lắng nghe thông báo khi ứng dụng đang chạy ở foreground
      const unsubscribeForeground = messaging().onMessage(handleForegroundNotification);

      // Xử lý khi thông báo được bấm
      const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage);
        Alert.alert(
          'Notification Clicked',
          remoteMessage.notification?.title || 'No Title',
        );
      });

      // Xử lý khi ứng dụng được mở do nhấn vào thông báo khi đã bị kill
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notification caused app to open from quit state:', remoteMessage);
            Alert.alert(
              'Notification Clicked',
              remoteMessage.notification?.title || 'No Title',
            );
          }
        });

      return () => {
        unsubscribeForeground();
        unsubscribeNotificationOpened();
      };
    };

    // Khởi tạo
    requestPermissionsAndGetToken();
    const unsubscribeListeners = setupNotificationListeners();

    // Cleanup khi component unmount
    return () => unsubscribeListeners();
  }, []);

  // Tạo channel cho Android (bắt buộc nếu dùng notifee)
  useEffect(() => {
    const createChannel = async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    };

    createChannel();
  }, []);

  return (
    <View>
      <Text>Firebase Messaging</Text>
      {deviceToken ? (
        <Text>Device Token: {deviceToken}</Text>
      ) : (
        <Text>Fetching Device Token...</Text>
      )}
    </View>
  );
};

export default FirebaseMessaging;
