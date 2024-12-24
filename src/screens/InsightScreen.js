import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header1 from '../components/Header1'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Progresstabs from '../components/ProgressTabs'
import Footer1 from '../components/Footer1'
import { useColor } from '../context/ColorContext'
import PlanContent from '../components/PlanContent'
import axios from 'axios'
import BASE_URL from '../../IPHelper'
import SearchBar from '../components/SearchBar'
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useFocusEffect } from '@react-navigation/native'


const InsightScreen = (props) => {
    const { navigation } = props
    const {selectedColor} = useColor()
    const username = AsyncStorage.getItem('username')
    const [inputText, setInputText] = useState('');

    const [planData, setPlanData] = useState([]);
    const [filterPlan, setFilterPlan] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [devicePushToken, setDevicePushToken] = useState("");
    const [expoPushToken, setExpoPushToken] = useState("");


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

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const accessToken = await AsyncStorage.getItem('accessToken');
    
                try {
                    const { data: getAccount } = await axios.get(`${BASE_URL}/api/account`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
    
                    const { data: getPlanData } = await axios.get(`${BASE_URL}/api/plans/all?userId.equals=${getAccount.id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
    
                    const responseDate_Plan = await axios.get(`${BASE_URL}/api/date-plans/all`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
    
                    const responseExercise_Plans = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
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
    
                    const PlanData = getPlanData.map(data => ({
                        id: data.id,
                        title: data.name,
                        subtitle1: data.status,
                        subtitle2: `${plansWithExerciseCount[data.id] || 0} exercises`,
                        iconName: 'linux',
                        totalDays: data.totalDays || 0,
                        description: data.description,
                        status: data.status
                    }));
    
                    setPlanData(PlanData);
                    setFilterPlan(PlanData);
                } catch (error) {
                    console.error("Error getting plan:", error);
                }
            };
            fetchData();
            return () => {
                setPlanData([]);
                setFilterPlan([]);
            };
        }, [isRefresh]) 
    );

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const accessToken = await AsyncStorage.getItem('accessToken')

    //         try {
    //             const { data: getAccount } = await axios.get(`${BASE_URL}/api/account`, {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`
    //                 }
    //             })

    //             const { data: getPlanData } = await axios.get(`${BASE_URL}/api/plans/all?userId.equals=${getAccount.id}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`
    //                 }
    //             });
                

    //             const responseDate_Plan = await axios.get(`${BASE_URL}/api/date-plans/all`, {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                 },
    //             });

    //             const responseExercise_Plans = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
    //             headers: {
    //               Authorization: `Bearer ${accessToken}`,
    //             },
    //           });

    //             const plansWithExerciseCount = responseDate_Plan.data.reduce((acc, datePlan) => {
    //                 const matchingExercises = responseExercise_Plans.data.filter(exercisePlan => exercisePlan.datePlanId === datePlan.id);

    //                 if (!acc[datePlan.planId]) {
    //                 acc[datePlan.planId] = 0;
    //                 }

    //                 acc[datePlan.planId] += matchingExercises.length;

    //                 return acc;
    //             }, {});

    //             const PlanData = getPlanData.map(data => ({
    //                 id: data.id,
    //                 title: data.name,
    //                 subtitle1: data.status,
    //                 subtitle2: `${plansWithExerciseCount[data.id] || 0} exercises`,
    //                 iconName: 'linux',
    //                 totalDays: data.totalDays || 0,
    //                 description: data.description,
    //                 status: data.status
    //             }));

    //             setPlanData(PlanData);
    //             setFilterPlan(PlanData);
    //         }
    //         catch (error){
    //             console.error("Error getting plan:", error)
    //         }
    //     }
    //     fetchData();
    // }, [navigation, isRefresh])

    const handleChangeInputSearch = (text) => {
      setPlanData(filterPlan)
      setPlanData(filterPlan.filter((plan) => plan.title.toLowerCase().includes(text.toLowerCase())))
    };

    return (
        <View style={[styles.container, {backgroundColor: selectedColor}]}>
            <Header1 
                title="Insight" 
                navigation={navigation}
                isLogin={true} 
                username={username} 
                name='InsightScreen'
            />

            <Progresstabs navigation={navigation} target="Insight" />

            <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.titleContainer1}>
                    <Text style={styles.titleText}>My Plan:</Text>
                    <TouchableOpacity style={styles.buttonTitle} onPress={() => navigation.navigate('DateIndicatorPlan')}>
                        <Text style={styles.buttonText}>+ Create a custom Plan</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    {/* <SearchBar
                        placeholder="Name ..."
                        onChange={handleChangeInputSearch}
                    /> */}
                </View>

                <View style={{marginBottom: 20}}>
                    {planData.map((plan, index) => (
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
                            devicePushToken={devicePushToken}
                            status={plan.status}
                        />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        paddingHorizontal: '4%',
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
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: '4%',
        marginBottom: 20
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
})

export default InsightScreen