import React, { useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, Image, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import SnowFallEffect from "../effects/SnowFlake";
import { useColor } from "../context/ColorContext";
import ImageSlide from "../components/ImageSlide";

const {fromWidth, fromHeight} = Dimensions.get('window');
const HomieScr = ({ navigation }) => {
    const {selectedColor} = useColor();
    const fadeAnim = useRef(new Animated.Value(0)).current; 
    const slideAnim = useRef(new Animated.Value(-100)).current; 
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(true);

    const [forearms, setForearms] = useState('N/A');
    const [shoulder, setShoulder] = useState('N/A');
    const [chest, setChest] = useState('N/A');
    const [waist, setWaist] = useState('N/A');
    const [height, setHeight] = useState('N/A');
    const [weight, setWeight] = useState('N/A');

    const imageData = [
        { id: 0, source: require('../../assets/imageData1.jpg') },
        { id: 1, source: require('../../assets/imageData2.jpg') },
        { id: 2, source: require('../../assets/imageData3.jpg') },
        { id: 3, source: require('../../assets/imageData4.jpg') },
        { id: 4, source: require('../../assets/imageData5.jpg') },
        { id: 5, source: require('../../assets/imageData6.jpg') },
        { id: 6, source: require('../../assets/imageData7.jpg') },
        { id: 7, source: require('../../assets/imageData8.jpg') },
        { id: 8, source: require('../../assets/imageData9.jpg') },
        { id: 9, source: require('../../assets/imageData10.jpg') },
    ];

    // GET DATA USER_ATTRIBUTE
    
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');

            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
            } else {
                navigation.navigate('LoginScreen');
            }
            setLoading(false);
        };


        const GetData = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            const URL_get_uid = `${BASE_URL}/api/account`;
            const response = await axios.get(URL_get_uid, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const UserID = response.data.id;
            const historyAttributeUserResponse = await axios.get(`${BASE_URL}/api/user-attribute-history/all?userId.equals=${UserID}`, {
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataGETHistory = historyAttributeUserResponse.data.map((data) => ({
                historyId: data.id,
                attributeName: data.name,
                unit: data.unit,
                date: data.date,
                measure: data.measure
            }));
            const HistoryAttribute = dataGETHistory.filter((item) => {
                const itemDate = new Date(item.date).toISOString().split('T')[0]; 
                const selectedDate2 = new Date(selectedDate).toISOString().split('T')[0];
                return itemDate === selectedDate2;
            });
            const datahistory = HistoryAttribute || [];
            const User_Attri_URL = `${BASE_URL}/api/user-attributes?userId.equals=${UserID}&page=0&size=20`;
            const Attri_response = await axios.get(User_Attri_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const DataResponse = Attri_response.data;

            const today = new Date();
            //const selectedDate = new Date(selectedDate || today);

            const isToday =
                today.getFullYear() === selectedDate.getFullYear() &&
                today.getMonth() === selectedDate.getMonth() &&
                today.getDate() === selectedDate.getDate();
            //console.log(`Today ?? ${isToday}`);
            
            // DataResponse.forEach(item => {
            //     const attributeName = item.attribute.name;
            //     const measureValue = item.measure;
    
            //     switch (attributeName) {
            //         case 'forearms':
            //             setForearms(measureValue);
            //             break;
            //         case 'shoulders':
            //             setShoulder(measureValue);
            //             break;
            //         case 'chest':
            //             setChest(measureValue);
            //             break;
            //         case 'waist':
            //             setWaist(measureValue);
            //             break;
            //         case 'height':
            //             setHeight(measureValue);
            //             break;
            //         case 'weight':
            //             setWeight(measureValue);
            //             break;
            //         default:
            //             break;
            //     }
            // });
            DataResponse.forEach(item => {
                const attributeName = item.attribute.name;
                const measureValue = item.measure || 'N/A';
                //console.log(measureValue);
                const historyItem = datahistory.find(history => history.attributeName.toLowerCase() === attributeName.toLowerCase());
                //console.log(attributeName);
                if (historyItem && !isToday) {
                    const mes = historyItem.measure || 'N/A';
                    switch (attributeName.toLowerCase()) {
                        case 'weight':
                            setWeight(mes);
                            break;
                        case 'height':
                            setHeight(mes);
                            break;
                        case 'waist':
                            setWaist(mes);
                            break;
                        case 'shoulders':
                            setShoulder(mes);
                            break;
                        case 'forearms':
                            setForearms(mes);
                            break;
                        default:
                            break;
                    }
                }
    
                else if (isToday) {
                    switch (attributeName.toLowerCase()) {
                        case 'weight':
                            setWeight(measureValue);
                            break;
                        case 'height':
                            setHeight(measureValue);
                            break;
                        case 'waist':
                            setWaist(measureValue)
                            break;
                        case 'shoulders':
                            setShoulder(measureValue);
                            break;
                        case 'forearms':
                            setForearms(measureValue);
                            break;
                        default:
                            break;
                    }
                }
            });
        };

        GetData();
        checkAuth();
    }, [navigation, selectedDate]);

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };

    const toggleDropdown = () => {
        setShowPicker(true);
    };

    const onChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (date) {
            //const isoDate = new Date(`${date}T00:00:00Z`).toISOString();
            //console.log(isoDate);
            setSelectedDate(date);
            console.log(date);

        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    const toEnd = -300;
    return (
        <View style={styles.container}>
            <Header1 title="Home" navigation={navigation} isLogin={isLogin} username={username} />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={[styles.body, {backgroundColor: selectedColor}]}>
                    <ImageSlide
                        data={imageData}
                    />

                    <View style={styles.title2Container}>
                        <Text style={styles.text}>Body stat</Text>
                        <TouchableOpacity onPress={toggleDropdown} style={styles.button}>
                            <Text style={styles.text}>{formatDate(selectedDate)}</Text>
                            <Icon name={showPicker ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
                        </TouchableOpacity>
                        {showPicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={onChange}
                            />
                        )}
                    </View>
                    
                    <View style={[styles.mainContainer, {backgroundColor: selectedColor}]}>
                    <SnowFallEffect from={fromHeight} to={toEnd}/>
                        <TouchableOpacity style={[styles.button, { marginTop: 50, alignSelf: 'center', justifyContent: 'center' }]}
                            onPress={() => navigation.navigate('Welcome')}>
                            <Text style={styles.text}>Getting started</Text>
                        </TouchableOpacity>
                        <View style={styles.bodyContainer}>
                            <View style={styles.leftColumn}>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.label}>Neck</Text>
                                    <Text style={styles.value}>N/A</Text>
                                </View>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.label}>Forearms</Text>
                                    <Text style={styles.value}>{forearms} CM</Text>
                                </View>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.label}>Arms</Text>
                                    <Text style={styles.value}>N/A</Text>
                                </View>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.label}>Calves</Text>
                                    <Text style={styles.value}>N/A</Text>
                                </View>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.label}>Body Fat</Text>
                                    <Text style={styles.value}>N/A</Text>
                                </View>
                            </View>

                            <View style={styles.imageContainer}>
                                <Image source={require('../../assets/bodyS.png')} style={styles.image} />
                            </View>

                            <View style={styles.rightColumn}>
                                <View style={styles.itemRight}>
                                    <Text style={styles.label}>Shoulders</Text>
                                    <Text style={styles.value}>{shoulder} CM</Text>
                                </View>
                                <View style={styles.itemRight}>
                                    <Text style={styles.label}>Chest</Text>
                                    <Text style={styles.value}>{chest} CM</Text>
                                </View>
                                <View style={styles.itemRight}>
                                    <Text style={styles.label}>Waist</Text>
                                    <Text style={styles.value}>{waist} CM</Text>
                                </View>
                                <View style={styles.itemRight}>
                                    <Text style={styles.label}>Height</Text>
                                    <Text style={styles.value}>{height} CM</Text>
                                </View>
                                <View style={styles.itemRight}>
                                    <Text style={styles.label}>Weight</Text>
                                    <Text style={styles.value}>{weight} KG</Text>
                                </View>
                            </View>
                        </View>
                        {/* </Animated.View> */}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    titleIMG: {
        width: '100%',
        height: 200,
        opacity: 0.6,
    },
    text: {
        fontSize: 25,
        fontWeight: '700',
        color: '#fff',
    },
    body: {
        height: '100%',
        backgroundColor: 'rgb(34,50,52)',
    },
    title2Container: {
        height: 50,
        marginTop: "0%",
        marginLeft: "2%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        borderColor: '#fff',
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#003b3b',
        padding: 10,
        // marginRight: 10,
        // width: '45%',
        borderRadius: 5,
        height: 55,
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#0F1D25',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: '1.5%',
        marginBottom: '10%',
    },
    bodyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    leftColumn: {
        width: '25%',
    },
    itemLeft: {
        marginBottom: 25,
        width: '100%',
    },
    rightColumn: {
        width: '25%',
    },
    itemRight: {
        alignItems: 'flex-end',
        marginBottom: 25,
        width: '100%',
    },
    label: {
        color: '#ffffff',
        fontSize: 20,
    },
    value: {
        color: '#A8FF1E',
        fontSize: 20,
    },
    imageContainer: {
        // flex: 1,
        width: '50%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '70%',
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },

    snowflake: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 50,
        opacity: 0.8,
    },
});

export default HomieScr;
