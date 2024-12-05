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




const MyPlanScreen = ({navigation}) => {
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 

    const [PlanData2, setPlanData2] = useState([]);
    const [exercisePlanData, setExercisePlanData] = useState([]);
    const [PlanData, setPlanData] = useState([]);


    useFocusEffect(
      React.useCallback(() => {
        const checkAuth = async () => {
          const token = await AsyncStorage.getItem('accessToken');

          if (token) {
            setIsLogin(true);
            setUsername(await AsyncStorage.getItem('username') || '');
            try {
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
              }));

              setPlanData(GetPLAN);

              const planInstanceResponse = await axios.get(`${BASE_URL}/api/plan-instances/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const responseExercise_PlansInstance = await axios.get(`${BASE_URL}/api/exercise-plan-instances/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const responseDate_PlanInstance = await axios.get(`${BASE_URL}/api/date-plan-instances/all`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const plansWithExerciseCount2 = responseDate_PlanInstance.data.reduce((acc, datePlan) => {
                const matchingExercises = responseExercise_PlansInstance.data.filter(exercisePlan => exercisePlan.datePlanInstanceId === datePlan.id);

                if (!acc[datePlan.planInstanceId]) {
                  acc[datePlan.planInstanceId] = 0;
                }

                acc[datePlan.planInstanceId] += matchingExercises.length;

                return acc;
              }, {});
              console.log(plansWithExerciseCount2);

              const GETPLANinstance = planInstanceResponse.data.map((data) => ({
                id: data.id,
                title: data.name,
                subtitle1: data.status,
                subtitle2: `${plansWithExerciseCount2[data.id] || 0} exercises`,
                iconName: 'rocket'
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
      }, [navigation]) 
    );
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Header1 
                title="Workout" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='MyPlan'
                />


            <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.titleContainer1}>
                    <Text style={styles.titleText}>My Plan:</Text>
                    <TouchableOpacity style={styles.buttonTitle} onPress={() => navigation.navigate('DateIndicatorPlan')}>
                        <Text style={styles.buttonText}>+ Create Plan</Text>
                    </TouchableOpacity>
                </View>

                <View style={{marginBottom: 20}}>
                    {PlanData2.map((plan, index) => (
                        <PlanContent
                            key={index}
                            navigation={navigation}
                            title={plan.title}
                            subtitle1={plan.subtitle1}
                            subtitle2={plan.subtitle2}
                            avgrating={plan.rating}
                            iconName={plan.iconName}
                        />
                    ))}
                </View>

                <View style={styles.titleContainer2}>
                    <Text style={styles.titleText}>Recommend</Text>
                    <TouchableOpacity 
                        style={styles.buttonTitle}
                    >
                        <Text style={styles.titleText}>Beginner</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{marginBottom: 20, marginTop: 20}}>
                    {PlanData.map((plan, index) => (
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
        marginTop: 10,
        alignItems: 'center',
    },
    titleContainer1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: '4%',
    },
    buttonTitle: {
        width: 150,
        height: 50,
        borderWidth: 2, 
        borderColor: 'white', 
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



// const quickFetchRating = async () => {
    //     try{
    //         const responsePLAN = await axios.get(`${BASE_URL}/api/plans/all`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         const responseExercise_Plans = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         const GetPLAN = responsePLAN.data.map((data) => ({
    //             id: data.id,
    //             title: data.name,
    //             status: data.status,
    //             total_day : data.totalDays,
    //             rating : data.rating,  
    //             iconName: 'rocket'
    //         }));
    //         const getExercisePlan = responseExercise_Plans.data.map((data) => ({
    //             id: data.id,
    //             planID: data.plan.id,
    //             exerciseID: data.exercise.id
    //         }));
    //         setPlanData(GetPLAN);

    //         //HANDLE number of exercise each plan
    //         setExercisePlanData(getExercisePlan);
    //         const updatedPlanData = calculateExerciseCount(GetPLAN, getExercisePlan);
    //         setPlanData(updatedPlanData);

    //     }
    //     catch(err){
    //         console.log(err);
    //     }
    // }
    // const PlanData = [
    //     {
    //         title:'Leg Plan',
    //         subtitle1:'5 exercise',
    //         subtitle2:'(Start in 3 day!)',
    //         iconName:'rocket',
    //     },
    //     {
    //         title:'Shoulder',
    //         subtitle1:'',
    //         subtitle2:'(Start in 1 day!)',
    //         iconName:'twitter',
    //     },
    //     {
    //         title:'Chest Plan',
    //         subtitle1:'3 exercise',
    //         subtitle2:'',
    //         iconName:'stack-overflow',
    //     },
        

    // ];

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
    //       refresh();
    //     });
    //     return unsubscribe;
    //   }, [navigation]);


    // useEffect(() => {
    //     const checkAuth = async () => {
    //         const token = await AsyncStorage.getItem('accessToken');
            
    //         if (token) {
    //             setIsLogin(true);
    //             setUsername(await AsyncStorage.getItem('username') || '');
    //             try{
    //                 const responsePLAN = await axios.get(`${BASE_URL}/api/plans/all`, {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 });
    //                 console.log(responsePLAN.data.length);
    //                 const responseExercise_Plans = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 });

    //                 const responseDate_Plan = await axios.get(`${BASE_URL}/api/date-plans/all`, 
    //                     {
    //                         headers: {
    //                             Authorization: `Bearer ${token}`,
    //                         },
    //                     },
    //                 );

    //                 const plansWithExerciseCount = responseDate_Plan.data.reduce((acc, datePlan) => {
    //                     const matchingExercises = responseExercise_Plans.data.filter(exercisePlan => exercisePlan.datePlanId === datePlan.id);
             
    //                     if (!acc[datePlan.planId]) {
    //                         acc[datePlan.planId] = 0;
    //                     }
     
    //                     acc[datePlan.planId] += matchingExercises.length;
                        
    //                     return acc;
    //                 }, {});
                    

    //                 console.log(plansWithExerciseCount);
                    
    //                 const GetPLAN = responsePLAN.data.map((data) => ({
    //                     id: data.id,
    //                     title: data.name,
    //                     status: data.status,
    //                     total_day : data.totalDays,
    //                     rating: data.rating,  
    //                     subtitle1: `${plansWithExerciseCount[data.id] || 0} exercies`,
    //                     iconName: 'rocket'
    //                 }));

                    

    //                 // const getExercisePlan = responseExercise_Plans.data.map((data) => ({
    //                 //     id: data.id,
    //                 //     planID: data.plan.id,
    //                 //     exerciseID: data.exercise.id
    //                 // }));
    //                 setPlanData(GetPLAN);

    //                 //HANDLE number of exercise each plan
    //                 // setExercisePlanData(getExercisePlan);
    //                 // const updatedPlanData = calculateExerciseCount(GetPLAN, getExercisePlan);

    //             }
    //             catch(err){
    //                 console.log(err);
    //             }
    //         }
    //         else{
    //             navigation.navigate('LoginScreen');
    //         }
    //         setLoading(false);
    //     };
    //     checkAuth();
    // }, [navigation]);