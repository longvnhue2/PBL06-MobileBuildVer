import React, {useState, useEffect} from "react";
import {Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import PlanContent from "../components/PlanContent";
import Icon from 'react-native-vector-icons/FontAwesome';
import PlanRecommendContent from "../components/PlanRecommendContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from "../../IPHelper";
import SearchBar from "../components/SearchBar";
import { useColor } from "../context/ColorContext";

const MyPlanScreen = ({navigation}) => {
    const {selectedColor} = useColor()
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 

    const [PlanData2, setPlanData2] = useState([]);
    const [exercisePlanData, setExercisePlanData] = useState([]);
    const [PlanData, setPlanData] = useState([]);
    const [currentUser, setCurrentUser] = useState(0);
    const [isRefresh, setIsRefresh] = useState(false);
    const [filterPlan, setFilterPlan] = useState([])


    useFocusEffect(
      React.useCallback(() => {
        const checkAuth = async () => {
          const token = await AsyncStorage.getItem('accessToken');

          if (token) {
            setIsLogin(true);
            setUsername(await AsyncStorage.getItem('username') || '');
            try {
              const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
              const userId = accountResponse.data.id;
              setCurrentUser(userId);
              console.log(userId);
              const responsePLAN = await axios.get(`${BASE_URL}/api/plans/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log(responsePLAN.data.length);

              const responseExercise_Plans = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const responseDate_Plan = await axios.get(`${BASE_URL}/api/date-plans/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const plansWithExerciseCount = responseDate_Plan.data.reduce((acc, datePlan) => {
                const matchingExercises = responseExercise_Plans.data.filter(exercisePlan => exercisePlan.datePlanId === datePlan.id);

                if (!acc[datePlan.planId]) {
                  acc[datePlan.planId] = 0;
                }

                acc[datePlan.planId] += matchingExercises.length;

                return acc;
              }, {});

              console.log(plansWithExerciseCount);

              const GetPLAN = responsePLAN.data.map((data) => ({
                id: data.id,
                title: data.name,
                status: data.status,
                total_day: data.totalDays,
                rating: data.rating,
                subtitle1: `${plansWithExerciseCount[data.id] || 0} exercises`,
                iconName: 'rocket',
                userId: data.userId,
              }));

              setPlanData(GetPLAN);
              setFilterPlan(GetPLAN)

              // const planInstanceResponse = await axios.get(`${BASE_URL}/api/plan-instances/all`, {
              //   headers: {
              //     Authorization: `Bearer ${token}`,
              //   },
              // });

              // const responseExercise_PlansInstance = await axios.get(`${BASE_URL}/api/exercise-plan-instances/all`, {
              //   headers: {
              //     Authorization: `Bearer ${token}`,
              //   },
              // });

              // const responseDate_PlanInstance = await axios.get(`${BASE_URL}/api/date-plan-instances/all`, {
              //   headers: {
              //     Authorization: `Bearer ${token}`,
              //   },
              // });

              // const plansWithExerciseCount2 = responseDate_PlanInstance.data.reduce((acc, datePlan) => {
              //   const matchingExercises = responseExercise_PlansInstance.data.filter(exercisePlan => exercisePlan.datePlanInstanceId === datePlan.id);

              //   if (!acc[datePlan.planInstanceId]) {
              //     acc[datePlan.planInstanceId] = 0;
              //   }

              //   acc[datePlan.planInstanceId] += matchingExercises.length;

              //   return acc;
              // }, {});
              // console.log(plansWithExerciseCount2);

              const GETPLANinstance = responsePLAN.data
                .filter((data) => data.userId === userId) 
                .map((data) => ({
                    id: data.id,
                    title: data.name,
                    subtitle1: data.status,
                    subtitle2: `${plansWithExerciseCount[data.id] || 0} exercises`,
                    iconName: 'linux',
                    totalDays: data.totalDays || 0,
                    description: data.description
              }));
              setPlanData2(GETPLANinstance);
            } catch (err) {
              console.log(err);
            }
          } else {
            navigation.navigate('LoginScreen');
          }
          setLoading(false);
        };

        checkAuth();
      }, [navigation, isRefresh]) 
    );

    const handleChangeInputSearch = (text) => {
      setPlanData(filterPlan)
      setPlanData(filterPlan.filter((plan) => plan.title.toLowerCase().includes(text.toLowerCase())))
    };

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
                name='MyPlan'
                />


            <ScrollView contentContainerStyle={styles.bodyContent}>
                {/* <View style={styles.titleContainer1}>
                    <Text style={styles.titleText}>My Plan:</Text>
                    <TouchableOpacity style={styles.buttonTitle} onPress={() => navigation.navigate('DateIndicatorPlan')}>
                        <Text style={styles.buttonText}>+ Create a custom Plan</Text>
                    </TouchableOpacity>
                </View>

                <View style={{marginBottom: 20}}>
                    {PlanData2.map((plan, index) => (
                        <PlanContent
                            key={index}
                            planID={plan.id}
                            navigation={navigation}
                            title={plan.title}
                            subtitle1={plan.subtitle1}
                            subtitle2={plan.subtitle2}
                            avgrating={plan.rating}
                            iconName={plan.iconName}
                            setIsRefresh={setIsRefresh}
                            totalDays={plan.totalDays}
                            description={plan.description}
                
                        />
                    ))}
                </View> */}

                <View style={styles.titleContainer2}>
                  <Text style={styles.titleText}>Public Plan List</Text>
                  {/* <TouchableOpacity 
                      style={styles.buttonTitle}
                  >
                      <Text style={styles.titleText}>Beginner</Text>
                  </TouchableOpacity> */}

                  <SearchBar
                    placeholder="Plan name ..."
                    onChange={handleChangeInputSearch}
                  />
                  
                </View>
                
                <View style={{ marginBottom: 20, marginTop: 20 }}>
                  {PlanData.filter((plan) => 
                      plan.status === 'PUBLIC' || 
                      ((plan.status === 'PRIVATE' || plan.status === 'PENDING') && plan.userId === currentUser)
                  ).map((plan, index) => (
                      <PlanRecommendContent
                          key={index}
                          navigation={navigation}
                          id={plan.id}
                          totalDays={plan.total_day}
                          title={plan.title}
                          subtitle1={plan.subtitle1}
                          subtitle2={plan.subtitle2}
                          avgrating={plan.rating}
                          iconName={plan.iconName}
                      />
                  ))}
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
        backgroundColor: 'rgb(34,50,52)',
    },
    bodyContent: {
        flexGrow: 1,
        paddingBottom: 100, 
    },
    titleText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 15,
    },
    titleContainer2:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4%',
        marginTop: '4%',
    },
    titleContainer1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: '4%',
    },
    buttonTitle: {
        width: 250,
        height: 50,
        borderWidth: 2, 
        borderColor: 'white', 
        borderRadius: 6,
        backgroundColor: 'rgb(34,50,52)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 22,
        fontWeight: '400',
        color: '#fff',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});

export default MyPlanScreen;