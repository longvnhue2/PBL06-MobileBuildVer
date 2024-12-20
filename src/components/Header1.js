import React, {useState, useEffect} from "react";
import {Text, TouchableOpacity, View, StyleSheet, Image, Modal, FlatList, Pressable} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from "axios";
import BASE_URL from "../../IPHelper";

const Header1 = ({ title, navigation, isLogin, username, name }) => {
    const [firstPress, setFirstPress] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [planInstanceID, setPlanInstanceID] = useState(0);
    const [namePlan, setNamePlan] = useState('');
    

    // const [notifications, setNotifications] = useState([
    //     { id: '1', iconName: 'bullseye-arrow', title: 'Plan: ABC, day: 2', description: 'You have a date plan today' },
    //     { id: '2', iconName: 'bullseye-arrow', title: 'Squat', description: 'Your plan has been approved!' },
    //     { id: '3', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '4', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '5', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '6', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '7', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '8', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '9', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    //     { id: '10', iconName: 'bullseye-arrow', title: 'Squat', description: 'Time to do squats!' },
    // ]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const storedState = await AsyncStorage.getItem('state');
            const currentState = storedState === 'true';
            if (!currentState){
                try {
                    const token = await AsyncStorage.getItem('accessToken');
                    const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const userId = accountResponse.data.id;
                    // const instanceIdsListResponse = await axios.get(`${BASE_URL}/api/plan-instances/all?userId.equals=${userId}`, {
                    //     headers: {
                    //         Authorization: `Bearer ${token}`,
                    //     },
                    // });
                    // const inProgressInstances = instanceIdsListResponse.data.filter(instance => instance.status === 'IN_PROGRESS');
                    // if (inProgressInstances.length === 0) {
                    //     console.log('No plan instances in progress.');
                    //     return;
                    // }
                    // const inProgressId = inProgressInstances[0].id; 
                    // const response = await axios.get(`${BASE_URL}/api/date-plan-instances/next?planInstanceId=${inProgressId}`, {
                    //     headers: {
                    //         Authorization: `Bearer ${token}`,
                    //     },
                    // });
                
                    // const data = response.data;
                
                    // // Cập nhật state
                    // setNamePlan(data.planInstance.name);
                    // setPlanInstanceID(data.planInstance.id);
                
                    // const newNotifications = [
                    //     {
                    //         id: data.id.toString(),
                    //         iconName: 'bullseye-arrow',
                    //         description: 'You have a date plan today',
                    //         title: `Plan: ${data.planInstance.name}, day: ${data.datePlan.dateOrder}`,
                    //     },
                    // ];
                    // setNotifications(newNotifications);
                    // setFirstPress(false);
                    const instanceIdsListResponse = await axios.get(`${BASE_URL}/api/plan-instances/all?userId.equals=${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                
                    // Lọc các instance có status === 'IN_PROGRESS'
                    const inProgressInstances = instanceIdsListResponse.data.filter(instance => instance.status === 'IN_PROGRESS');
                    if (inProgressInstances.length === 0) {
                        console.log('No plan instances in progress.');
                        return;
                    }
                    const responses = await Promise.all(
                        inProgressInstances.map(instance =>
                            axios.get(`${BASE_URL}/api/date-plan-instances/next?planInstanceId=${instance.id}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }).catch(error => {
                                console.error(`Error fetching data for planInstanceId ${instance.id}:`, error);
                                return null;
                            })
                        )
                    );
                    const validResponses = responses.filter(response => response && response.data);
                    console.log(`LENGTH: ${validResponses.length}`);
                    const notifications = validResponses.map(response => {
                        const data = response.data;
                        return {
                            id: data.id.toString(),
                            iconName: 'bullseye-arrow',
                            description: 'You have a date plan today',
                            title: `Plan: ${data.planInstance.name}, day: ${data.datePlan.dateOrder}`,
                        };
                    });
                    if (validResponses.length > 0) {
                        const firstResponse = validResponses[0].data;
                        setNamePlan(firstResponse.planInstance.name);
                        setPlanInstanceID(firstResponse.planInstance.id);
                    }
                    setNotifications(notifications);
                    setFirstPress(false);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            }
            else{
                setFirstPress(true);
                setNotifications([]);
            }
        };

        fetchNotifications();
    }, []);

    const handleDeleteItem = (itemId) => {
        setNotifications((prevNotifications) => 
            prevNotifications.filter(item => item.id !== itemId)
        );
        if (notifications.length - 1 <= 0){
            setIsVisible(false);
        }
    } 

    const handleNext = (itemId) => {
        setNotifications((prevNotifications) => 
            prevNotifications.filter(item => item.id !== itemId)
        );
        navigation.navigate('WorkoutPlan', { planInstanceID: planInstanceID, namePlan: namePlan}); 
    }

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.iconName} size={50} color="black" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.description}>{item.description}:</Text>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleNext(item.id)}>
                        <Text style={styles.buttonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleDeleteItem(item.id)} >
                        <Text style={styles.buttonTextD2}>Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const handleBELL = () => {
        setFirstPress(true); 
        setIsVisible(!isVisible);
    };
    

    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('username');
        navigation.navigate('LoginScreen', {name: name}); 
    };

    const naviagateProfile = () => {
        navigation.navigate('Profile')
    }

    return (
        <LinearGradient
            colors={['#0eb9ee', '#097293']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headers}
        >
            <View style={styles.headerContent}>
                <Text style={styles.title1}>{title}</Text>
                {isLogin ? (
                    <View style={styles.loginContainer}>
                        <TouchableOpacity style={styles.textContainer} onPress={naviagateProfile}>
                            <Text style={styles.loginText}>Hello, {username}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.textContainer} onPress={handleLogout}>
                            <Text style={styles.loginText}>(Logout)</Text>
                        </TouchableOpacity>

                        {/* <Image
                            source={require('../../assets/bell.png')}
                            style={styles.bellIcon}
                        /> */}
                        <TouchableOpacity onPress={handleBELL}>
                            <MaterialCommunityIcons
                            name={firstPress ? "bell-outline" : "bell-badge-outline"}
                            size={50}
                            color={firstPress ? "black" : "rgb(241, 181, 15)"}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                )}

                <Modal transparent visible={isVisible} animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={handleBELL}
                >
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                    <View style={styles.circle3} />
                    
                    <View
                        style={[styles.modalContent, { width: '50%', height: 100 }]}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            ItemSeparatorComponent={() => (
                                <View style={{ height: 1, backgroundColor: 'purple', marginVertical: 2 }} />
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            </View>
        </LinearGradient>
    );
};



