import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColor } from "../context/ColorContext";
import { LinearTextGradient } from "react-native-text-gradient";
import GradientText from "../components/GradientText";
import LottieView from "lottie-react-native";
import BASE_URL from "../../IPHelper";

const WorkoutExercise1 = ({ navigation, route }) => {
    const {selectedColor} = useColor()
    const [loading, setLoading] = useState(true); 
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [completedSets, setCompletedSets] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    const aspectRatio = 16 / 9;
    const videoHeight = screenWidth / aspectRatio;
    const exerciseInstanceData = route.params?.data || [];
    const exerciseInstanceOrder = route.params?.order || 0;
    const currentDatePlanInstanceID = route.params?.currentDatePlanInstanceID || 0;
    const currentExercise = exerciseInstanceData[exerciseInstanceOrder] || {};
    const { setCount, repCount, restTime, exerciseName, met, exerciseID, publicVideoUrl } = currentExercise;
    const [remainingTime, setRemainingTime] = useState(restTime);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [timeColor, setTimeColor] = useState('#fff'); 
    const [gradientIndex, setGradientIndex] = useState(2);
    const [isSkipExercise, setIsSkipExercise] = useState(true);
    const dateOrder = route.params?.dateOrder || 0;
    const [modalVisible, setModalVisible] = useState(false);
    const datePlanId = route.params?.datePlanId || 0;
    const planInstanceID = route.params?.planInstanceID || 0;

    const gradients = [
        ["#FF5733", "#33FF57", "#3357FF"],
        ["#FFD700", "#FF4500", "#FF69B4"],
        ["#00FFFF", "#7FFFD4", "#8A2BE2"],
        ["#4B0082", "#9400D3", "#BA55D3"],
        ["#8B0000", "#FF6347", "#FFA500"],
        ["#FF1493", "#C71585", "#8B008B"],
        ["#FF6347", "#FF4500", "#2E8B57"],
        ["#8A2BE2", "#7B68EE", "#6A5ACD"],
        ["#00BFFF", "#1E90FF", "#4682B4"],
        ["#32CD32", "#228B22", "#006400"],
        ["#FFD700", "#FF8C00", "#FF6347"],
        ["#800080", "#4B0082", "#9400D3"],
        ["#DC143C", "#B22222", "#FF4500"],
        ["#B0E0E6", "#AFEEEE", "#5F9EA0"],
        ["#F0E68C", "#BDB76B", "#9ACD32"],
        ["#ADD8E6", "#87CEEB", "#4682B4"],
        ["#FA8072", "#FF6347", "#FF4500"],
        ["#FF6347", "#FF4500", "#D2691E"],
        ["#9ACD32", "#8FBC8F", "#228B22"],
        ["#FF00FF", "#8A2BE2", "#4B0082"],
        ["#FF8C00", "#FFA500", "#FFD700"],
        ["#00FA9A", "#2E8B57", "#228B22"],
        ["#7B68EE", "#6A5ACD", "#8A2BE2"],
        ["#7FFF00", "#32CD32", "#ADFF2F"],
        ["#FFB6C1", "#FFC0CB", "#FF69B4"],
        ["#F4A300", "#FF6F00", "#D15B00"],
        ["#8B4513", "#A0522D", "#D2691E"]
      ];
      

    const colors = [
        '#FF5733', '#33FF57', '#3357FF', 
        '#FF33A8', '#FFD433', '#33FFF5', 
        '#FF6347', '#4682B4', '#DA70D6', '#32CD32', '#87CEEB', 
        '#8A2BE2',
        '#FF4500', '#7FFFD4', '#D2691E', '#9400D3', 
        '#00CED1', '#FFD700', 
        '#B22222', '#FF1493', '#6495ED', '#FF8C00', '#00FA9A', '#1E90FF', 
        '#8B0000', '#ADFF2F', '#FF69B4', '#5F9EA0', 
        '#7B68EE', '#FFA07A', 
        '#6A5ACD', '#40E0D0', '#EE82EE', '#DC143C', 
        '#F4A460', '#708090', 
    ];

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
        const checkInit = () => {
            setCompletedSets(0);
            setIsSkipExercise(true);

        }
        checkAuth();
        checkInit();
    }, [navigation]);


    const handleComplete = () => {
        if (completedSets < setCount) {
            setCompletedSets(completedSets + 1); 
            setIsButtonDisabled(true); 
            setRemainingTime(restTime); 
        }
        if (completedSets + 1 >= setCount) {
            setCompletedSets(completedSets + 1); 
            setRemainingTime(restTime);
            setIsButtonDisabled(true);
            setIsSkipExercise(false);
        }
    };

    useEffect(() => {
        let timer;
        if (isButtonDisabled && remainingTime > 0 && completedSets < setCount) {
            timer = setInterval(() => {
                setRemainingTime((prevTime) => prevTime - 1);
                setTimeColor(colors[Math.floor(Math.random() * colors.length)]);
                setGradientIndex((prevIndex) => (prevIndex + 1) % gradients.length);
            }, 1000);
        } else if (remainingTime === 0 || completedSets >= setCount) {
            setIsButtonDisabled(false);
            setRemainingTime(restTime);
            setGradientIndex(2); 
            setTimeColor('#fff');
        }
        return () => clearInterval(timer); 
    }, [isButtonDisabled, remainingTime, completedSets]);


    const handleSkipRest = () => {
        setIsButtonDisabled(false);
        setRemainingTime(restTime); 
        setGradientIndex(2); 
        setTimeColor('#fff');
    };

    const handleNextExercise = async () => {
        if (exerciseInstanceOrder + 1 >= exerciseInstanceData.length){
            setModalVisible(true);
            // try{
            //     const token = await AsyncStorage.getItem('accessToken');
            //     const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //         },
            //     });
            //     const userId = accountResponse.data.id;
            //     const dataPUTstatus = {
            //         dateOrder: dateOrder,
            //         status: 'COMPLETED',
            //         datePlanId: datePlanId,
            //         planInstanceId: planInstanceID
            //     }
            //     const responseSTATUSdateplanInstance = await axios.put(`${BASE_URL}/api/date-plan-instances/${currentDatePlanInstanceID}`, dataPUTstatus,{
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //         },
            //     });
            //     console.log(responseSTATUSdateplanInstance.status);
            // }
            // catch(e){
            //     console.log(e);
            // }
            await AsyncStorage.setItem('state', true.toString());
            setTimeout(() => {
                setModalVisible(false);
                navigation.navigate('HomieScr');
            }, 3500);
        }
        else{
            navigation.replace('Workout1', {
                data: exerciseInstanceData,
                order: exerciseInstanceOrder + 1,
                currentDatePlanInstanceID: currentDatePlanInstanceID,
                dateOrder: dateOrder,
                datePlanId: datePlanId,
                planInstanceID: planInstanceID,
            });
        }
    }


    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }


    return (
        <View style={styles.container}>
            {/* <Header1 title="Workout" navigation={navigation} /> */}
            <Header1 title="Workout" navigation={navigation} isLogin={isLogin} username={username} name='Workout1'/>
            
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={[styles.body, { backgroundColor: selectedColor }]}>
                    <View style={styles.title2}>
                        <Text style={styles.text}>{exerciseName}</Text>
                        <Text style={[styles.text, {fontSize:16, fontStyle:'italic'}]}>Day {dateOrder} - Exercise {exerciseInstanceOrder+1}/{exerciseInstanceData.length}</Text>
                    </View>

                    <View style={{ height: videoHeight }}>
                        <WebView
                            style={styles.video}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsInlineMediaPlayback={true}
                            source={{ uri: publicVideoUrl }}
                        />
                    </View>

                    <View style={styles.setsContainer}>
                        <GradientText
                            text={`Rest: ${remainingTime}s`}
                            colors={gradients[gradientIndex]}
                            fontSize={36}
                        />
                        <Text style={styles.textdetails}>---------------------------------------</Text>
                        {Array.from({ length: setCount }).map((_, index) => (
                            <Text key={index} style={styles.textdetails}>
                                Set {index + 1}: {repCount} reps {completedSets > index ? '✓' : ''}
                            </Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={(!isSkipExercise) ? styles.button : styles.disabled} disabled={isSkipExercise} onPress={handleNextExercise}>
                    <Text style={styles.buttonText}>Log Set</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSkipRest}>
                    <Text style={styles.buttonText}>Skip Rest</Text>
                </TouchableOpacity>
                <TouchableOpacity style={(!isButtonDisabled) ? styles.button : styles.disabled} onPress={handleComplete} disabled={isButtonDisabled}>
                    <Text style={styles.buttonText2}>Complete 1 Set</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <LottieView
                            source={require('../../assets/completed.json')} 
                            autoPlay
                            loop={false}
                            style={styles.lottie}
                        />
                        <Text style={styles.congratulationsText}>
                            Congratulations! You have finished all exercises today!
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    body: {
        height: '100%',
        backgroundColor: 'rgb(34,50,52)',
        paddingBottom: 20,
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    title2: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'space-between',
    },
    video: {
        height: '100%',
    },
    setsContainer: {
        marginBottom: '12%',
        marginTop: '5%',
        alignItems: 'center',
    },
    textdetails: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 25,
    },
    buttonContainer: {
        position: 'relative',
        bottom: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: 'rgb(34,50,52)',
    },
    button: {
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginHorizontal: 8,
    },
    disabled:{
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(42, 46, 42, 0.5)',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginHorizontal: 8,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20,
    },
    buttonText2: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
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

export default WorkoutExercise1;