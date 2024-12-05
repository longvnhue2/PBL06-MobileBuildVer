import React, {useState, useEffect} from "react";
import {Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';

const HeaderForProfile = ({ title, navigation, isLogin, username }) => {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('username');
        navigation.navigate('LoginScreen'); 
    };

    return (
        <LinearGradient
            colors={['#0eb9ee', '#097293']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headers}
        >
            <View style={styles.headerContent}>
                <Text style={styles.title1}>{title}</Text>
                <View style={styles.loginContainer}>
                    <TouchableOpacity>
                    <Icon name="sync" style={{color:'#000'}} size={35}/>
                    </TouchableOpacity>
                    {isLogin ? (
                        <TouchableOpacity onPress={handleLogout}>
                            <Text style={styles.loginText}>  Hello, {username} (Logout)</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                    )}
                    <Image
                        source={require('../../assets/bell.png')}
                        style={styles.bellIcon}
                    />
                </View>
            </View>
        </LinearGradient>
    );
};



const styles = StyleSheet.create({
    title1: {
        fontSize: 35,
        fontWeight: '700',
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
    loginText: {
        fontSize: 16,
        fontWeight:'600',
        color: '#000000', 
        marginRight: 5,
        fontStyle:'italic'
    },
    bellIcon: {
        width: 35,
        height: 35,
    }
});

export default HeaderForProfile;