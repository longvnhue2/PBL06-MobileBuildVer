import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, TextInput, Dimensions, ImageBackground, Modal, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../IPHelper";
import LottieView from "lottie-react-native";
const { width } = Dimensions.get('window');

const slideshow = [
    { 
        id: '001', 
        type: 'text', 
        title: 'Welcome to the world of fitness, where health and vitality are not just goals but a way of life. In today’s fast-paced environment, taking care of ourselves through exercise not only enhances physical well-being but also boosts mental health, helping us feel confident and energized. Each individual\'s expectations when embarking on a fitness journey may vary, whether it’s losing weight, building muscle, or maintaining a healthy lifestyle. Let’s explore the methods, habits, and motivations to achieve these goals together, creating a strong body and resilient mind as we work towards a brighter future.' 
    },
    {
        id: '002',
        type: 'input',
        inputs: [
            { placeholder: 'First Name', title: 'Enter your first name', name: 'firstName' },
            { placeholder: 'Last Name', title: 'Enter your last name', name: 'lastName' },
            { placeholder: 'Birthday', title: 'Select your birthday', isDatePicker: true },
        ],
    },
    {
        id: '003',
        type: 'selector',
        title: 'Please select your measurements:',
    },
    {
        id: '004',
        type: 'radio',
        description: 'Fitness is a lifelong journey that promotes physical health and mental well-being. It involves regular exercise, balanced nutrition,',
        title: 'Select your fitness level:',
        options: [
            { label: 'Beginner', value: 'BEGINNER' },
            { label: 'Intermediate', value: 'INTERMEDIATE' },
            { label: 'Advanced', value: 'ADVANCED' }
        ]
    },
    { id: '005', type: 'text', title: 'Fitness is a lifelong journey that promotes physical health and mental well-being. It involves regular exercise, balanced nutrition, and mindful practices that enhance our quality of life. Embracing fitness empowers us to build resilience, boost confidence, and cultivate a positive mindset. By prioritizing our health through enjoyable activities, we unlock our potential and pave the way for a happier, more vibrant life. Let’s commit to this journey and inspire others along the way.' },

];

