import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColor } from "../context/ColorContext";
const ExerciseTypeScreen = ({ navigation }) => {
  const {selectedColor} = useColor();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); 


  useEffect(() => {
    const checkAuth = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        
        if (token) {
            setIsLogin(true);
            setUsername(await AsyncStorage.getItem('username') || '');
        }
        else{
            navigation.navigate('LoginScreen');
        }
        setLoading(false);
    };
    checkAuth();
  }, [navigation]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={[styles.container, {backgroundColor: selectedColor}]}>
      <Header1 
                title="Workout" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='ExerciseType'
                />

      <ScrollView contentContainerStyle={styles.bodyContent}>
        <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.muscleGroup} onPress={() => navigation.navigate('WorkoutExerciseList', {attribute: 'weight'})}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="weight-lifter" size={60} color="#fff" />
          </View>
          <Text style={styles.muscleText}>Weight</Text>
        </TouchableOpacity>
        <View style={styles.row2}>
          <TouchableOpacity style={styles.muscleGroup} onPress={() => navigation.navigate('WorkoutExerciseList', {attribute: 'height'})}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="human-male-height-variant" size={60} color="#fff" />
            </View>
            <Text style={styles.muscleText}>Height</Text>
          </TouchableOpacity>
          <View style={{marginVertical:'10%', flexDirection:'row'}}>
            
          <FontAwesome5 name='biking' size={50} color='#fff'/>
          <Text>         </Text>
          <FontAwesome5 name='skating' size={50} color='#fff'/>      
          </View>
          <TouchableOpacity style={styles.muscleGroup} onPress={() => navigation.navigate('WorkoutExerciseList', {attribute: 'waist'})}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="human-handsup" size={60} color="#fff" />
            </View>
            <Text style={styles.muscleText}>Waist</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row3}>
          <TouchableOpacity style={styles.muscleGroup} onPress={() => navigation.navigate('WorkoutExerciseList', {attribute: 'shoulder'})}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-star" size={60} color="#fff" />
            </View>
            <Text style={styles.muscleText}>Shoulders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.muscleGroup} onPress={() => navigation.navigate('WorkoutExerciseList', {attribute: 'forearms'})}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="arm-flex-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.muscleText}>Forearms</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Footer1 navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(25,20,50)",
  },
  bodyContent: {
    paddingBottom: 100,
  },

  rowContainer: {
    marginTop: 30,
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop:'10%',
    flex:1
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  muscleGroup: {
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  muscleText: {
    fontSize: 25,
    fontWeight: "bold",
    fontStyle:'italic',
    color: "#fff",
  },
  row2:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: '10%'
  },
  row3:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: '20%',
    marginTop: '5%'
  }
});

export default ExerciseTypeScreen;
