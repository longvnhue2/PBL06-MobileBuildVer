import React, { useState , useEffect, useRef} from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator,  Modal, FlatList, Animated, Dimensions, TextInput, Image } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import ExerciseContent from "../components/ExerciseContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';

const PostExerciseScreen = ({navigation}) => {
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const [exerciseName, setExerciseName] = useState('');
    const [exerciseDescription, setExerciseDescription] = useState('');
    const [setCount, setSetCount] = useState(0)
    const [repCount, setRepCount] = useState(0)
    const [imageUri, setImageUri] = useState('');
    const [videoUri, setVideoUri] = useState('');
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['red', 'blue', 'green'], 
    });

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
        checkAuth();
    }, [navigation]);


    const [showErrorModal, setShowErrorModal] = useState(false);

    const handleMediaPicker = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission to access camera roll is required!");
            return;
        }

        const result = type === 'image'
            ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsEditing: true, quality: 1 });

        if (!result.canceled) {
            type === 'image' ? setImageUri(result.assets[0].uri) : setVideoUri(result.assets[0].uri);
        }
    };

    const handleNextStep = async () => {
        // console.log(exerciseName);
        // console.log(exerciseDescription);
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const AdIDres = await axios.get(`${BASE_URL}/api/account`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const AdID = AdIDres.data.id;
            const datapost = {
                name: exerciseName,
                description: exerciseDescription,
                userId: AdID
            };
            if (!exerciseName){
                setShowErrorModal(true);
            }
            else{
                const postFirstResponse = await axios.post(`${BASE_URL}/api/exercises`, datapost ,{
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });
                const status = postFirstResponse.status;
                const idnew = postFirstResponse.data.id;
                if (status >= 200 && status < 300) {
                    console.log('Exercise added successfully:', postFirstResponse.data.id);
                } else {
                    console.error('Error in adding exercise. Status code:', status);
                    setShowErrorModal(true);
                }
            }
        }
        catch(err){
            console.error(err);
            setShowErrorModal(true); 
        }
    };


    return( 
        <View style={styles.container}>
            <Header1 title="Workout" navigation={navigation} isLogin={isLogin} username={username} name='PostExercise'/>
            
            <ScrollView contentContainerStyle={styles.bodyContent}>

                <Modal
                    visible={showErrorModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowErrorModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <LottieView
                                source={require('../../assets/catError.json')}
                                autoPlay
                                loop
                                style={styles.lottieError}
                            />
                            <Text style={styles.modalText}>Something went wrong. Please try again later...</Text>
                            <TouchableOpacity onPress={() => setShowErrorModal(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <View style={styles.titleContent}>
                    <TouchableOpacity onPress={() => navigation.navigate('WorkoutExerciseList')}>
                        <Text style={styles.text}>
                        ↼ Adding Exercise:
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bodyContainer}>
                    <ScrollView style={styles.bottomPanel}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Exercise Name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter exercise name"
                            placeholderTextColor="#999"
                            onChangeText={setExerciseName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description:</Text>
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Enter exercise description"
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={3}
                            onChangeText={setExerciseDescription}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Set Count:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number of sets"
                            placeholderTextColor="#999"
                            onChangeText={setExerciseName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Rep Count:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number of reps"
                            placeholderTextColor="#999"
                            onChangeText={setExerciseName}
                        />
                    </View>

                    {/* <View style={styles.inputGroup}>
                        <TouchableOpacity onPress={() => handleMediaPicker('image')} style={styles.uploadButton}>
                            <Text style={styles.uploadButtonText}>Upload Image</Text>
                        </TouchableOpacity>
                        {imageUri ? <Text style={styles.uploadedText}>Image Selected: {imageUri}</Text> : null}
                    </View> */}

                    {/* <View style={styles.inputGroup}>
                        <TouchableOpacity onPress={() => handleMediaPicker('video')} style={styles.uploadButton}>
                            <Text style={styles.uploadButtonText}>Upload Video</Text>
                        </TouchableOpacity>
                        {videoUri ? <Text style={styles.uploadedText}>Video Selected: {videoUri}</Text> : null}
                    </View> */}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Upload Image:</Text>
                        <TextInput
                            style={[styles.input, {width: '85%'}]}
                            placeholder="Upload your image"
                            placeholderTextColor="#999"
                            onChangeText={setExerciseName}
                            readOnly
                        />
                        <Icon 
                            name='folder-open-o'
                            style={styles.iconFolder}
                            onPress={() => handleMediaPicker('image')}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Upload Video:</Text>
                        <TextInput
                            style={[styles.input, {width: '85%'}]}
                            placeholder="Upload your video"
                            placeholderTextColor="#999"
                            onChangeText={setExerciseName}
                            readOnly
                        />
                        <Icon 
                            name='folder-open-o'
                            style={styles.iconFolder}
                            onPress={() => handleMediaPicker('video')}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.nextButton} onPress={() => handleNextStep()}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                    </ScrollView>

                    {/* <Animated.View style={[styles.topPanel, { borderColor }]}>
                        <Icon name='info-circle' color='#000' size={40}/>
                        <Text style={styles.infoText}>
                            Posting exercise to list. If you complete step 1, come to step 2 for video and image demo upload! Thank you!
                        </Text>
                    </Animated.View> */}
                </View>
            </ScrollView>


            {/* <View style={styles.imageContainer}>
                <Image source={require('../../assets/info.png')} style={styles.image} />
            </View> */}


            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(34,50,52)',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#10132A',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    bodyContent: {
        flexGrow: 1,
    },
    text: {
        fontSize: 25,
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
    bodyContainer: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 10,
    },
    bottomPanel: {
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
    },
    topPanel: {
        flex: 0.3,
        padding: 20,
        borderWidth: 3, 
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(117, 179, 211, 1)',
    },
    infoText: {
        color: 'black',
        fontSize: 15,
        textAlign: 'auto',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        color: 'white',
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#40444B',
        color: 'white',
        borderRadius: 5,
        padding: 10,
        fontSize: 14,
    },
    imageContainer: {
        position: 'absolute',
        bottom: 70,
        left: '60%',
        alignItems: 'center',
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 40,
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
    },
    descriptionInput: {
        height: 100, 
        textAlignVertical: 'top', 
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    nextButton: {
        borderColor:'#fff', borderWidth:2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#275219',
        padding: 10,
        width: '25%',
        borderRadius: 5,
        height: 55,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'rgb(34,90,82)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    lottieError: {
        width: 220,
        height: 220,
    },
    modalText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: 'white',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20
    },
    uploadButton: {
        backgroundColor: '#275219',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
    },
    uploadedText: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    iconFolder: {
        color: 'white',
        fontSize: 45,
        position: 'absolute',
        bottom: 0,
        right: 0
    }
});

export default PostExerciseScreen;