const WelcomeScreen =  ({ navigation }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [token, setToken] = useState('')
    const [index, setIndex] = useState(0);
    const flatListRef = useRef(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateString, setDateString] = useState(date.toLocaleDateString());
    const [buttonText, setButtonText] = useState('Next');

    const [weight, setWeight] = useState(70); 
    const [height, setHeight] = useState(170);
    const [waist, setWaist] = useState(80);
    const [shoulders, setShoulders] = useState(50);
    const [Forearms, setforearms] = useState(40);
    const gifList = [
        require('../../assets/welcome1.gif'),
        require('../../assets/Welcome2.gif'),
        require('../../assets/Welcome3.gif'),
        require('../../assets/Welcome4.gif'),
    ];

    const [modalVisible, setModalVisible] = useState(false);
    const [currentAttribute, setcurrentAttribute] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const [currentGifIndex, setCurrentGifIndex] = useState(0);

    const [userData, setUserData] = useState({
        id: 0,
        email: '',
        firstName: '',
        lastName: '',
        birthday: new Date().toISOString(),
        level: "BEGINNER",
        roleId: 0,
        role: {
            id: 0,
            name: ''
        }
    })
    

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
    });
    //BE///////////////////////////////////



    useEffect(() => {
        const gifChangeInterval = setInterval(() => {
            setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifList.length);  
        }, 8000);  

        return () => clearInterval(gifChangeInterval);
    }, []); 


    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setToken(token)

            if (!token) {
                navigation.navigate('LoginScreen');
                return
            }
            setIsLogin(true);

            try {
                const userAttribute = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                //console.log(userAttribute.data);
                setUserData(prev => ({
                    ...prev,
                    id: userAttribute.data.id,
                    email : userAttribute.data.email,
                    firstName : userAttribute.data.firstName,
                    lastName : userAttribute.data.lastName,
                    birthday : userAttribute.data.birthday,
                    level: "BEGINNER",
                    roleId: userAttribute.data.role ? userAttribute.data.role.id : 0,
                    role: {
                        id: userAttribute.data.role ? userAttribute.data.role.id : 0,
                        name: userAttribute.data.role ? userAttribute.data.role.name : ''
                    }
                }));
                //console.log(userData);
            }
            catch (err) {
                console.log(err)
            }
            finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [navigation]);

    const convertToISODateString = (dateString) => {
        
        const [month, day, year] = dateString.split('/');
    
        
        const isoDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
        
        return isoDateString;
    };

    const handleNext = async () => {
        if (index >= slideshow.length - 2) {
            setButtonText('Start your fitness journey!');
            setUserData(prev => ({
                ...prev,
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthday : date,
                level : selectedLevel
            }));
            
        } else {
            setButtonText('Next');
        }
        if (index < slideshow.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
            flatListRef.current.scrollToIndex({ animated: true, index: newIndex });
        } else {

            setLoading(true);
            
            const token = await AsyncStorage.getItem('accessToken');
            const usernameRegis = await AsyncStorage.getItem('usernameReg');
            const passwordRegis = await AsyncStorage.getItem('passwordReg');
            const emailRegis = await AsyncStorage.getItem('emailReg');
            const url = `${BASE_URL}/api/account`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            let userId = response.data.id; 
            //await AsyncStorage.setItem('currentuserId', String(userId));
            console.log(userId);
            //alert(userId);

            
            const User_Attri_URL = `${BASE_URL}/api/user-attributes?userId.equals=${userId}&page=0&size=20`;
            const Attri_response = await axios.get(User_Attri_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const DataResponse = Attri_response.data;
            //alert(JSON.stringify(DataResponse));
            const attributesArray = [
                {
                    name: "WW",
                    isFocus: true,
                    measure: weight,
                    measureGoal: 9696,
                    unit: "KG",
                    userId: userId,
                    attributeId : 1
                },
                {
                    name: "Height",
                    isFocus: true,
                    measure: height,
                    measureGoal: 6969,
                    unit: "CM",
                    userId: userId,
                    attributeId : 2
                },
                {
                    name: "Waist",
                    isFocus: true,
                    measure: waist,
                    measureGoal: 100,
                    unit: "CM",
                    userId: userId,
                    attributeId : 3
                },
                {
                    name: "Shoulders",
                    isFocus: true,
                    measure: shoulders,
                    measureGoal: 100,
                    unit: "CM",
                    userId: userId,
                    attributeId : 4
                },
                {
                  name: "Forearms",
                  isFocus: false,
                  measure: Forearms,
                  measureGoal: 100,
                  unit: "CM",
                  userId: userId,
                  attributeId : 5
                }
              ];
                            
            //   console.log(formData);
            //   console.log(date);
            //console.log(DataResponse);
            if (!DataResponse || DataResponse.length === 0) {
                console.log(attributesArray);  
                const Add_URL = `${BASE_URL}/api/user-attributes`;
                try {
                    const response1 = await axios.post(Add_URL, attributesArray[0], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response1.data);
                
                    const response2 = await axios.post(Add_URL, attributesArray[1], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response2.data);
                
                    const response3 = await axios.post(Add_URL, attributesArray[2], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response3.data);
                
                    const response4 = await axios.post(Add_URL, attributesArray[3], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response4.data);
                
                    const response5 = await axios.post(Add_URL, attributesArray[4], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response5.data);
                    // for (let attribute of attributesArray) {
                    //     const response = await axios.post(Add_URL, JSON.stringify(attribute), {
                    //         headers: {
                    //             Authorization: `Bearer ${token}`,
                    //             "Content-Type": "application/json"
                    //         }
                    //     });
                    //     console.log(response.data);
                    // }
                } catch (error) {
                    console.error(error.response ? error.response.data : error.message);
                }
            } else {
                const ATT_ID = DataResponse[0].id;
                console.log(ATT_ID);
                const attributesArrayEdit = [
                    {
                      id: ATT_ID,  
                      name: "Weight",
                      isFocus: true,
                      measure: weight,
                      measureGoal: 9696,
                      unit: "KG",
                      userId: userId,
                      attributeId : 1
                    },
                    {
                      id: ATT_ID + 1,
                      name: "Height",
                      isFocus: true,
                      measure: height,
                      measureGoal: 6969,
                      unit: "CM",
                      userId: userId,
                      attributeId : 2
                    },
                    {
                      id: ATT_ID + 2,
                      name: "Waist",
                      isFocus: true,
                      measure: waist,
                      measureGoal: 100,
                      unit: "CM",
                      userId: userId,
                      attributeId : 3
                    },
                    {
                      id: ATT_ID + 3,  
                      name: "Shoulders",
                      isFocus: true,
                      measure: shoulders,
                      measureGoal: 100,
                      unit: "CM",
                      userId: userId,
                      attributeId : 4
                    },
                    {
                      id: ATT_ID + 4,  
                      name: "Forearms",
                      isFocus: false,
                      measure: Forearms,
                      measureGoal: 100,
                      unit: "CM",
                      userId: userId,
                      attributeId : 5
                    }
                  ];              
                
                const Edit_URL_weight = `${BASE_URL}/api/user-attributes/${ATT_ID}`;
                const Edit_URL_height = `${BASE_URL}/api/user-attributes/${ATT_ID+1}`;
                const Edit_URL_waist = `${BASE_URL}/api/user-attributes/${ATT_ID+2}`;
                const Edit_URL_shoulder = `${BASE_URL}/api/user-attributes/${ATT_ID+3}`;
                const Edit_URL_forearms = `${BASE_URL}/api/user-attributes/${ATT_ID+4}`;
                try{
                    const response1 = await axios.put(Edit_URL_weight, attributesArrayEdit[0], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response1.data);
                
                    const response2 = await axios.put(Edit_URL_height, attributesArrayEdit[1], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response2.data);
                
                    const response3 = await axios.put(Edit_URL_waist, attributesArrayEdit[2], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response3.data);
                
                    const response4 = await axios.put(Edit_URL_shoulder, attributesArrayEdit[3], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response4.data);
                
                    const response5 = await axios.put(Edit_URL_forearms, attributesArrayEdit[4], {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    console.log(response5.data);
                }
                catch (error) {
                    console.error(error.response ? error.response.data : error.message);
                }
            }

            
            
            

            try {
                
                await axios.put(`${BASE_URL}/api/account`, userData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            }
            catch (err) {
                console.error("Error updating user data:", err);
            }
            console.log(userData);
            setLoading(false);
            navigation.navigate('HomieScr');
            
        }
    };

    
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        
       
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0');
    
        const isoDateString = `${year}-${month}-${day}T00:00:00Z`;
    
        setDate(currentDate);
        setDateString(isoDateString);
    };
    

    const openModal = (measurement) => {
        setcurrentAttribute(measurement);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setcurrentAttribute('');
    };

    const selectValue = (value) => {
        if (currentAttribute === 'weight') setWeight(value);
        else if (currentAttribute === 'height') setHeight(value);
        else if (currentAttribute === 'waist') setWaist(value);
        else if (currentAttribute === 'forearms') setforearms(value);
        else if (currentAttribute === 'shoulders') setShoulders(value);
        closeModal();
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.container}>
                {item.type === 'text' && (
                    <View style={styles.firstSlide}>
                       <LottieView
                            source={require('../../assets/fitnessWelcome1.json')} 
                            autoPlay
                            loop
                            style={{width: '100%', height: 300}}
                        />
                        <Text style={[styles.text, {textAlign:"center"}]}>
                            {item.title}
                        </Text>
                    </View>
                )}
                {item.type === 'input' && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.toptitle}>Let's know about you!</Text>
                        <View style={styles.inputBody}>
                        {item.inputs && item.inputs.map((inputItem, index) => (
                            <View key={index} style={styles.itemInput}>
                                <Text style={styles.inputLabel}>{inputItem.title}</Text>
                                {inputItem.isDatePicker ? (
                                    Platform.OS === 'ios' ? ( 
                                        <TextInput
                                            placeholder={inputItem.placeholder}
                                            style={styles.input}
                                            value={dateString}
                                            onChangeText={setDateString} 
                                            placeholderTextColor="#ccc"
                                        />
                                    ) : (
                                        <>
                                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                                <TextInput
                                                    placeholder={inputItem.placeholder}
                                                    style={styles.input}
                                                    value={date.toLocaleDateString()} 
                                                    editable={false}
                                                    placeholderTextColor="#ccc"
                                                />
                                            </TouchableOpacity>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={date}
                                                    mode="date"
                                                    display="default"
                                                    onChange={handleDateChange}
                                                />
                                            )}
                                        </>
                                    )
                                ) : (
                                    <TextInput
                                        placeholder={inputItem.placeholder}
                                        style={styles.input}
                                        value={formData[inputItem.name]}
                                        onChangeText={(value) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                [inputItem.name]: value,
                                            }));
                                        }}
                                        placeholderTextColor="#ccc"
                                    />
                                )}
                            </View>
                        ))}
                        </View>
                    </View>
                )}

                {item.type === 'radio' && (
                <View style={styles.radioContainer}>
                    <Text style={styles.toptitle}>
                        {item.title}
                    </Text>

                    <View style={styles.description}>
                        <Text style={styles.descriptionTitle}>
                            Description:
                        </Text>

                        <Text style={styles.descriptionText}>
                            {item.description}
                        </Text>
                    </View>
                    

                    <View style={styles.radioSelect}>
                        <Text style={styles.radioSelectText}>Select your fitness level here:</Text>
                        <View style={styles.radioMain}>
                        {item.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.radioSelection}
                                onPress={() => {setSelectedLevel(option.value);}}
                            >
                                <View style={{
                                    height: 20,
                                    width: 20,
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor : '#fff',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                }}>
                                    {selectedLevel === option.value && (
                                        <View style={{
                                            height: 10,
                                            width:  10,
                                            borderRadius: 5,
                                            backgroundColor: '#fff',
                                        }}/>
                                    )}
                                </View>
                                <Text style={{ color: '#fff', fontSize: 18 }}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
                    </View>
                </View>
                )}
                
                {item.type === 'selector' && (
                    <View style={styles.inputContainer}>
                    <Text style={styles.toptitle}>Let's know about you!</Text>
                    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <View style={styles.skewedContainer}>
                            <TouchableOpacity style={styles.selectorBox} onPress={() => openModal('weight')}>
                                <Text style={styles.selectorText}>{weight}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Height (cm)</Text>
                        <View style={styles.skewedContainer}>
                            <TouchableOpacity style={styles.selectorBox} onPress={() => openModal('height')}>
                                <Text style={styles.selectorText}>{height}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Waist (cm)</Text>
                        <View style={styles.skewedContainer}>
                            <TouchableOpacity style={styles.selectorBox} onPress={() => openModal('waist')}>
                                <Text style={styles.selectorText}>{waist}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Shoulders (cm)</Text>
                        <View style={styles.skewedContainer}>
                            <TouchableOpacity style={styles.selectorBox} onPress={() => openModal('shoulders')}>
                                <Text style={styles.selectorText}>{shoulders}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Forearms (cm)</Text>
                        <View style={styles.skewedContainer}>
                            <TouchableOpacity style={styles.selectorBox} onPress={() => openModal('forearms')}>
                                <Text style={styles.selectorText}>{Forearms}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                )}
            </View>
        );
    }
    
    ;
    

    const renderModal = () => {
        const values = Array.from({ length: 200 }, (_, i) => i + 1);
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select {currentAttribute}</Text>
                        <ScrollView>
                            {values.map(value => (
                                <TouchableOpacity
                                    key={value}
                                    style={styles.modalItem}
                                    onPress={() => selectValue(value)}
                                >
                                    <Text style={styles.modalItemText}>{value}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <ImageBackground
            source={gifList[currentGifIndex]} 
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={slideshow}
                    horizontal
                    pagingEnabled
                    scrollEnabled
                    onScroll={({ nativeEvent }) => {
                        const newIndex = Math.floor(nativeEvent.contentOffset.x / width);
                        setIndex(newIndex);
                    }}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            )}
            {renderModal()}
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
    };

const styles = StyleSheet.create({
    container: {
        width,
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 20
    },
    firstSlide: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // image: {
        
    // },
    text: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'justify'
    },
    inputContainer: {
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    toptitle:{
        fontSize:35, 
        fontWeight:'700', 
        color:'#00e600',
        marginTop: 5,
        marginBottom: 25
    },
    inputBody: {
        width: '100%',
        height: '85%',
        justifyContent: 'center'
    },
    itemInput: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight:'800',
        fontFamily:'Roboto'
    },
    input: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius:5,
        backgroundColor:"#006600",
        fontSize: 18,
        color: '#fff',
        padding: 10,
        marginTop: 10,
    },
    button: {
        alignSelf: 'center',
        width: '50%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: '5%',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    skewedContainer: {
        marginBottom: 10,
    },
    radioContainer: {
        width: '100%',
        height: '70%',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    description: {

    },
    descriptionTitle: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    descriptionText: {
        fontSize: 22,
        color: 'white',
        textAlign: 'justify',
        paddingHorizontal: 20,
    },
    radioSelect: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    radioSelectText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingHorizontal: 10,
    },
    radioMain: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    radioSelection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    selectorBox: {
        marginTop: 5,
        transform: [{ skewX: '-20deg'}], 
        width: '100%',
        paddingVertical: 15,
        backgroundColor: '#006600',
        marginBottom: 10,
        alignItems: 'center',
        position: 'relative',
        borderLeftWidth: 12,
        borderLeftColor: 'transparent',
        borderRightWidth: 12,
        borderRightColor: 'transparent',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRadius:5,
        borderColor:'#fff'
    },
    selectorText: {
        fontSize: 20,
        color: '#fff',
    },
    label: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        height:'70%',
        backgroundColor: 'rgb(34,50,52)',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 30,
        fontWeight:'700',
        marginBottom: 20,
        color:'#fff',
        textAlign: 'center',
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        alignItems:'center',
        borderColor: '#ccc',
    },
    modalItemText: {
        fontSize: 20,
        color:'#fff',
    },
    modalCloseButton: {
        marginTop: 15,
        backgroundColor: 'rgba(34,139,34,0.5)',
        padding: 10,
        borderRadius: 5,
        borderWidth:2,
        borderColor: '#fff',
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 20,
        color:'#fff',
    },
});

export default WelcomeScreen;