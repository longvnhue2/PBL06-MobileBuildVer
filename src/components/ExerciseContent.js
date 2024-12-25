import React, {useState, useEffect} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image, ToastAndroid} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExerciseDetails from "../screens/ExerciseDetails";
import BASE_URL from "../../IPHelper";
import axios from "axios";
const ExerciseContent = (props) => {
    const [state, setState] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
           // console.log(props.setAndRep);
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
            }

            setLoading(false);
        };
        checkAuth();
    }, []);


    useEffect(() => {
        if (props.isFavorited === 1) {
            setState(true);  
        } else {
            setState(false);  
        }
    }, [props.isFavorited]); 

    const handleNavigation = () => {
        if (!isLogin) {
            props.navigation?.navigate('LoginScreen');
        } else {
            const { exerciseID, text, description, videopath, propertyDetail, time, back, setAndRep, isFavorited, onFavoriteChange, restTime } = props;
            // const exerciseID = props.exerciseID;
            // const text = props.text;
            // const description = props.description;
            // const videopath = props.videopath;

            props.navigation?.navigate('ExerciseDetails', {
                exerciseID,
                text,
                description,
                videopath,
                propertyDetail,
                time,
                restTime,
                back,
                setAndRep,
                isFavorited,
                onFavoriteChange
            });
        }
    }


    const SetChecked = async () => {
        const newState = !state;
        setState(newState);
        setHasInteracted(true);

        const token = await AsyncStorage.getItem('accessToken');

        try {
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const userId = accountResponse.data.id;
            const exerciseId = props.exerciseID;
            
            if (newState) {
                try {
                    const postResponse = await axios.post(
                        `${BASE_URL}/api/favourite-exercises`,
                        {
                            userId,
                            exerciseId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    await props.onFavoriteChange(postResponse.status); 
                    //ToastAndroid.show('Add to favorite successful!', ToastAndroid.SHORT);

                } catch (err) {
                    console.log("Error adding favorite:", err);
                }
            } else {
                try {
                    const getResponse = await axios.get(
                        `${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}&exerciseId.equals=${exerciseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    );
                    
                    const favoriteItem = getResponse.data.find(
                        (item) => item.exerciseId === exerciseId
                    );
                    if (favoriteItem) {
                        const deleteResponse = await axios.delete(
                            `${BASE_URL}/api/favourite-exercises/${favoriteItem.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                }
                            }
                        );
                        await props.onFavoriteChange(deleteResponse.status); 
                        //ToastAndroid.show('Successful removed from favorite!', ToastAndroid.SHORT);
                      
                    } else {
                        console.log("Favorite item not found for deletion.");
                    }
                } catch (err) {
                    console.log("Error deleting favorite:", err);
                }
            }
            //await props.onFavoriteChange();
        } catch (err) {
            console.log("Error fetching account data:", err);
        }
    };

    
    return <LinearGradient 
        colors={['#00687c', '#022b33']}
        start={{ x: 0, y: 0 }}
        end={{x: 1, y : 0}}
        style={styles.blockContent}
    ><View>
        <TouchableOpacity 
        style={styles.insideBlock}
        onPress={handleNavigation} >
            <Image source={{ uri: props.imgsrc}} style={{width:100, height:100}}/>
            
            <View style={styles.textContainer}>
                <Text style={styles.TextDesc}>{props.text}</Text>
                <Text style={styles.TextDesc}>Met: {props.met}</Text>
                <Text style={styles.TextDesc}>{props.propertyDetail}</Text>
                
                {props.dateOrder && props.time && (<Text style={styles.TextDesc}>Day {props.dateOrder}, start time {props.time}</Text>)}
            </View>

            <TouchableOpacity onPress={SetChecked} style={{marginRight:5}}>
                <Icon name={state ? 'star' : 'star-o'} size={40} color="white"/>
            </TouchableOpacity>
        </TouchableOpacity>
    </View>
    </LinearGradient>
};


const styles = StyleSheet.create({
    blockContent: {
        width: '100%',
        height: 130,
        borderColor: '#fff',
        borderWidth : 2,
        marginTop : 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    insideBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems : 'center'
    },
    textContainer: {
        flexDirection: 'column',
        width: '60%',
    },
    TextDesc:{
        color: '#fff',
        fontWeight: '500',
        fontSize: 20
    },
});

export default ExerciseContent;