import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import ProgressTabs from '../components/ProgressTabs';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColor } from '../context/ColorContext';
import BASE_URL from '../../IPHelper';
import axios from 'axios';

const ProgressCalendar = ({ navigation, route }) => {
    const {selectedColor} = useColor()
    const [selectedDate, setSelectedDate] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [level, setlevel] = useState('');
    const [loading, setLoading] = useState(true); 
    const [historyData, setHistoryData] = useState([]);
    const [numberPlan, setNumberPlan] = useState(0);
    const [planInstanceData, setPlanInstanceData] = useState([]);
    const [markedDates, setMarkedDates] = useState({});

    const listAssigned = () => {
        navigation.navigate('ProgressList', {
            data: planInstanceData
        });
    }

    useEffect(() => {
        const init = async() => {
            try{
                const token = await AsyncStorage.getItem('accessToken');
                if (token){
                    setUsername(await AsyncStorage.getItem('username') || '');
                    const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const userId = accountResponse.data.id;
                    setlevel(accountResponse.data.level);
                    const historyAttributeUserResponse = await axios.get(`${BASE_URL}/api/user-attribute-history/all?userId.equals=${userId}`, {
                        headers:{
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const dataGET = historyAttributeUserResponse.data.map((data) => ({
                        historyId: data.id,
                        attributeName: data.name,
                        unit: data.unit,
                        date: data.date,
                        measure: data.measure
                    }));
                    setHistoryData(dataGET);

                    const { data: getAllPlanInstance } = await axios.get(`${BASE_URL}/api/plan-instances/all?userId.equals=${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setNumberPlan(getAllPlanInstance.length);
                    setPlanInstanceData(getAllPlanInstance);
                    //console.log(dataGET.length);
                }
            }
            catch(error){
                console.log(error);
            }
        }
        init();
    }, [navigation])

    useEffect(() => {
        const updateMarkedDates = () => {
            const marked = {};
            const sortedData = historyData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            sortedData.forEach((item, index) => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                if (item.measure !== undefined && item.measure !== null) {
                    if (!marked[itemDate]) {
                        marked[itemDate] = { 
                            marked: true, 
                            dotColor: 'cyan', 
                            dots: [{ key: 'hasMeasure', color: 'cyan', selectedDotColor: 'cyan', size: 10 }] 
                        };
                    } else {
                        marked[itemDate].dots.push({ key: `measure-${index}`, color: 'blue', selectedDotColor: 'blue', size: 10 });
                    }
                } else {
                    if (!marked[itemDate]) {
                        marked[itemDate] = { 
                            marked: true, 
                            dotColor: 'orange', 
                            dots: [{ key: 'noMeasure', color: 'orange', selectedDotColor: 'orange', size: 8 }] 
                        };
                    }
                }
            });
    
            setMarkedDates(marked);
        };
    
        if (historyData.length > 0) {
            updateMarkedDates();
        }
    }, [historyData]);
    
    
    


    const onDayPress = (day) => {
        if (!day?.dateString) {
            console.error("Invalid day object:", day);
            return;
        }
        const isoDate = new Date(`${day.dateString}T00:00:00Z`).toISOString();
        console.log("date:", isoDate);
        const HistoryAttribute = historyData.filter((item) => {
            const itemDate = new Date(item.date).toISOString().split('T')[0]; 
            const selectedDate = new Date(isoDate).toISOString().split('T')[0];
            return itemDate === selectedDate;
        });
        //console.log(HistoryAttribute);
        const selectedDate2 = new Date(isoDate).toISOString().split('T')[0];
        navigation.navigate('Progress', { HistoryAttribute, selectedDate : selectedDate2 });
        setSelectedDate(isoDate);
    };


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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={[styles.container, {backgroundColor: '#10132A'}]}>
            {/* Header */}
            <Header1 
                title="Profile" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='ProgressCalendar'
                />



            <ProgressTabs navigation={navigation} target="History"/>

            {/* Body */}
            <ScrollView style={styles.body} contentContainerStyle={{ flexGrow: 1 }}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={markedDates} 
                    theme={{
                        calendarBackground: '#10132A',
                        textSectionTitleColor: '#fff',
                        dayTextColor: '#fff',
                        todayTextColor: '#00adf5',
                        selectedDayBackgroundColor: '#00adf5',
                        monthTextColor: '#fff',
                        arrowColor: '#fff',
                        textDisabledColor: '#333',
                        dotColor: '#00adf5',
                        selectedDotColor: '#ffffff',
                        textDayFontSize: 25,
                        textMonthFontSize: 25,
                        textDayHeaderFontSize: 16,
                    }}
                    style={styles.calendar}
                />

                {/* Legend */}
                <View style={styles.legendContainer}>
                    {/* <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: 'purple' }]} />
                        <Text style={styles.legendText}>Progress photo</Text>
                    </View> */}
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: 'cyan' }]} />
                        <Text style={styles.legendText}>Has history attribute</Text>
                    </View>
                    {/* <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: 'red' }]} />
                        <Text style={styles.legendText}>Body logs</Text>
                    </View> */}
                </View>

                <TouchableOpacity style={styles.reportContainer} onPress={listAssigned}>
                    <Text style={styles.reportText}>Your In-Depth Workout Report</Text>
                    <Text style={styles.viewNowText}>View now →</Text>
                </TouchableOpacity>

                <View style={styles.streakContainer}>
                    <Text style={styles.streakTitle}>
                        Workout Streak (Friends) <Icon name="info-circle" size={14} color="#fff" />
                    </Text>
                    <View style={styles.streakItem}>
                        <View style={styles.rankContainer}>
                            <Icon name="crown" size={18} color="orange" />
                        </View>
                        <Text style={styles.username}>{username} ({level})</Text>
                        <Text style={styles.streakCount}>Total plan: {numberPlan}</Text>
                    </View>
                </View>
            </ScrollView>

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
        backgroundColor: '#10132A',
    },
    body: {
        padding: 20,
        flexGrow: 1,
    },
    calendar: {
        height: '45%',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        fontSize: 20,
        color: '#fff',
    },
    reportContainer: {
        backgroundColor: '#6A5ACD',
        padding: 20,
        borderRadius: 10,
        marginVertical: 20,
    },
    reportText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    viewNowText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 5,
    },
    streakContainer: {
        backgroundColor: '#6A5ACD',
        borderRadius: 10,
        padding: 15,
        marginBottom: 160,
    },
    streakTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    streakItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rankContainer: {
        backgroundColor: 'blue',
        padding: 5,
        borderRadius: 5,
    },
    username: {
        color: '#fff',
        fontSize: 16,
    },
    streakCount: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default ProgressCalendar;
