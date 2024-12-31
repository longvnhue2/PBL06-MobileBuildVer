import registerNNPushToken from "native-notify";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { AppState } from 'react-native';

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import testingNavi from "./src/screens/testingNavi";
import LoginScreen from "./src/screens/Login";
import WorkoutExercise1 from "./src/screens/WorkoutExercise1";
import WorkoutExerciseList from "./src/screens/WorkoutExerciseList";
import HomieScr from "./src/screens/HomieScr";
import ExerciseDetails from "./src/screens/ExerciseDetails";
import CustomPlanScreen from "./src/screens/CustomPlanScreen";
import PlanScreen from "./src/screens/PlanScreen";
import MyPlanScreen from "./src/screens/MyPlanScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProgressCalendar from "./src/screens/ProCalendarScreen";
import ExerciseTypeScreen from "./src/screens/ExerciseTypeScreen";
import DateIndicatorPlanScreen from "./src/screens/DateIndicatorPlanScreen";
import ForgotPasswordScreen from "./src/screens/PwForgottenScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import Profile from "./src/screens/Profile";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import PostExerciseScreen from "./src/screens/PostExerciseScreen";
import FirebaseMessaging from "./src/screens/FCMTokenTesting";
import TokenScreen from "./src/screens/TokenTesting";
import WorkoutExerciseListForCustom from "./src/screens/WorkoutExerciseListForCustom";
import RecustomizePlanScreen from "./src/screens/RecustomizePlanScreen";
import CustomPlanEditingScreen from "./src/screens/CustomPlanEditingScreen";
import { ColorProvider } from "./src/context/ColorContext";
import PlanPortal from "./src/screens/PlanPortal";
import InsightScreen from "./src/screens/InsightScreen";
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import WorkoutPlanScreen from "./src/screens/WorkoutPlanScreen";
import ProgessListScreen from "./src/screens/ProgressListScreen";
const Stack = createStackNavigator();



const fetchFonts = () => {
  return Font.loadAsync({
    'RobotoMono-Bold': require('./assets/font/RobotoMono-Bold.ttf'),
    'DancingScript-Bold': require('./assets/font/DancingScript-Bold.ttf'),
  });
};



export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const initial = async () => {
      await AsyncStorage.setItem('state', 'false'); 
    }
    const handleAppStateChange = async (nextAppState) => {
        if (nextAppState !== 'active') {
            try {
                await AsyncStorage.clear();  
                await AsyncStorage.setItem('state', 'false'); 
                await AsyncStorage.setItem('firstPress', JSON.stringify(true));
                console.log('AsyncStorage cleared on app exit');
            } catch (error) {
                console.error('Error clearing AsyncStorage:', error);
            }
        }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    initial();
    return () => {
        subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={(err) => console.log(err)}
      />
    );
  }
  // const [expoPushToken, setExpoPushToken] = useState("");
  // const [devicePushToken, setDevicePushToken] = useState("");
  //registerNNPushToken(25168, 'H1LtryGkC8bF1EsGqmLAfK');

  // useEffect(() => {
  //   const notificationListener = Notifications.addNotificationReceivedListener(notification => {
  //     console.log("Notification received:", notification);
  //   });

  //   const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log("Notification clicked:", response);
  //   });

  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener);
  //     Notifications.removeNotificationSubscription(responseListener);
  //   };
  // }, []);

  // useEffect(() => {
  //   const registerForPushNotifications = async () => {
  //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;

  //     if (existingStatus !== "granted") {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }

  //     if (finalStatus !== "granted") {
  //       alert("Failed to get push token!");
  //       return;
  //     }
  //     const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  //     const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  //     const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;

  //     setExpoPushToken(expoToken);
  //     setDevicePushToken(deviceToken);

  //     console.log("Expo Push Token:", expoToken);
  //     console.log("Device Push Token:", deviceToken);
  //     await AsyncStorage.setItem("expoPushToken", expoToken);
  //     await AsyncStorage.setItem("devicePushToken", deviceToken);
  //   };

  //   registerForPushNotifications();
  // }, []);

  

  return (
    <ColorProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="testingNavi" component={testingNavi} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Workout1" component={WorkoutExercise1} />
          <Stack.Screen name="WorkoutExerciseList" component={WorkoutExerciseList} />
          <Stack.Screen name="HomieScr" component={HomieScr} />
          <Stack.Screen name="ExerciseDetails" component={ExerciseDetails} />
          <Stack.Screen name="CustomPlan" component={CustomPlanScreen} />
          <Stack.Screen name="Plan" component={PlanScreen} />
          <Stack.Screen name="MyPlan" component={MyPlanScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="ProgressCalendar" component={ProgressCalendar} />
          <Stack.Screen name="ExerciseType" component={ExerciseTypeScreen} />
          <Stack.Screen name="DateIndicatorPlan" component={DateIndicatorPlanScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PostExercise" component={PostExerciseScreen} />
          <Stack.Screen name="Token" component={TokenScreen} />
          <Stack.Screen name="FCMTokenTesting" component={FirebaseMessaging} />
          <Stack.Screen name="WorkoutExerciseCustom" component={WorkoutExerciseListForCustom} />
          <Stack.Screen name="RecustomizePlan" component={RecustomizePlanScreen} />
          <Stack.Screen name="CustomPlanEditing" component={CustomPlanEditingScreen} />
          <Stack.Screen name="PlanPortal" component={PlanPortal} />
          <Stack.Screen name="InsightScreen" component={InsightScreen} />
          <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
          <Stack.Screen name="ProgressList" component={ProgessListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ColorProvider>
  );
}
