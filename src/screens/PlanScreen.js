import React, { useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, FlatList, ActivityIndicator, Animated, Easing, TextInput, Alert, Image, ImageBackground, Button, ToastAndroid } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import ExerciseContent from "../components/ExerciseContent";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import CommentCard from "../components/CommentCard";
import { useColor } from "../context/ColorContext";


const PlanScreen = ({ navigation, route }) => {
    const {selectedColor} = useColor()
    const [visibleItems, setVisibleItems] = useState(3); 
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const animation = useRef(new Animated.Value(0)).current; 

    const toggleFeedbackZone = () => {
        setIsFeedbackVisible(!isFeedbackVisible);
        Animated.timing(animation, {
            toValue: isFeedbackVisible ? 0 : 1, 
            duration: 300,
            useNativeDriver: false,
        }).start();
    };


    const feedbackHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['8%', '80%'], 
    });

    const toggleItems = () => {
        if (visibleItems >= cmtData.length) {
            setVisibleItems(3);
        } else {
            setVisibleItems(prev => prev + 3); 
        }
    };
    const [idCMT, setIDCMT] = useState(0);
    const [typeFeedback, setTypeFeedback] = useState('');
    const [modalNotiVisible, setModalNotiVisible] = useState(false);
    const [CMTmodalVisible, setCMTmodalVisible] = useState(false);
    const [rating, setRating] = useState(0); 
    const [comment, setComment] = useState(''); 
    const [cmtData, setCMTData] = useState([]);
    const totalDays = route.params?.totalDays;
    const planID = route.params?.planID;
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const [modalVisible, setModalVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [numDay, setNumday] = useState(0);
    const [userId, setUserId] = useState(0);
    const [accessToken, setAccessToken] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isCMTable, setIsCMTable] = useState(true);
    const borderColorAnimation = useRef(new Animated.Value(0)).current;
    const [newPlanInstance, setNewPlanInstance] = useState({
        name: '',
        description: '',
        startDate: new Date().toISOString(),
        totalDays: totalDays,
        status: 'IN_PROGRESS',
        deviceToken: '',
        planId: planID
    });

    const [newExercisePlanInstance, setNewExercisePlanInstance] = useState({
        setCount: 0,
        repCount: 0,
        restTime: 0,
        sequence: 0,
        exerciseId: 0,
        datePlanInstanceId: 0,
        exercisePlanId: 0
    })



    useEffect(() => {
        const fetchPlanStatus = async () => {
          try {
            const response = await axios.get(`${BASE_URL}/api/plans/${planID}`, {
              headers: {
                Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
              },
            });
            if (response.data.status === 'PRIVATE') {
              setIsPublic(false); 
            } else if (response.data.status === 'PUBLIC') {
              setIsPublic(true); 
            }
          } catch (error) {
            console.error("Error fetching plan status: ", error);
          }
        };
    
        // Gọi hàm fetchPlanStatus khi component render
        fetchPlanStatus();
      }, [planID]);

    const fetchCMT = async () => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            setAccessToken(token);
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const userId = accountResponse.data.id;
            setUserId(userId);
            const feedbackResponse = await axios.get(`${BASE_URL}/api/feedbacks/all?planId.equals=${planID}`, {
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });

            const userListResponsePUBLIC = await axios.get(`${BASE_URL}/public/api/users/all`);
            const userAvatarMap = userListResponsePUBLIC.data.reduce((map, user) => {
                map[user.id] = user.publicAvatarUrl
                return map;
            }, {});

            
            
            const getFeedBack = feedbackResponse.data.map((data) => {
                const avatarURL = userAvatarMap[data.user.id];
                //console.log(`userId: ${data.user.id}, avatarURL: ${avatarURL}`);
                
                return {
                  id: data.id,
                  comment: data.comment,
                  rating: data.rating,
                  userId: data.user.id,
                  usernameCMT: data.user.username,
                  level: data.user.level,
                  avatarURL: avatarURL,
                  isEditable: (data.userId === userId) ? 1 : 0,
                  visible: 1
                };
              });
              
            
            setCMTData(getFeedBack);
        }
        catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        Animated.loop(
          Animated.timing(borderColorAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear, 
            useNativeDriver: false, 
          })
        ).start();
      }, [borderColorAnimation]);

      const borderColor = borderColorAnimation.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [
            'rgba(255, 0, 0, 0.3)',   
            'rgba(255, 165, 0, 0.45)', 
            'rgba(255, 255, 0, 0.6)', 
            'rgba(0, 255, 0, 0.7)',    
            'rgba(0, 0, 255, 0.85)',   
            'rgba(75, 0, 130, 1)'  
        ], 
    });

    const toggleCMTmodal = () => {
        setTypeFeedback('POST');
        setCMTmodalVisible(!CMTmodalVisible);
    };

    const handleStarPress = (index) => {
        setRating(index + 1); 
    };

    const postComment = async() => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            let responseStatus;
            const userId = accountResponse.data.id;
            const postDATA = {
                comment: comment,
                rating: rating,
                userId: userId,
                planId: planID
            }
            if (typeFeedback === 'POST'){
                const postCMTresponse = await axios.post(`${BASE_URL}/api/feedbacks`, postDATA, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });
                responseStatus = postCMTresponse.status;
            }
            else if (typeFeedback === 'PUT'){
                const putCMTresponse = await axios.put(`${BASE_URL}/api/feedbacks/${idCMT}`, postDATA, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                responseStatus = putCMTresponse.status;
            };
            if (responseStatus >= 200 && responseStatus < 300) {
                setStatusMessage('Successfully posted comment! Please check!');
                await fetchCMT();
                setComment('');
                setRating(0);
            } else if (responseStatus >= 300 && responseStatus < 600) {
                setStatusMessage('Failed to post your comment! Please try again! :(');
                setComment('');
                setRating(0);
            }
            setModalNotiVisible(true);
            setTimeout(() => {
                setModalNotiVisible(false);
              }, 2000);
        }
        catch(err){
            setStatusMessage('An error occurred! Please try again later :(');
            console.error(err);
            setComment('');
            setRating(0);
            setModalNotiVisible(true);
            setTimeout(() => {
                setModalVisible(false);
            }, 2000);
        }
        setCMTmodalVisible(false);
    };
    

    const updateExerciseData = (attributeId, favor) => {
        setExerciseData((prevData) =>
            prevData.map((data) => ({
                ...data,
                visible:
                    (!attributeId || data.attribute_id.includes(attributeId)) &&
                    (!favor || data.isFavorited === 1) ? 1 : 0,
            }))
        );
    };

    const handleFavorite = () => {
        if (!isLogin) {
            navigation.navigate('LoginScreen');
        } else {
            setFavor(!isFavor);
            updateExerciseData(selectedAttribute, !isFavor);
        }
    };


    const [statusCode, setStatusCode] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

   
    const handleFavoriteChange = async (status) => {
        try {
            setStatusCode(status);
            setShowMessage(true); 
            setTimeout(() => {
                setShowMessage(false); 
            }, 1250);
    
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userId = accountResponse.data.id;
    
            const responsePlanList = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const favoriteResponse = await axios.get(`${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const publicExerciseresponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);
            const fullExercises = publicExerciseresponse.data;

            const FavorSET = new Set(favoriteResponse.data.map(fav => fav.exerciseId));
            const fullExerciseNERF = fullExercises.reduce((map, exercise) => {
                map[exercise.id] = {
                    videopath: exercise.publicVideoUrl,
                    imgsrc: exercise.publicImageUrl,
                };
                return map;
            }, {});

            const responseDatePlans = await axios.get(`${BASE_URL}/api/date-plans/all?planId.equals=${planID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const Planlength = Math.max(...responseDatePlans.data.map(plan => plan.dateOrder));
            // console.log(Planlength);
            
            const datePlanIds = responseDatePlans.data.map(plan => plan.id);
            

            const getAllExercisePlan = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            //ANH XA CUA DATE-PLAN, PLAN, EXERCISE-PLAN
            const filteredExercisePlans = getAllExercisePlan.data.filter(exercisePlan => 
                datePlanIds.includes(exercisePlan.datePlanId) 
            );
            
            // console.log(filteredExercisePlans);
            //LAY RA SETS, REPS
            const exercisePlanMap = {};
            getAllExercisePlan.data.forEach(data => {
                const exerciseId = data.exercise?.id;
                if (!exerciseId) {
                    console.error('Missing exerciseId:', data);
                    return;
                }
                if (!exercisePlanMap[exerciseId]) {
                    exercisePlanMap[exerciseId] = [];
                }
                exercisePlanMap[exerciseId].push({ setCount: data.setCount, repCount: data.repCount });
            });

            const getPlanList = filteredExercisePlans.map((data) => {
                const exerciseFallback = fullExerciseNERF[data.exercise.id] || {};
                const datePlan = responseDatePlans.data.find((plan) => plan.id === data.datePlanId) || {};
            
                return {
                    id: data.id,
                    idex: data.exercise.id,
                    propertyDetail: `${data.setCount || 0} sets, ${data.repCount || 0} reps`,
                    setAndRep: exercisePlanMap[data.exercise.id] || {setCount: 0, repCount: 0}, 
                    imgsrc: exerciseFallback.imgsrc,
                    text: data.exercise.name,
                    videopath: exerciseFallback.videopath,
                    description: data.exercise.description,
                    time: datePlan.time || '00:00',     
                    dateOrder: datePlan.dateOrder || 0, 
                    restTime: data.restTime || 8,      
                    isFavorited: FavorSET.has(data.exercise.id) ? 1 : 0,
                };
            });
            
            //console.log(getPlanList);
            


            getPlanList.sort((a, b) => {
                if (a.dateOrder !== b.dateOrder) {
                    return a.dateOrder - b.dateOrder;
                }
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
            
                if (timeA[0] !== timeB[0]) {
                    return timeA[0] - timeB[0]; 
                } else {
                    return timeA[1] - timeB[1]; 
                }
            });
            setNumday(Planlength);
            setExerciseData(getPlanList);
        } catch (err) {
            console.error("Error fetching exercise data:", err);
            ToastAndroid.show('An error occurred, please try again.', ToastAndroid.SHORT);
        }
    };
    
    // const exerciseData = [
    //     {
    //         imgsrc: require('../../assets/dorothy.png'),
    //         text: 'Pull up',
    //         propertyDetail: '2 sets, 8 reps',
    //     },
    //     {
    //         imgsrc: require('../../assets/dorothy.png'),
    //         text: 'Push Up',
    //         propertyDetail: '2 sets, 99 reps',
    //     },
    //     {
    //         imgsrc: require('../../assets/fri.png'),
    //         text: 'Dorothy',
    //         propertyDetail: '3 sets, 18 reps',
    //     },
    // ];

    const [exerciseData, setExerciseData] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            
            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
                try{
                    const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
    
                    const userId = accountResponse.data.id;
    
                    const responsePlanList = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
            
                    const favoriteResponse = await axios.get(`${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const publicExerciseresponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);
                    const fullExercises = publicExerciseresponse.data;
            
                    const FavorSET = new Set(favoriteResponse.data.map(fav => fav.exerciseId));
                    const fullExerciseNERF = fullExercises.reduce((map, exercise) => {
                        map[exercise.id] = {
                            videopath: exercise.publicVideoUrl,
                            imgsrc: exercise.publicImageUrl,
                        };
                        return map;
                    }, {});

                    const responseDatePlans = await axios.get(`${BASE_URL}/api/date-plans/all?planId.equals=${planID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const Planlength = Math.max(...responseDatePlans.data.map(plan => plan.dateOrder));
                    // console.log(Planlength);
                    
                    const datePlanIds = responseDatePlans.data.map(plan => plan.id);
                    

                    const getAllExercisePlan = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    //ANH XA CUA DATE-PLAN, PLAN, EXERCISE-PLAN
                    const filteredExercisePlans = getAllExercisePlan.data.filter(exercisePlan => 
                        datePlanIds.includes(exercisePlan.datePlanId) 
                    );
                    
                    // console.log(filteredExercisePlans);
                    //LAY RA SETS, REPS
                    const exercisePlanMap = {};
                    getAllExercisePlan.data.forEach(data => {
                        const exerciseId = data.exercise?.id;
                        if (!exerciseId) {
                            console.error('Missing exerciseId:', data);
                            return;
                        }
                        if (!exercisePlanMap[exerciseId]) {
                            exercisePlanMap[exerciseId] = [];
                        }
                        exercisePlanMap[exerciseId].push({ setCount: data.setCount, repCount: data.repCount });
                    });

                    const getPlanList = filteredExercisePlans.map((data) => {
                        const exerciseFallback = fullExerciseNERF[data.exercise.id] || {};
                        const datePlan = responseDatePlans.data.find((plan) => plan.id === data.datePlanId) || {};
                    
                        return {
                            id: data.id,
                            idex: data.exercise.id,
                            propertyDetail: `${data.setCount || 0} sets, ${data.repCount || 0} reps`,
                            setAndRep: exercisePlanMap[data.exercise.id] || {setCount: 0, repCount: 0}, 
                            imgsrc: exerciseFallback.imgsrc,
                            text: data.exercise.name,
                            videopath: exerciseFallback.videopath,
                            description: data.exercise.description,
                            time: datePlan.time || '00:00',     
                            dateOrder: datePlan.dateOrder || 0, 
                            restTime: data.restTime || 8,      
                            isFavorited: FavorSET.has(data.exercise.id) ? 1 : 0,
                        };
                    });
                    
                    //console.log(getPlanList);
                    


                    getPlanList.sort((a, b) => {
                        if (a.dateOrder !== b.dateOrder) {
                            return a.dateOrder - b.dateOrder;
                        }
                        const timeA = a.time.split(':').map(Number);
                        const timeB = b.time.split(':').map(Number);
                    
                        if (timeA[0] !== timeB[0]) {
                            return timeA[0] - timeB[0]; 
                        } else {
                            return timeA[1] - timeB[1]; 
                        }
                    });
                    setNumday(Planlength);
                    setExerciseData(getPlanList);
                    //GET CMT LIST
                    await fetchCMT();
                }
                catch(err){
                    console.log(err);
                }
            }
            else{
                navigation.navigate('LoginScreen');
            }
            //console.log(totalDays);

            setLoading(false);
        };
        checkAuth();
    }, [navigation]);


    useEffect(() => {
        const refCMTable = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                setAccessToken(token);
                const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userId = accountResponse.data.id;
                const exists = cmtData.some((item) => item.userId === userId);
                setIsCMTable(!exists);
            } catch (err) {
                console.error(err);
            }
        };
        refCMTable();
    }, [cmtData]); 

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowPicker(false);
        setDate(currentDate);
        setNewPlanInstance({
            ...newPlanInstance,
            startDate: currentDate
        })
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };


    const groupedExercises = exerciseData.reduce((acc, exercise) => {
        if (!acc[exercise.dateOrder]) {
            acc[exercise.dateOrder] = [];
        }
        acc[exercise.dateOrder].push(exercise);
        return acc;
    }, {});

    const handleCopyPlan = async () => {
        try {
            await axios.get(`${BASE_URL}/api/plans/copy?planId=${planID}&userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            console.log("Plan copied successfully");
            ToastAndroid.show('Get plan successfully, please check your assigned plan!', ToastAndroid.TOP);
        }
        catch (err) {
            console.error("Error coping plan:", err);
            ToastAndroid.show('An error occurred, please try again.', ToastAndroid.SHORT);
        }
    }

    const handleConfirmStartPlan = async () => {
        setModalVisible(false);

        try {
            const { data: getPlanData } = await axios.get(`${BASE_URL}/public/api/plans/all?id.equals=${planID}`)
            
            setNewPlanInstance({
                ...newPlanInstance,
                name: getPlanData[0].name,
                description: getPlanData[0].description
            })

            await axios.post(`${BASE_URL}/api/plan-instances`, newPlanInstance, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            ToastAndroid.show('Get plan successfully', ToastAndroid.TOP);
        }
        catch (error) {
            console.log(error);
            ToastAndroid.show('An error occurred, please try again.', ToastAndroid.SHORT);
        }
        finally {
            navigation.navigate('MyPlan')
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: selectedColor}]}>
            {/* Header */}
            <Header1 
                title="Workout" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='MyPlan'
                />

            {/* Body */}
            {showMessage && (
                <View style={{
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'rgb(34,80,42)', 
                    padding: 10, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 1000,
                    borderRadius:5,
                    borderWidth:2,
                    borderColor:'#fff',
                    
                }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight:'600' }}>
                        {statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failure'}
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={styles.bodyContent}>
                    
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Plan: {route.params?.namePlan}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.titleText}>200 </Text>
                        <Icon name='star' color='white' size={35}  />
                    </View>
                </View>
                <View style={{ alignItems: 'center', marginBottom: '-5%', flexDirection: 'row', justifyContent:'space-between', marginHorizontal: 20}}>
                    <View>
                        <Text style={styles.textDay}>Length: {route.params?.numExercises}</Text>
                        <Text style={styles.textDay}>AVG Rating: {route.params?.avgrating || 0}★</Text>
                        {/* <Text style={styles.textDay}>ABC</Text> */}
                    </View>
                    {isPublic &&(
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleCopyPlan()}
                        >
                            <Text style={styles.buttonText}>Get this plan</Text>
                        </TouchableOpacity>
                    )}
                    {/* <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleCopyPlan()}
                    >
                        <Text style={styles.buttonText}>Get this plan</Text>
                    </TouchableOpacity> */}
                </View>
                <View style={{ marginBottom: '10%', flex: 1 }}>
                {Object.keys(groupedExercises)
                    .sort((a, b) => a - b) 
                    .map((dateOrder, index) => (
                        <View key={index}>
                            <View style={{ marginLeft: '4%', marginTop: '10%' }}>
                                <Text style={styles.textDay}>Day {index + 1}: </Text>
                            </View>
                            {groupedExercises[dateOrder].map((exercise, idx) => (
                                <ExerciseContent
                                    key={idx}
                                    navigation={navigation}
                                    imgsrc={exercise.imgsrc}
                                    text={exercise.text}
                                    propertyDetail={exercise.propertyDetail}
                                    exerciseID={exercise.idex}
                                    videopath={exercise.videopath}
                                    description={exercise.description}
                                    isFavorited={exercise.isFavorited}
                                    onFavoriteChange={handleFavoriteChange}
                                    time={exercise.time}
                                    dateOrder={exercise.dateOrder}
                                    restTime={exercise.restTime}
                                    setAndRep={exercise.setAndRep}
                                    back='Plan'
                                />
                            ))}
                        </View>
                    ))}
            </View>
            </ScrollView>

            {isPublic ? (
                <Animated.View style={[styles.forumZone, { height: feedbackHeight }]}>
                {!isFeedbackVisible && (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleFeedbackZone}
                    >
                        <Icon name="angle-double-up" size={20} color="#FFFFFF" />
                        <Text style={styles.toggleButtonText}>Show Feedback</Text>
                    </TouchableOpacity>
                )}
    
                {isFeedbackVisible && (
                    <>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={toggleFeedbackZone}
                        >
                            <Text style={styles.toggleButtonText}>Hide Feedback</Text>
                            <Icon name="angle-double-down" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.feedbackHeader}>
                            <Text style={styles.headerText}>Feedback Zone</Text>
                            {isCMTable && (
                                <TouchableOpacity
                                    style={styles.CMTbutton}
                                    onPress={toggleCMTmodal}
                                >
                                    <Text style={[styles.modalText, { fontSize: 15 }]}>
                                        Post a comment (^▽^)
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
    
                        <FlatList
                            data={cmtData.slice(0, visibleItems)}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <CommentCard
                                    id={item.id}
                                    comment={item.comment}
                                    rating={item.rating}
                                    level={item.level}
                                    usernameCMT={item.usernameCMT}
                                    avatarURL={item.avatarURL}
                                    isEditable={item.isEditable}
                                    fetchCMT={fetchCMT}
                                    setStatusMessage={setStatusMessage}
                                    setRating={setRating}
                                    setIDCMT={setIDCMT}
                                    setComment={setComment}
                                    setCMTmodalVisible={setCMTmodalVisible}
                                    setTypeFeedback={setTypeFeedback}
                                    setModalNotiVisible={setModalNotiVisible}
                                />
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>
                                    There aren't any comments yet, be the first!
                                </Text>
                            )}
                        />
                        {cmtData.length > 3 && (
                            <TouchableOpacity
                                style={styles.button2}
                                onPress={toggleItems}
                            >
                                <Text style={styles.buttonText2}>
                                    {visibleItems >= cmtData.length
                                        ? 'See Less'
                                        : 'See More'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        
                    </>
                )}
                </Animated.View>
                ) : (
                    <View style={[styles.forumZone, dynamicStyle]}>
                    <Text style={{ fontSize: 18, color: 'white', fontStyle: 'italic', fontWeight: '600', textAlign: 'center' }}>
                      Only published plans have feedback zone!
                    </Text>
                  </View>
                )}

            

            {/* Footer */}
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>

            {/* Modal */}

            {/* Modal FOR CMT*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={CMTmodalVisible}
                onRequestClose={toggleCMTmodal}
            >
                <View style={styles.overlay} />

                <View style={styles.modalContainer}>
                    <ImageBackground
                        source={require('../../assets/postCMT.jpg')}
                        style={styles.modalImage}
                    >
                        <View style={styles.modalContent2}>
                        <View style={styles.starsContainer}>
                            {[...Array(5)].map((_, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    onPress={() => handleStarPress(index)} 
                                >
                                    <Text 
                                        style={[
                                            styles.star, 
                                            { 
                                                color: index < rating ? 'rgba(193, 23, 255, 1)' : '#ccc'
                                            }
                                        ]}
                                    >
                                        𖤐
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                            
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Write your comment here..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />

                            <Text style={styles.noteText}>Note: Harsh words live in the dungeon of the heart.</Text>
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity style={styles.closeButton} onPress={toggleCMTmodal}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.postButton} onPress={postComment}>
                                    <Text style={styles.buttonText}>Post a Comment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </Modal>


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalNotiVisible}
                onRequestClose={() => setModalNotiVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                    width: '80%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{
                    fontSize: 16,
                    color: statusMessage.includes('Failed') ? 'red' : 'green',
                    textAlign: 'center',
                    }}>
                    {statusMessage}
                    </Text>
                </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 10 }}>
                                <Icon name="close" size={35} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalText}>Input start day:</Text>

                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={styles.dateButton}
                        >
                            <Text style={styles.dateText}>{formatDate(date)}</Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChange}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirmStartPlan}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
        </View>
        
    );
};


const dynamicStyle = {
    height:'8%',
    borderTopColor: 'cyan',
    marginBottom: 80
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
    titleContainer: {
        margin: '2%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    titleText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: '600',
    },
    textDay: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    button: {
        alignContent: 'center',
        width: '40%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        // flex: 1,
        // marginHorizontal: '10%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'rgb(36, 105, 68)',
        alignItems: 'center',
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: 40,
        backgroundColor: 'rgba(42, 85, 176, 1)',
    },
    modalText: {
        fontSize: 25,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
    dateButton: {
        backgroundColor: 'rgb(36, 105, 68)',
        padding: 10,
        marginBottom: 20,
        borderColor: '#fff',
        borderWidth: 2,
    },
    dateText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: 'rgb(36, 105, 68)',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    forumZone:{
        height: '40%',       
        borderTopWidth: 5,
        paddingTop: 8,
        zIndex: 10,           
    },
    headerText: {
        fontSize: 30,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
      },
    listContainer: {
        flex: 1,
    },
    button2: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width:150,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        alignSelf: 'center',
    },
    buttonText2: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    CMTbutton:{
        width:'40%',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        zIndex: -1, 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 2,
        position: 'relative', 
    },
    modalImage: {
        width: '95%', 
        height: '80%', 
        marginLeft: 20,
        resizeMode: 'cover', 
        opacity:1,
        zIndex: -1, 
    },
    modalContent2: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop:75
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    star: {
        fontSize: 45,
        fontWeight:'800',
        marginHorizontal: 5,
    },
    noteText: {
        fontSize: 14,
        color: 'red',
        fontStyle:'italic',
        fontWeight:'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    commentInput: {
        width: '90%',
        height: 100,
        borderColor: '#ccc',
        borderWidth: 0,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    postButton: {
        backgroundColor: 'rgb(34,139,34)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 3,
        height:50,
        marginLeft: 15,
        borderColor:'#fff'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 3,
        borderColor:'#fff',
        height:50,
    },

    forumZone: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        // borderTopWidth: 5,
        // borderTopColor: 'cyan',
        paddingTop: 8,
        zIndex: 10,
        overflow: 'hidden',
        backgroundColor: 'rgb(34,50,52)',
        marginBottom: 70
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    toggleButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(34,139,34,0.0)',
        alignSelf: 'center',
        paddingVertical: 10,
        width:'30%',
        marginBottom: 5,
        borderRadius: 5,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerText: {
        fontSize: 30,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    button2: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width: 150,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        alignSelf: 'center',
    },
    buttonText2: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    CMTbutton: {
        width: '40%',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PlanScreen;
