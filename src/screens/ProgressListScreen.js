import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator, AppState } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColor } from '../context/ColorContext';
import BASE_URL from '../../IPHelper.js';
import { LinearGradient } from "expo-linear-gradient";
import Header1 from '../components/Header1.js';
import Footer1 from '../components/Footer1.js';
import { ScrollView } from 'react-native-gesture-handler';

const ProgessListScreen = ({route, navigation}) => {
    const data = route.params?.data || [];
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            
            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
                setLoading(false);
            }
            else{
                navigation.navigate('LoginScreen');
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
            return <ActivityIndicator size="large" color="#0000ff" />;
        }

    return (<View style={[styles.container, {backgroundColor: '#10132A'}]}>
            <Header1 
                title="Profile" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='ProgressCalendar'
            />

            <ScrollView style={styles.body} contentContainerStyle={{ flexGrow: 1 }}>
                {data.map((item, index) => {
                    const startDate = new Date(item.startDate);
                    return (
                        <LinearGradient
                            key={index}
                            colors={['#00687c', '#022b33']}
                            style={styles.gradientContainer} 
                        >
                            <View style={styles.itemContainer}>
                                <View style={styles.indexContainer}>
                                    <Text style={styles.itemTextD}>{index + 1}</Text>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.leftColumn}>
                                        <Text style={styles.itemText}>Plan name: {item.name}</Text>
                                        <Text style={styles.itemText}>Start Date: {startDate.getDate()}/{startDate.getMonth() + 1}/{startDate.getFullYear()}</Text>
                                    </View>

                                    <View style={styles.rightColumn}>
                                        <Text style={styles.itemText}>Length: {item.totalDays} day(s)</Text>
                                        <Text style={styles.itemText}>{item.status}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    );
                })}
            </ScrollView>
            
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#10132A',
    },
    body: {
        padding: 20,
        flexGrow: 1,
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
    gradientContainer: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    indexContainer: {
        marginBottom: 10,
        justifyContent: 'flex-start',
        textAlign:'right',
        marginLeft: '95%',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
        width:'100%'
    },
    rightColumn: {
        flex: 1,
        alignItems: 'flex-end',  
    },
    itemText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 5,
    },
    itemTextD: {
        color: 'white',
        fontSize: 26,
        marginBottom: 5,
        fontWeight: '800',
        fontStyle:'italic'
        
    },
});

export default ProgessListScreen