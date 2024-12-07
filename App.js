import registerNNPushToken from "native-notify";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { ColorProvider } from "./src/context/ColorContext";

// Constants and helper function for token expiration check
const ACCESS_TOKEN_KEY = "accessToken";
const EXPIRATION_TIME = 6 * 60 * 60 * 1000;

const checkAndDeleteTokenIfExpired = async () => {
  try {
    const tokenData = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (tokenData) {
      const { token, expirationTime } = JSON.parse(tokenData);
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        console.log("Token is expired");
      } else {
        console.log("Token is ok");
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// Create the stack navigator using @react-navigation/stack
const Stack = createStackNavigator();

export default function App() {
  registerNNPushToken(25168, 'H1LtryGkC8bF1EsGqmLAfK');
  useEffect(() => {
    checkAndDeleteTokenIfExpired();
  }, []);

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
        </Stack.Navigator>
      </NavigationContainer>
    </ColorProvider>
  );
}
