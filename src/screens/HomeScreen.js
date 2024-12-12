import React from "react";
import { Text, StyleSheet, View, Button} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const HomeScreen = (props) => {
  return <ScrollView>
    <Text style={styles.text}>HomeScreen</Text>
    <Button title="???" onPress={() => props.navigation.navigate('testingNavi')}/>
    <Button title="Login Screen" onPress={() => props.navigation.navigate('LoginScreen')}/>
    <Button title="Workout Exercise 1" onPress={() => props.navigation.navigate('Workout1')}/>
    <Button title="Workout Exercise List" onPress={() => props.navigation.navigate('WorkoutExerciseList')}/>
    <Button title="Home" onPress={() => props.navigation.navigate('HomieScr')}/>
    <Button title="Exercise Details" onPress={() => props.navigation.navigate('ExerciseDetails')}/>
    <Button title="CustomPlan" onPress={() => props.navigation.navigate('CustomPlan')}/>
    <Button title="Plan" onPress={() => props.navigation.navigate('Plan')}/>
    <Button title="My Plan" onPress={() => props.navigation.navigate('MyPlan')}/>
    <Button title="Progress" onPress={() => props.navigation.navigate('Progress')}/>
    <Button title="Progress Calendar" onPress={() => props.navigation.navigate('ProgressCalendar')}/>
    <Button title="Muscle" onPress={() => props.navigation.navigate('MuscleGroup')}/>
    <Button title="ExerciseType" onPress={() => props.navigation.navigate('ExerciseType')}/>
    <Button title="Date Indicator Plan" onPress={() => props.navigation.navigate('DateIndicatorPlan')}/>
    <Button title="Register" onPress={() => props.navigation.navigate('SignUp')}/>
    <Button title="Profile" onPress={() => props.navigation.navigate('Profile')}/>
    <Button title="Welcome" onPress={() => props.navigation.navigate('Welcome')}/>
    <Button title="Token" onPress={() => props.navigation.navigate('Token')}/>
    <Button title="FCMTokenTesting" onPress={() => props.navigation.navigate('FCMTokenTesting')}/>
    <Button title="RecustomizePlan" onPress={() => props.navigation.navigate('RecustomizePlan')}/>
    <Button title="CustomPlanEditing" onPress={() => props.navigation.navigate('CustomPlanEditing')}/>
    <Button title="PlanPortal" onPress={() => props.navigation.navigate('PlanPortal')}/>
    <Button title="Insight" onPress={() => props.navigation.navigate('InsightScreen')}/>
  </ScrollView>
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
  },
});

export default HomeScreen;
