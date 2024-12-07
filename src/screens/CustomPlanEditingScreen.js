import React, {useEffect, useState} from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
// import ExerciseContent from "../components/ExerciseContent";
// import ExerciseContentNotDetail from "../components/ExerciseContentNotDetail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from '@react-native-community/slider';
import axios from "axios";
import BASE_URL from "../../IPHelper";
import ExerciseContentNotDetailAction from "../components/ExerciseContentNotDetailAction";
import ExerciseContentNotDetail from "../components/ExerciseContentNotDetail";
import ExerciseContentNotDetailNewAction from "../components/ExerciseContentNotDetailNewAction";
import LottieView from 'lottie-react-native';

const generateRange = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString().padStart(2, '0'));
};

const CustomPlanEditingScreen = ({ navigation, route }, props) => {

    // const exerciseData = [
    //     {
    //         imgsrc: require('../../assets/dorothy.png'),
    //         text: 'Pull up (Recommended)',
    //         propertyDetail: '2 sets, 8 reps',
    //     },
    //     {
    //         imgsrc: require('../../assets/dorothy.png'),
    //         text: 'Boiled',
    //         propertyDetail: '2 sets, 82 reps',
    //     },
    //     {
    //         imgsrc: require('../../assets/fri.png'),
    //         text: 'Pull up (Recommended)',
    //         propertyDetail: '2 sets, 18 reps',
    //     },
    // ];
    //DATA EXAMPLE

    const dateOrder = route.params?.day || 1;
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const [exerciseData, setExerciseData] = useState([]);   
    const [schedule, setSchedule] = useState(route.params?.schedule);
    const [selectedHour, setSelectedHour] = useState('00');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [modalVisible, setModalVisible] = useState(false);
    const hours = generateRange(0, 23);
    const minutes = generateRange(0, 59);
    const [exerciseIds, setExerciseIds] = useState([]);
    const [oldDatePlanIds, setOldDatePlanIds] = useState([]);
    const currentPlan = route.params?.planId;
    const [showModal, setShowModal] = useState(false); 
    const [selectedExerciseID, setSelectedExerciseID] = useState(null);
    const [sets, setSets] = useState(5);
    const [reps, setReps] = useState(5);
    const [rest, setRest] = useState(10);
    const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
    const [modalEmptyVisible, setModalEmptyVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const planID = route.params?.planID || 0;
    const dayOrder = route.params?.dayOrder || 0;

    const openModal = (exerciseID) => {
        setSelectedExerciseID(exerciseID);
        setShowModal(true); 
    };

    const closeModal = () => {
        setShowModal(false); 
        const tempid = exerciseIds;
        setExerciseIds([]);
        setExerciseIds(tempid);
        console.log(`${selectedExerciseID} : sets: ${sets}, reps : ${reps}, rest : ${rest}`);
        const updatedExerciseData = exerciseData.map((exercise) => {
            if (exercise.id === selectedExerciseID) {
                return {
                    ...exercise,
                    propertyDetail: `${sets} sets|${reps} reps|rest: ${rest}s`,
                    sets: sets,
                    reps: reps, 
                    rest: rest,
                };
            }
            return exercise;
        });
        setExerciseData(updatedExerciseData);
        setShowModal(false);
        setSelectedExerciseID(null);
    };
    
    const HandleNav = async () => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userId = accountResponse.data.id;

            
           
            const planExerciseResponsePOST = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const filteredExerciseIds = planExerciseResponsePOST.data
            .filter(exercise => oldDatePlanIds.includes(exercise.datePlanId)) 
            .map(exercise => exercise.id); 


            for (const id of filteredExerciseIds) {
                await axios.delete(`${BASE_URL}/api/exercise-plans/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                });
            }

            //console.log(`DATE PLAN status: ${datePlanResponsePOST.status}`);


            const DatePlanResponseGET = await axios.get(`${BASE_URL}/api/date-plans?planId.equals=${planID}`,{
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });

            const resDateId = DatePlanResponseGET.data
                .filter(item => item.dateOrder === dayOrder)
                .map(item => item.id); 
            
            const maxIddp = resDateId[0];

            const formDatePlanChange = {
                time: schedule,
                dateOrder: dayOrder,
                planId: planID   
            }

            await axios.put(`${BASE_URL}/api/date-plans/${maxIddp}`, formDatePlanChange, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const postData = exerciseData.map((item, index) => {
                return {
                    setCount: item.sets, 
                    repCount: item.reps, 
                    restTime: item.rest, 
                    sequence: index+1, 
                    exerciseId: item.id,
                    datePlanId: maxIddp, 
                };
            });

            console.log(postData);

            let allRequestsSuccessful = true;

            // const planExerciseResponsePOST = await axios.post(`${BASE_URL}/api/exercise-plans`, postData, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     },
            // });
            //console.log(`DATE PLAN status: ${planExerciseResponsePOST.status}`);

            for (const item of postData) {
                try {
                    const planExerciseResponsePOST = await axios.post(`${BASE_URL}/api/exercise-plans`, item, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
        
                    if (planExerciseResponsePOST.status < 200 || planExerciseResponsePOST.status >= 300) {
                        allRequestsSuccessful = false;
                        break;  
                    }
                } catch (error) {
                    console.error('Error posting data:', error);
                    allRequestsSuccessful = false;
                    break;
                }
            }


            if (allRequestsSuccessful) {
                setModalSuccessVisible(true);
                setTimeout(() => {
                    navigation.navigate('RecustomizePlan', {
                        token : token,
                        planID: planID,
                    });
                }, 3500);
            }
            
        }
        catch (error){
            console.error(error);
        }
    }

    const handleConfirm = () => {
        setSchedule(`${selectedHour}:${selectedMinute}`);
        setModalVisible(false);
    };

    const renderItem = ({ item, onPress, isSelected }) => (
        <TouchableOpacity onPress={onPress}>
            <Text style={[styles.item, isSelected && styles.selectedItem]}>{item}</Text>
        </TouchableOpacity>
    );

    const QuicklyRefresh =  (res) => {
        setExerciseIds(res);
        try {
            setExerciseData([]);
        } catch (err) {
            console.log(err);
        }
    }


    const closeModal2 = () => {
        setModalSuccessVisible(false);
    };
    const closeModal3 = () => {
        setModalEmptyVisible(false);
    };


    const init2 = async () => {
        const token = await AsyncStorage.getItem('accessToken');
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
        
        const resDateId = GetDatePlanResponse.data
                .filter(item => item.dateOrder === dayOrder)
                .map(item => item.id); 
        const ExercisePlanResponse = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const exercisePlanIds = ExercisePlanResponse.data
                .filter(exercise => resDateId.includes(exercise.datePlanId))
                .map(exercise => exercise.exerciseId);  
        //console.log(`length: ${exercisePlanIds.length}`);
        setExerciseIds(exercisePlanIds);
        setOldDatePlanIds(resDateId);
    }

    useEffect(() => {
       init2();
    }, [navigation]);


    const QuicklyRef = async (newExerciseIds = exerciseIds) => {
        try {
            console.log("Current Exercise IDs:", newExerciseIds);
            const publicResponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);
            const dataGET = publicResponse.data
                .filter((exercise) => newExerciseIds.includes(exercise.id))
                .map(({ publicImageUrl, id, caloConsume, name, met, restTime, repCount, setCount }) => {
                    const existingExercise = exerciseData.find((item) => item.id === id);
                    return {
                        id: id,
                        imgsrc: publicImageUrl,
                        propertyDetail: existingExercise ? existingExercise.propertyDetail : `5 sets|5 reps|rest: 5s`,
                        sets: existingExercise ? existingExercise.sets : 5,
                        reps: existingExercise ? existingExercise.reps : 5,
                        rest: existingExercise ? existingExercise.rest : 20,
                        caloConsume,
                        text: name,
                        day: dateOrder,
                    };
                });
    
            const sortedData = dataGET.sort((a, b) => {
                return newExerciseIds.indexOf(a.id) - newExerciseIds.indexOf(b.id);
            });
            setExerciseData(sortedData);
        } catch (err) {
            console.log(err);
        }
    };

    
    useEffect(() => {
        //init2();
        QuicklyRef();
        
    }, [exerciseIds]); 

    useEffect(() => {
        const checkAuth = async () => {
            //console.log(selectedExerciseIds);
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
        <View style={styles.container}>

            <Header1 
                title="Workout" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='CustomPlan'
                />


            <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.planTitle}>
                    <View style={{flexDirection:'row', marginBottom: 20}}>
                    <Text style={styles.text}>Day: {dateOrder}    </Text>
                    <TouchableOpacity style={{alignContent: 'center',
                        width:'50%',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: 'white',
                        borderRadius: 5,}}
                        
                        onPress={() => navigation.navigate('WorkoutExerciseCustom', {
                            exerciseIds,
                            setExerciseIds,
                            //QuicklyRefresh
                        })}
                        >
                        <Text style={styles.text}>+ Add Exercise</Text>
                    </TouchableOpacity>
                    </View>
                    <View style={{flex:1, flexDirection: 'row', flexBasis:'auto', marginHorizontal: 0, justifyContent:'space-between'}}>
                        <Text style={styles.text}>Exercises:</Text>
                        <View style={{flexDirection:'row', marginRight:0}}>
                        <Text style={styles.text}>Schedule on:</Text>
                        <TouchableOpacity style={{
                            alignContent: 'center',
                            width:'35%',
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: 'white',
                            borderRadius: 5,
                            height: 40
                        }}
                        onPress={() => setModalVisible(true)}>    
                        
                            <Text style={[styles.text,  {color:'#fff'}]}>{schedule}</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={{ marginBottom: '5%', flex: 1 }}>
                    {exerciseData.map((exercise, index) => (
                        <ExerciseContentNotDetailNewAction
                            key={index}
                            navigation={navigation}
                            exerciseID={exercise.id}
                            imgsrc={exercise.imgsrc}
                            text={exercise.text}
                            caloConsume={exercise.caloConsume}
                            propertyDetail={exercise.propertyDetail}
                            QuicklyRefresh={QuicklyRefresh}
                            exerciseIds={exerciseIds}
                            onOpenModal={openModal}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DateIndicatorPlan')}>
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.button} onPress={() => HandleNav()}>
                        <Text style={styles.buttonText}>Complete Edit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* <View style={{height: '65%',       
                borderTopWidth: 0,
                paddingBottom: 80,
                zIndex: 10,  }}>
            <FlatList
                    data={exerciseData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <ExerciseContentNotDetailNewAction
                            navigation={navigation}
                            exerciseID={item.id}
                            imgsrc={item.imgsrc}
                            text={item.text}
                            caloConsume={item.caloConsume}
                            propertyDetail={item.propertyDetail}
                            QuicklyRefresh={QuicklyRefresh}
                            exerciseIds={exerciseIds}
                        />
                    )}
                    contentContainerStyle={{ marginBottom: 40, flexGrow: 1}}
                />
            </View> */}


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalEmptyVisible}
                onRequestClose={closeModal3}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ alignItems: 'center',
                        backgroundColor: 'rgb(34,80,58)',
                        borderRadius: 10,
                        padding: 20,
                        alignItems: 'center', }}>
                        <LottieView
                            source={require('../../assets/emptyError.json')} 
                            autoPlay
                            loop={true}
                            style={{ width: 150, height: 150 }}
                        />
                        
                        <Text style={{ fontSize: 16, marginVertical: 10, fontStyle:'italic', color: '#fff' }}>{modalMessage}</Text>

                        <TouchableOpacity onPress={closeModal3} style={{ alignContent: 'center',
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
                        
                        <Text style={{ fontSize: 16, marginVertical: 10, fontStyle:'italic', color: '#fff' }}>Edit data Successful!</Text>

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


            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Set Time</Text>

                        <View style={styles.pickerContainer}>
                            <FlatList
                                data={hours}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                snapToAlignment="center"
                                snapToInterval={50} 
                                decelerationRate="fast"
                                style={styles.flatList}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                renderItem={({ item }) => renderItem({
                                    item,
                                    onPress: () => setSelectedHour(item),
                                    isSelected: item === selectedHour
                                })}
                            />
                            <Text style={styles.separator}>:</Text>
                            <FlatList
                                data={minutes}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                snapToAlignment="center"
                                snapToInterval={50} 
                                decelerationRate="fast"
                                style={styles.flatList}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                renderItem={({ item }) => renderItem({
                                    item,
                                    onPress: () => setSelectedMinute(item),
                                    isSelected: item === selectedMinute
                                })}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {showModal && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer2}>
                            <Text style={styles.modalTitle}>Edit values for Exercise #{selectedExerciseID}</Text>
                            <Text style={styles.TextDesc}>Sets: {sets}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={100}
                                step={1}
                                value={sets}
                                onValueChange={(value) => setSets(value)}
                            />
                            <Text style={styles.TextDesc}>Reps: {reps}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={100}
                                step={1}
                                value={reps}
                                onValueChange={(value) => setReps(value)}
                            />
                            <Text style={styles.TextDesc}>Rest: {rest}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={100}
                                step={1}
                                value={rest}
                                onValueChange={(value) => setRest(value)}
                            />
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Confirm!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
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
    text: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    planTitle: {
        marginTop: '5%',
        marginLeft: '4%',
    },
    button: {
        alignContent: 'center',
        width: '40%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: '5%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
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
        backgroundColor: 'rgb(34,80,58)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white'
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flatList: {
        height: 120,
        width: 60,
    },
    item: {
        height: 40,
        textAlign: 'center',
        fontSize: 18,
        color: '#fff',
    },
    selectedItem: {
        fontWeight: '900',
        fontSize: 30,
        color: 'green',
        fontSize: 18,
    },
    separator: {
        fontSize: 20,
        fontWeight: '900',
        marginHorizontal: 0,
        marginTop: 15,
        color: 'white'
    },
    confirmButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
        borderWidth:2,
        borderColor: '#fff'
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
    },



    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer2: {
        width: '80%',
        padding: 20,
        backgroundColor: 'rgb(34,80,58)',
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 25,
        fontWeight: '700',
        color:'#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 25,
        marginVertical: 10,
    },
    closeButton: {
        alignContent: 'center',
        alignSelf:'center',
        width:'30%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: '5%',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign:'center',

    },
    TextDesc:{
        fontSize: 19,
        fontWeight: 'bold',
        color: '#fff',
    }
});

export default CustomPlanEditingScreen;