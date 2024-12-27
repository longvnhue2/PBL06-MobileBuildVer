import React, { useState, useRef, useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Modal } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { useColor } from "../context/ColorContext";


const ExerciseDetails = ({navigation, route}) => {
    const {selectedColor} = useColor()
    const [backPage, setBackpage] = useState('');
    const time = route.params?.restTime;
    const propertyDetail = route.params?.propertyDetail || '0 sets, 0 reps';
    const videopath = route.params?.videopath;
    const text = route.params?.text;
    const isFavorited = route.params?.isFavorited;
    const description = route.params?.description;
    const onFavoriteChange = route.params?.onFavoriteChange;
    const ID = route.params?.exerciseID;
    // console.log(videopath);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const video = useRef(null);
    const [isStarFilled, setIsStarFilled] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const aspectRatio = 16 / 9;
    const videoHeight = screenWidth / aspectRatio;
    const setAndRep = route.params?.setAndRep;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    //console.log(setAndRep);

    const showModal = (message) => {
        setModalMessage(message);
        setIsModalVisible(true);
        setTimeout(() => setIsModalVisible(false), 1500);
    };

    const handleIndex = (propertyDetail) => {
        const regEx = propertyDetail.match(/(\d+)\s*sets,\s*(\d+)\s*reps/);
        if (regEx) {
            const setCount = parseInt(regEx[1], 10);
            const repCount = parseInt(regEx[2], 10);
            return { setCount, repCount };
        }
        return { setCount: 0, repCount: 0 };
    }

    const toggleStar = async () => {
        setIsStarFilled(!isStarFilled);
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const userId = accountResponse.data.id;
            const exerciseId = ID;
            console.log(`FAVORITE ${ID}`)
            
            if (!isStarFilled) {
                try {
                    const postResponse = await axios.post(
                        `${BASE_URL}/api/favourite-exercises`,
                        {
                            userId,
                            exerciseId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    await onFavoriteChange(postResponse.status); 
                    if (postResponse.status >= 200 && postResponse.status <= 300){
                        showModal('Added to favorites successfully!');
                    }
                    else{
                        showModal('Failure to adding favorite exercise! :(');
                    }
                    //ToastAndroid.show('Add to favorite successful!', ToastAndroid.SHORT);

                } catch (err) {
                    console.log("Error adding favorite:", err);
                }
            } else {
                try {
                    const getResponse = await axios.get(
                        `${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}&exerciseId.equals=${exerciseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    );
                    
                    const favoriteItem = getResponse.data.find(
                        (item) => item.exerciseId === exerciseId
                    );
                    if (favoriteItem) {
                        const deleteResponse = await axios.delete(
                            `${BASE_URL}/api/favourite-exercises/${favoriteItem.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                }
                            }
                        );
                        await onFavoriteChange(deleteResponse.status); 
                        if (deleteResponse.status >= 200 && deleteResponse.status <= 300){
                            showModal('Successful removing favorite exercise!');
                        }
                        else{
                            showModal('Failure to remove favorite exercise! :(');
                        }
                        //ToastAndroid.show('Successful removed from favorite!', ToastAndroid.SHORT);
                      
                    } else {
                        console.log("Favorite item not found for deletion.");
                    }
                } catch (err) {
                    console.log("Error deleting favorite:", err);
                }
            }
            //await props.onFavoriteChange();
        } catch (err) {
            console.log("Error fetching account data:", err);
        }
        
    };


    useEffect(() => {
        setIsStarFilled((isFavorited === 1) ? true : false);
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
        const backNavigate = route.params.back;
        setBackpage(backNavigate);
        console.log(backNavigate);
        checkAuth();
    }, [navigation]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const { setCount, repCount } = propertyDetail ? handleIndex(propertyDetail) : { setCount: 0, repCount: 0 };
    const totalTimeRest = time;

    return (
        <View style={[styles.container, {backgroundColor: selectedColor}]}>
            <Header1 title="Workout" 
                    navigation={navigation} 
                    isLogin={isLogin} 
                    username={username} 
                    name='ExerciseDetails'
                    />



            <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.titleContent}>
                        <Text style={styles.text}>
                         {text}:
                        </Text>
                    <TouchableOpacity onPress={toggleStar}>
                        <Icon name={isStarFilled ? 'star' : 'star-o'} size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={{height: 300}}>
                    <WebView
                        style={styles.video}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        source={{ uri: `${videopath}` }}
                    />
                </View>

                <View style={{marginVertical: '3%'}}>
                    <Text style={styles.desTitle}>
                        Description:
                    </Text>
                </View>

                <View>
                    <Text style={styles.des}>
                       {description}
                    </Text>
                </View>
                {/* <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={styles.intensityContainer}>
                        <Text style={styles.type}>{setAndRep[0].setCount >= 2 ? 'Sets:' : 'Set:'}</Text>
                        <View style={styles.border}>
                            <Text style={styles.number}>{setAndRep[0].setCount}</Text>
                        </View>
                    </View>
                    <View style={styles.intensityContainer}>
                        <Text style={styles.type}>{setAndRep[0].repCount >= 2 ? 'Reps:' : 'Rep:'}</Text>
                        <View style={styles.border}>
                            <Text style={styles.number}>{setAndRep[0].repCount}</Text>
                        </View>
                    </View>
                    <View style={styles.intensityContainer}>
                        <Text style={styles.type}>Rest:</Text>
                        <View style={styles.border}>
                            <Text style={styles.number}>{totalTimeRest}</Text>
                        </View>
                        <Text style={styles.type}>s</Text>
                    </View>
                </View> */}
            </ScrollView>

            {/* <View style={{ alignItems: 'center', marginBottom: '18%', marginTop: '3%'}}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomPlan')}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View> */}


            <Modal visible={isModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>{modalMessage}</Text>
                    </View>
                </View>
            </Modal>

            {/* Footer */}
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
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    titleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'space-between',
    },
    video: {
        height: '100%',
    },
    desTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
    },
    des: {
        fontSize: 20,
        fontWeight: '700',  
        color: 'white',
        marginHorizontal: 20,
        textAlign: 'justify',
        marginBottom: '3%',
    },
    intensityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%'
    },
    type: {
        fontSize: 25,
        color: "#fff",
        fontWeight: '700',
    },
    border: {
        borderWidth: 1,
        borderColor: '#fff',
        width: '25%',
        marginHorizontal: '4%',
        alignItems: 'center',
    },
    number: {
        fontSize: 25,
        color: "#fff",
        fontWeight: '700',
    },
    button: {
        alignContent: 'center',
        width: '30%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 8,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'transparent', 
    },
    toast: {
        marginBottom: 50, 
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toastText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default ExerciseDetails;
