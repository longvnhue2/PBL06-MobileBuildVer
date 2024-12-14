import React from "react";
import {Text, TouchableOpacity, View, StyleSheet, Image, Modal} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";


const Header1 = ({ title, navigation, isLogin, username, name }) => {
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

                        <Image
                            source={require('../../assets/bell.png')}
                            style={styles.bellIcon}
                        />
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                )}
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
    }
});

export default Header1;