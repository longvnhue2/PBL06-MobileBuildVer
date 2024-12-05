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

const {fromWidth, fromHeight} = Dimensions.get('window');
const HomieScr = ({ navigation }) => {
    
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

    // GET DATA USER_ATTRIBUTE
    const GetData = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        const URL_get_uid = `${BASE_URL}/api/account`;
        const response = await axios.get(URL_get_uid, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const UserID = response.data.id;

        const User_Attri_URL = `${BASE_URL}/api/user-attributes?userId.equals=${UserID}&page=0&size=20`;
        const Attri_response = await axios.get(User_Attri_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const DataResponse = Attri_response.data;

        DataResponse.forEach(item => {
            const attributeName = item.attribute.name;
            const measureValue = item.measure;

            switch (attributeName) {
                case 'forearms':
                    setForearms(measureValue);
                    break;
                case 'shoulder':
                    setShoulder(measureValue);
                    break;
                case 'chest':
                    setChest(measureValue);
                    break;
                case 'waist':
                    setWaist(measureValue);
                    break;
                case 'height':
                    setHeight(measureValue);
                    break;
                case 'weight':
                    setWeight(measureValue);
                    break;
                default:
                    break;
            }
        });
    };


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

        GetData();
        checkAuth();
    }, [navigation]);

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
            setSelectedDate(date);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    const toEnd = -265;
    return (
        <View style={styles.container}>
            <Header1 title="HomeZ" navigation={navigation} isLogin={isLogin} username={username} />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.body}>
                    <Image
                        style={styles.titleIMG}
                        source={require('../../assets/accel.jpg')}
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
                    
                    <View style={styles.mainContainer}>
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
        marginTop: "2%",
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
    itemLeft: {
        marginBottom: 25,
        width: '100%',
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
        flex: 1,
        alignItems: 'center',
    },
    image: {
        // width: '100%',
        height: '80%',
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
