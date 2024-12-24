import React, { useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, FlatList, ActivityIndicator, Animated, Easing, TextInput, Alert, Image, ImageBackground, Button, ToastAndroid } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import ExerciseContent from "../components/ExerciseContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { useColor } from "../context/ColorContext";
import { LinearGradient } from "expo-linear-gradient";
import ExerciseContentNotDetailForInstance from "../components/ExerciseContentNotDetailInstance";
import LottieView from "lottie-react-native";


const WorkoutPlanScreen = ({ navigation, route }) => {
    const {selectedColor} = useColor()
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const [dateOrder, setDateOrder] = useState(0);
    const planInstanceID = route.params?.planInstanceID || 0;
    const [exerciseData, setExerciseData] = useState([]);
    const [currentDatePlanInstanceID, setCurrentDatePlanInstanceID] = useState(0);
    const [datePlanId, setDatePlanId] = useState(0);
    const setState = route.params?.setState;
    const [cancelModal, setCancelModal] = useState(false);
    const [modalCancelVisible, setModalCancelVisible] = useState(false);
    

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

        const fetchInstance = async () => {
            try{
                const token = await AsyncStorage.getItem('accessToken');
                const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userId = accountResponse.data.id;

                const nextInstanceResponse = await axios.get(`${BASE_URL}/api/date-plan-instances/next?planInstanceId=${planInstanceID}`, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                });
                const curDatePlanInstanceID = nextInstanceResponse.data.id;
                setDatePlanId(nextInstanceResponse.data.datePlanId);
                setCurrentDatePlanInstanceID(curDatePlanInstanceID);
                const exercisePlanInstanceResponse = await axios.get(`${BASE_URL}/api/exercise-plan-instances/all?datePlanInstanceId.equals=${curDatePlanInstanceID}`,
                    {
                        headers:{
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                const dataGET = exercisePlanInstanceResponse.data.map((data) => ({
                    exercisePlanInstanceID : data.id,
                    exerciseID: data.exerciseId,
                    exerciseName: data.exercise.name,
                    setCount: data.setCount,
                    repCount: data.repCount,
                    restTime: data.restTime,
                    met: data.exercise.met,
                }));
                const publicExerciseResponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);

                const exerciseMap = new Map();
                publicExerciseResponse.data.forEach((exercise) => {
                    exerciseMap.set(exercise.id, {
                        imgsrc: exercise.publicImageUrl,
                        publicVideoUrl: exercise.publicVideoUrl,
                    });
                });

                const updatedDataGET = dataGET.map((item) => {
                    const exerciseDetails = exerciseMap.get(item.exerciseID) || {};
                    return {
                        ...item,
                        imgsrc: exerciseDetails.imgsrc || null,
                        publicVideoUrl: exerciseDetails.publicVideoUrl || null,
                    };
                });
                setExerciseData(updatedDataGET);
                setDateOrder(nextInstanceResponse.data.dateOrder);
                console.log(updatedDataGET.length);
            }
            catch(e){
                console.error(e);
            }
        }
        checkAuth();
        fetchInstance();
    }, [navigation]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    const practice = () => {
        navigation.navigate('Workout1', {
            data: exerciseData,
            order: 0,
            currentDatePlanInstanceID: currentDatePlanInstanceID,
            dateOrder: dateOrder,
            datePlanId: datePlanId,
            planInstanceID: planInstanceID,
        });
    }

    const cancelToggle = () => {
        setCancelModal(!cancelModal);
    }

    const handleCancel = async () => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userId = accountResponse.data.id;
            const CancelResponse = await axios.get(`${BASE_URL}/api/plan-instances/cancel/${planInstanceID}`, {
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });
            const statusCode = CancelResponse.status;
            if (statusCode >= 200 && statusCode <= 300){
                console.log(`Cancelled: ${statusCode}`);
                setCancelModal(false);
                setModalCancelVisible(true);
                setTimeout(() => {
                    setModalCancelVisible(false);
                    navigation.navigate('PlanPortal');
                }, 1500);
            }
        }
        catch(e){
            console.error(e);
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
                name='PlanPortal'
                />

            {/* Body */}
            <ScrollView contentContainerStyle={styles.bodyContent}>
                    
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Plan: {route.params?.namePlan}</Text>
                    <Text style={[styles.titleText, {marginLeft:10, marginTop:5}]}>Day: {dateOrder}</Text>
                </View>
                <View style={{ flexDirection: 'row' , justifyContent:'space-between'}}>
                <TouchableOpacity
                    onPress={() => cancelToggle()} 
                    style={[styles.buttonDanger, {alignSelf:'flex-end', marginRight:20, width:'35%', marginVertical:0}]}>
                    <Text style={{color:'#fff', fontSize:20, fontWeight:'800', textAlign:'center'}}>CANCEL PLAN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => practice()} 
                    style={[styles.button2, {alignSelf:'flex-end', marginRight:20, width:'35%', marginVertical:0}]}>
                    <Text style={{color:'#fff', fontSize:20, fontWeight:'700', textAlign:'center'}}>Start practice!</Text>
                </TouchableOpacity>
                </View>
                <View style={{ marginBottom: '1%', flex: 1 }}>
                     {exerciseData.map((item, index) => (
                        <ExerciseContentNotDetailForInstance
                            key={index}
                            text={item.exerciseName}
                            exerciseID={item.exerciseID}
                            setCount={item.setCount}
                            repCount={item.repCount}
                            restTime={item.restTime}
                            imgsrc={item.imgsrc}
                            videoUrl={item.publicVideoUrl}
                            met={item.met}
                        />
                ))}
                </View> 
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={cancelModal}
                    onRequestClose={() => setCancelModal(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{
                        backgroundColor: 'rgb(34,50,50)',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text style={[styles.textDay, {textAlign:'center', fontSize:18}]}>Are you sure want to cancel this plan? All progress will be revoked!</Text>
                        <View style={{ flexDirection: 'row' , justifyContent:'space-between', marginTop:10}}>
                        <TouchableOpacity
                            onPress={() => cancelToggle()} 
                            style={[styles.button2, {alignSelf:'flex-end', marginRight:20, width:'35%', marginVertical:0}]}>
                            <Text style={{color:'#fff', fontSize:20, fontWeight:'700', textAlign:'center'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleCancel()} 
                            style={[styles.buttonDanger, {alignSelf:'flex-end', marginRight:20, width:'35%', marginVertical:0}]}>
                            <Text style={{color:'#fff', fontSize:20, fontWeight:'800', textAlign:'center'}}>Confirm</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalCancelVisible}
                    onRequestClose={() => setModalCancelVisible(false)}
                >
                    <View style={styles.modalContainer5}>
                        <View style={styles.modalContent5}>
                            <LottieView
                                source={require('../../assets/completed.json')} 
                                autoPlay
                                loop={false}
                                style={styles.lottie}
                            />
                            <Text style={styles.congratulationsText}>
                                Successfully cancelled this plan!
                            </Text>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            {/* Footer */}
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
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
    buttonDanger: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft:10,
        marginVertical: 10,
        width:150,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgb(187, 25, 25)',
        borderRadius: 5,
        alignSelf: 'center',
    },
    modalContainer5: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent5: {
        width: '80%',
        backgroundColor: 'rgb(0, 92, 69)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    lottie: {
        width: 200,
        height: 200,
    },
    congratulationsText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    }
});

export default WorkoutPlanScreen;
