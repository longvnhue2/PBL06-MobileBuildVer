import React, {useState, useEffect} from "react";
import {Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, TextInput, Button, ActivityIndicator} from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome5';
import ProgressOnline from "../components/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderForProfile from "../components/HeaderForProfile";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { Header } from "react-navigation-stack";
import { useColor } from "../context/ColorContext";

const ProgressScreen = ({navigation, route}) => {
    const {selectedColor} = useColor()
    const [currentWeight, setCurrentWeight] = useState('N/A');
    const [currentForearms, setCurrentForearms] = useState('N/A');
    const [currentHeight, setCurrentHeight] = useState('N/A');
    const [currentShoulders, setCurrentShoulders] = useState('N/A');
    const [currentWaist, setCurrentWaist] = useState('N/A');


    const [goalWeight, setgoalWeight] = useState('N/A');
    const [goalForearms, setgoalForearms] = useState('N/A');
    const [goalHeight, setgoalHeight] = useState('N/A');
    const [goalShoulders, setgoalShoulders] = useState('N/A');
    const [goalWaist, setgoalWaist] = useState('N/A');

    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const [UID, setUID] = useState(0);


    const GetData = async () => {
        const datahistory = route.params?.HistoryAttribute || [];
        const token = await AsyncStorage.getItem('accessToken');
        const URL_get_uid = `${BASE_URL}/api/account`;
        const response = await axios.get(URL_get_uid, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const UserID = response.data.id;
        setUID(UserID);
        const User_Attri_URL = `${BASE_URL}/api/user-attributes?userId.equals=${UserID}&page=0&size=20`;
        const Attri_response = await axios.get(User_Attri_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const DataResponse = Attri_response.data;
        DataResponse.forEach(item => {
            const attributeName = item.attribute.name;
            const measureValue = item.measure || 'N/A';
            const goalValue = item.measureGoal || 'N/A';
            const historyItem = datahistory.find(history => history.attributeName.toLowerCase() === attributeName.toLowerCase());
            if (historyItem) {
                const mes = historyItem.measure || 'N/A';
                switch (attributeName.toLowerCase()) {
                    case 'weight':
                        setCurrentWeight(mes);
                        break;
                    case 'height':
                        setCurrentHeight(mes);
                        break;
                    case 'waist':
                        setCurrentWaist(mes);
                        break;
                    case 'shoulders':
                        setCurrentShoulders(mes);
                        break;
                    case 'forearms':
                        setCurrentForearms(mes);
                        break;
                    default:
                        break;
                }
            }

            else {
                switch (attributeName.toLowerCase()) {
                    case 'weight':
                        setCurrentWeight(measureValue);
                        break;
                    case 'height':
                        setCurrentHeight(measureValue);
                        break;
                    case 'waist':
                        setCurrentWaist(measureValue)
                        break;
                    case 'shoulders':
                        setCurrentShoulders(measureValue);
                        break;
                    case 'forearms':
                        setCurrentForearms(measureValue);
                        break;
                    default:
                        break;
                }
            }
        
            switch (attributeName) {
                case 'forearms':
                    setgoalForearms(goalValue);
                    break;
                case 'shoulder':
                    setgoalShoulders(goalValue);
                    break;
                case 'waist':
                    setgoalWaist(goalValue);
                    break;
                case 'height':
                    //setCurrentHeight(measureValue);
                    setgoalHeight(goalValue);
                    break;
                case 'weight':
                    // setCurrentWeight(measureValue);
                    setgoalWeight(goalValue);
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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    // console.log(goalForearms);
    // console.log(goalHeight);
    // console.log(goalShoulders);
    // console.log(goalWaist);
    // console.log(goalWeight);
    return <View style={[styles.container, {backgroundColor: selectedColor}]}>
        <Header1
                title="Profile" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='Progress'
                />


        <ScrollView>
            <View style={styles.titleContainer}>
                <Text style={styles.c1Text}></Text>
                <Text style={styles.c2Text}>Current</Text>
                <Text style={styles.c3Text}>Progress</Text>
                <Text style={styles.c4Text}>Goal</Text>
            </View>

            <View style={styles.rowContainer}>
                <ProgressOnline 
                    attID='1'
                    userID={UID}
                    type="weight"
                    init={currentWeight} 
                    goal={goalWeight} 
                    iconName="weight"
                    unit="KG"
                />

                <ProgressOnline 
                    attID='2'
                    userID={UID}
                    type="Height"
                    init={currentHeight} 
                    goal={goalHeight} 
                    iconName="human-male-height"
                    unit="CM"
                />

                <ProgressOnline 
                    attID='3'
                    userID={UID}
                    type="Waist"
                    init={currentWaist} 
                    goal={goalWaist} 
                    iconName="drafting-compass"
                    unit="CM"
                />

                <ProgressOnline 
                    attID='4'
                    userID={UID}
                    type="Shoulders"
                    init={currentShoulders} 
                    goal={goalShoulders} 
                    iconName="user-injured"
                    unit="CM"
                />

                <ProgressOnline 
                    attID='5'
                    userID={UID}
                    type="forearms"
                    init={currentForearms} 
                    goal={goalForearms} 
                    iconName="arm-flex"
                    unit="CM"
                />  
            </View>

            
        </ScrollView>


        <View style={styles.footer}>
            <Footer1 navigation={navigation} />
        </View>
    </View>
};


const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor:'rgb(25,20,50)'
    },

    rowContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
    },


    
    footer:{
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    titleContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal: 18,
    },
    c1Text:{
        width: '30%',
    },
    c2Text:{
        color:'#48CAE4',
        fontWeight:'400',
        fontSize: 20,
        width: '17%',
        textAlign: 'center',
    },
    c3Text:{
        color:'#fff',
        fontWeight:'400',
        fontSize: 20,
        width: '30%',
        textAlign: 'center',
    },
    c4Text:{
        width: '14%',
        fontWeight:'400',
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
    },

    Text:{
        color:'#fff',
        fontWeight:'600',
        fontSize: 18,
        marginTop: 5
    },

    TextCur:{
        color:'#48CAE4',
        fontWeight:'600',
        fontSize: 18,
        marginTop: 5,
        marginLeft: 50
    },

    
    
});

export default ProgressScreen;