const styles = StyleSheet.create({
    title1: {
        fontSize: 35,
        fontWeight: '700',
        fontFamily: 'DancingScript-Bold',
    },
    headers: {
        height: 70,
        width: '100%',
        paddingLeft: '2%',
        paddingRight: '2%',
        justifyContent: 'center', 
        paddingTop: '0%',
    },
    headerContent: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flex: 1,
    },
    container: {
        flex: 1, 
    },
    loginContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
    },
    loginButton: {
        borderWidth: 3,
        borderColor: '#0eb9ee',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    textContainer: {
        marginRight: 8
    },
    loginText: {
        fontSize: 18,
        fontWeight:'600',
        color: 'black', 
        fontStyle:'italic'
    },
    bellIcon: {
        width: 35,
        height: 35,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
      },
    modalContent: {
        backgroundColor: 'white',
        marginTop: 185,
        marginRight:'10%',
        alignSelf: 'flex-end',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, 
    },
    text: {
        fontSize: 16,
        color: 'black',
    },
    circle1: {
        position: 'absolute',
        top: 130, 
        left: '88%',
        width: 15,                
        height: 15,               
        borderRadius: 15 / 2,   
        borderWidth: 2,           
        borderColor: "rgb(255, 255, 255)", 
        backgroundColor: "transparent", 
      },
    circle2: {
        position: 'absolute',
        top: 140, 
        left: '75%',
        width: 20,                
        height: 20,               
        borderRadius: 20 / 2,   
        borderWidth: 2,           
        borderColor: "rgb(255, 255, 255)", 
        backgroundColor: "transparent", 
      },
    circle3: {
        position: 'absolute',
        top: 150, 
        left: '62%',
        width: 25,                
        height: 25,               
        borderRadius: 25 / 2,   
        borderWidth: 2,           
        borderColor: "rgb(255, 255, 255)", 
        backgroundColor: "transparent", 
        //alignSelf:'flex-end',
      },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: '20%',
        alignItems: 'center',
        alignSelf: 'center',
    },
    contentContainer: {
        width: '70%',
        marginLeft:'10%'
    },
    description: {
        fontSize: 10,
        color: '#555',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 0,
        justifyContent: 'space-between'
    },
    button: {
        padding: 5,
        borderRadius: 5,
        marginRight: 10,
    },
    buttonText: {
        color: '#007BFF',
        fontSize: 18
    },
    buttonTextD2: {
        color: 'red',
        fontSize: 18
    },
});

export default Header1;