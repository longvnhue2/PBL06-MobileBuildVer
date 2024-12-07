import React, {useState, useEffect} from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, Platform, ActivityIndicator, TextInput, FlatList} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from "@react-native-community/slider";
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const RecustomizePlanScreen = ({navigation, route}) => {
    const [isLogin, setIsLogin] = useState(false);
    const [existID, setExistID] = useState(0);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const planID = route.params?.planID;
    const [totalDays, setTotalDays] = useState(route.params?.totalDays);
    const [searchQuery, setSearchQuery] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [thisData, setThisData] = useState({});
    const [toggleDEL, setToggleDEL] = useState(false);
    const [DatePlanIds, setDatePlanIds] = useState([]);
    const [dateOrderDEL, setDateOrderDEL] = useState(0);
    const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
    const [ttoken, setToken] = useState(null);
    const [topDateOrder, setTopDateOrder] = useState(0);
    const [message, setMessage] = useState('');

    const closeModal2 = () => {
        setModalSuccessVisible(false);
    };

    const showModal = (day) => {
        if (day > 0) setDateOrderDEL(day);
        setToggleDEL(!toggleDEL);
    } 

    const handleAdd = async () => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userId = accountResponse.data.id;
            const formPOST = {
                time: '20:00',
                dateOrder: topDateOrder + 1,
                planId: planID
            }
            const POSTresponse = await axios.post(`${BASE_URL}/api/date-plans`, formPOST, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (POSTresponse.status >= 200 && POSTresponse.status <= 300){
                setTotalDays(totalDays + 1);
                setMessage('Successfully Added 1 more day!');
                setModalSuccessVisible(true);
            }
        }
        catch(e){
            console.error(e);
        }
    }

    const handleDELdate = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            try{
                console.log(`DAY WANT TO DEL: ${dateOrderDEL}`);
                const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userId = accountResponse.data.id;

                //QUERY 2 SET FOR HANDLE
                const DatePlanResponse = await axios.get(`${BASE_URL}/api/date-plans?planId.equals=${planID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const resDateId = DatePlanResponse.data
                    .filter(item => item.dateOrder === dateOrderDEL)
                    .map(item => item.id); 
                setDatePlanIds(resDateId);
                const ExercisePlanResponse = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const ExercisePlanFil = ExercisePlanResponse.data.filter(item => resDateId.includes(item.datePlanId));
                const TargetExercisePlanIds = ExercisePlanFil.map(item => item.id);

                //step1:
                for (const id of TargetExercisePlanIds) {
                    await axios.delete(`${BASE_URL}/api/exercise-plans/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }

                //step2:
                for (const id of resDateId) {
                    await axios.delete(`${BASE_URL}/api/date-plans/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }
                setTotalDays(totalDays - 1);
                setToggleDEL(!toggleDEL);
                setMessage(`Remove Custom Plan DAY ${dateOrderDEL} Successful!`);
                setModalSuccessVisible(true);
            }
            catch(err){
                console.log(err);
            }
        }
    }

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
                        
                        const GetDatePlanResponse = await axios.get(`${BASE_URL}/api/date-plans?planId.equals=${planID}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
    
                        const ExercisePlanResponse = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        
                        const extractedData = GetDatePlanResponse.data.map((item) => {
                            const numExercises = ExercisePlanResponse.data.filter(exercise => exercise.datePlanId === item.id).length;
                            return {
                                DatePlanId: item.id,
                                time: item.time,
                                dateOrder: item.dateOrder,
                                numExercise: numExercises
                            }
                        });
    
                        const resList = extractedData.map((item, index) => ({
                            id: index,
                            DatePlanId: item.DatePlanId,
                            dateOrder: item.dateOrder,
                            title: `Day: ${item.dateOrder}`,
                            progress: item.numExercise,
                            time: item.time,
                            gradientColors: [
                                `rgb(${Math.floor(Math.random() * 150)+50}, ${Math.floor(Math.random() * 150)+50}, ${Math.floor(Math.random() * 150)+50})`,
                                `rgb(${Math.floor(Math.random() * 150)+50}, ${Math.floor(Math.random() * 150)+50}, ${Math.floor(Math.random() * 150)+50})`,
                            ],
                        }));
                        const maxDateOrder = Math.max(...resList.map(item => item.dateOrder));
                        setTopDateOrder(maxDateOrder);
                        setAppointments(resList);
                        
                        const PlanResponse = await axios.get(`${BASE_URL}/api/plans/${planID}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
    
                        const GetDatePlanResponse2 = await axios.get(`${BASE_URL}/api/date-plans?planId.equals=${planID}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const ids = GetDatePlanResponse.data.map(item => item.id);
                        const GetExercisePlanResponse = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const countExs = GetExercisePlanResponse.data.filter(item => ids.includes(item.datePlanId)).length;
                        setThisData({
                            title: PlanResponse.data.name,
                            totalDays: PlanResponse.data.totalDays,
                            numExercises : countExs
                        });
                    } catch (error) {
                        console.error(error);
                        // Xử lý lỗi nếu cần
                    }
                }
                else {
                    navigation.navigate('LoginScreen');
                }
                setLoading(false);
            };
    
            checkAuth();
            
        }, [navigation, planID, totalDays]) 
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#000" />;
    }

    const renderAppointmentCard = ({ item }) => (
        <LinearGradient
            colors={item.gradientColors}
            style={[styles.card]}
        >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardDates}>
                <Text style={styles.cardDate}>{item.progress} exercise(s)</Text>
                <Text style={styles.cardDate}>Start: {item.time}</Text>
            </View>
            
            <View style={styles.cardContent}>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.actionButtonDanger} onPress={() => showModal(item.dateOrder)}>
                        <Text style={styles.buttonTextDanger}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CustomPlanEditing', {
                       planID: planID,
                       dayOrder: item.dateOrder,
                       schedule : item.time,
                       setTotalDays:setTotalDays,
                       totalDays:totalDays
                    })}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );

    return <View style={styles.container}>
        <Header1 
            title="Workout" 
            navigation={navigation} 
            isLogin={isLogin} 
            username={username} 
            name='RecustomizePlan'
        />

        
        <TouchableOpacity style={[styles.addButton, {alignSelf:'flex-end', marginRight:15}]} onPress={handleAdd}>
                <Text style={[styles.buttonText, {fontSize:18, fontWeight:'800'}]}>+ Add 1 more day</Text>
        </TouchableOpacity>
        <View style={{marginTop:'5%', height:'55%'}}>
        <FlatList 
            contentContainerStyle={styles.listContainer}
            data={appointments}
            renderItem={renderAppointmentCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
        />
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop:15}}>
            <View style={{marginLeft: 20}}>
            <Text style={styles.textDesc}>Plan Name: {thisData.title}</Text>
            <Text style={styles.textDesc}>Total exercises: {thisData.numExercises}</Text>
            <Text style={styles.textDesc}>Length: {thisData.totalDays} day(s)</Text>
            </View>
            <View style={{flexDirection:'column',  justifyContent: 'space-between', marginBottom:30}}>
            
            <TouchableOpacity style={[styles.actionButton, {alignSelf:'center', height:50, marginRight:15}]} onPress={() => navigation.navigate('MyPlan')}>
                <Text style={[styles.buttonText, {fontSize:14, fontWeight:'800'}]}>Confirm recustomize</Text>
            </TouchableOpacity>
            </View>
        </View>

        <View style={styles.footer}>
            <Footer1 navigation={navigation} />
        </View>
        <Modal
                animationType="fade"
                transparent={true}
                visible={toggleDEL}
                onRequestClose={showModal} 
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Are you sure want to remove this day?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={showModal}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDELdate}>
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalSuccessVisible}
                onRequestClose={closeModal2}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ alignItems: 'center',
                        backgroundColor: 'rgb(34,80,58)',
                        borderRadius: 10,
                        padding: 20,
                        alignItems: 'center', }}>
                        <LottieView
                            source={require('../../assets/completed.json')} 
                            autoPlay
                            loop={false}
                            style={{ width: 150, height: 150 }}
                        />
                        
                        <Text style={{ fontSize: 16, marginVertical: 10, fontStyle:'italic', color: '#fff' }}>{message}</Text>

                        <TouchableOpacity onPress={closeModal2} style={{ alignContent: 'center',
                            width: '20%',
                            borderWidth: 2,
                            borderColor: 'white',
                            backgroundColor: 'rgba(34,139,34,0.5)',
                            borderRadius: 5,
                            padding: 10,
                            marginHorizontal: '5%', }}>
                            <Text style={{ color: 'white', fontSize:18, textAlign:'center' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

    </View>
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(34,50,52)',
    },
    bodyContent: {
        flexGrow: 1,
        paddingBottom: 100, 
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    listContainer:{
        paddingHorizontal:5
      },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    card: {
        flex:1,
        marginBottom: 20,
        padding: 10,
        borderRadius: 5,
        marginHorizontal:10,
        borderRadius: 8,
        shadowColor: '#ccc',
        borderColor:'cyan',
        borderTopWidth: 3,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize:20,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: 'white',
        paddingVertical: 5,
    },
    cardDates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    cardDate: {
        color: '#fff',
    },
    cardContent: {
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        marginTop:5,
        backgroundColor: 'rgb(20,100,52)',
        padding:8,
        borderRadius: 5,
        borderWidth:2,
        borderColor:'#fff',
        marginRight: 10,
    },
    addButton: {
        marginTop:20,
        backgroundColor: 'rgb(20,100,52)',
        padding:8,
        borderRadius: 5,
        borderWidth:2,
        borderColor:'#fff',
        marginRight: 10,
        marginBottom:10
    },
    actionButtonDanger: {
        marginTop:5,
        backgroundColor: '#fff',
        padding:8,
        borderRadius: 5,
        borderWidth:2,
        borderColor:'#fff',
        marginRight: 10,
    },
    buttonText: {
        color: '#fff',
    },
    buttonTextDanger: {
        color: 'red',
        fontWeight: 'bold',
    },
    textDesc:{
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'rgb(20,110,52)',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color:'#fff'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
        borderColor: '#fff',
        borderWidth:2
    },
    cancelButton: {
        backgroundColor: 'rgb(20,100,52)',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    cancelText: {
        color: '#fff',
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default RecustomizePlanScreen;