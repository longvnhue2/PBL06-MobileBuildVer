import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColor } from "../context/ColorContext";

const WorkoutExercise1 = ({ navigation }) => {
    const {selectedColor} = useColor()
    const [loading, setLoading] = useState(true); 
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [isStarFilled, setIsStarFilled] = useState(false);
    const [completedSets, setCompletedSets] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    const aspectRatio = 16 / 9;
    const videoHeight = screenWidth / aspectRatio


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


    const handleComplete = () => {
        if (completedSets < 4) {
            setCompletedSets(completedSets + 1); 
        }
    };

    const toggleStar = () => {
        setIsStarFilled(!isStarFilled);
    };


    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }


    return (
        <View style={styles.container}>
            {/* <Header1 title="Workout" navigation={navigation} /> */}
            <Header1 title="Workout" navigation={navigation} isLogin={isLogin} username={username} name='Workout1'/>
            
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={[styles.body, { backgroundColor: selectedColor }]}>
                    <View style={styles.title2}>
                        <Text style={styles.text}>Push up:</Text>
                        <TouchableOpacity onPress={toggleStar}>
                            <Icon name={isStarFilled ? 'star' : 'star-o'} size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: videoHeight }}>
                        <WebView
                            style={styles.video}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsInlineMediaPlayback={true}
                            source={{ uri: 'https://www.youtube.com/embed/MMgPOQ9gJhM' }}
                        />
                    </View>

                    <View style={styles.setsContainer}>
                        <Text style={styles.textdetails}>
                            Set1 : 5 reps {completedSets > 0 ? '✔️' : ''}
                        </Text>
                        <Text style={styles.textdetails}>
                            Set2 : 5 reps {completedSets > 1 ? '✔️' : ''}
                        </Text>
                        <Text style={styles.textdetails}>
                            Set3 : 5 reps {completedSets > 2 ? '✔️' : ''}
                        </Text>
                        <Text style={styles.textdetails}>
                            Set4 : 5 reps {completedSets > 3 ? '✔️' : ''}
                        </Text>
                        <Text style={styles.textdetails}>------------------------</Text>
                        <Text style={styles.textdetails}>Rest : 20s</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Log Set</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Skip Rest</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleComplete}>
                    <Text style={styles.buttonText}>Complete</Text>
                </TouchableOpacity>
            </View>
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
    },
    body: {
        height: '100%',
        backgroundColor: 'rgb(34,50,52)',
        paddingBottom: 20,
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    title2: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'space-between',
    },
    video: {
        height: '100%',
    },
    setsContainer: {
        marginBottom: '12%',
        marginTop: '5%',
        alignItems: 'center',
    },
    textdetails: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 25,
    },
    buttonContainer: {
        position: 'relative',
        bottom: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: 'rgb(34,50,52)',
    },
    button: {
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginHorizontal: 8,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 20,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default WorkoutExercise1;