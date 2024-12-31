import React, {useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image, TouchableWithoutFeedback, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";


const PlanContent = (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalWarningVisible, setModalWarningVisible] = useState(false);
    const [statusCode, setStatusCode] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [public2, setPublic2] = useState(false);

    const handleSign = async() => {
        const nows = new Date();
        nows.setHours(nows.getHours() + 7);
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const formAdd = {
                name:props.title,
                description: "signed plan",
                startDate: nows.toISOString(),
                totalDays: props.totalDays,
                status: "IN_PROGRESS",
                deviceToken: props.devicePushToken,
                planId: props.planID
            }
            const POSTinstanceResponse = await axios.post(`${BASE_URL}/api/plan-instances`, formAdd, {
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });
            setStatusCode(POSTinstanceResponse.status);
            setShowMessage(true); 
                setTimeout(() => {
                    setShowMessage(false); 
                }, 1500);
            if (POSTinstanceResponse.status >= 200 && POSTinstanceResponse.status <= 300){
                //console.log(props.status);
                props.navigation.navigate("PlanPortal");
            }
        }
        catch(e){
            console.error(e);
        }
        setIsVisible(false);
    }

    const handleOutsidePress = () => {
        setIsVisible(!isVisible);
        console.log("CLICKED OUTSIDE!");
    };

    const handleEDIT = () => {
        setIsVisible(false);
        props.navigation.navigate('DateIndicatorPlan', {
            method: 'edit',
            totalDays: props.totalDays,
            description: props.description,
            planID: props.planID,
            planName: props.title
        });
    }

    const handleDEL = () => {
        setModalWarningVisible(true);
    }

    const handlePress = () => {
        if (props.status === 'PRIVATE') {
            handleEDIT();
        } else {
            setShowModal(true); 
            setTimeout(() => setShowModal(false), 2000); 
        }
    };

    const handleConfirmDelete = async () => {
        setModalWarningVisible(false);
        setIsVisible(!isVisible); 
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const DELresponse = await axios.delete(`${BASE_URL}/api/plans/${props.planID}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setStatusCode(DELresponse.status);
            setShowMessage(true); 
                setTimeout(() => {
                    setShowMessage(false); 
                }, 1250);
            console.log("Plan deleted!"); 
            props.setIsRefresh((prev) => !prev);
        }
        catch (e) {
            setShowMessage(true); 
                setTimeout(() => {
                    setShowMessage(false); 
                }, 1250);
            console.error(e);
        }
    };

    const handleCancel = () => {
        setModalWarningVisible(false);
    };

    const handlePublic = async() => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userId = accountResponse.data.id;
            const formPUT = {
                name: props.title,
                totalDays : props.totalDays,
                status: 'PENDING_REVIEW',
                userId: userId
            }
            const publicResponse = await axios.put(`${BASE_URL}/api/plans/${props.planID}`, formPUT, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const statusCode = publicResponse.status;
            if (statusCode >= 200 && statusCode <= 300) {
                setPublic2(true);
                console.log(`PUBLIC: ${statusCode}`);
                setTimeout(() => {
                    props.navigation.replace('InsightScreen');
                    setPublic2(false);
                }, 3000);
            }
        }
        catch(e){
            console.error(e);
        }
    }

    return (<LinearGradient 
        colors={['#00687c', '#022b33']}
        start={{ x: 0, y: 0 }}
        end={{x: 1, y : 0}}
        style={styles.blockContent}
    ><View style={styles.cardContainer}>
        <View style={styles.leftSection}>
        <Icon
            name={props.iconName}
            size={70}
            color={props.status === 'PRIVATE' ? 'rgba(20, 240, 171, 1)' : 'rgb(71, 41, 67)'}
        />

        <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{props.title}</Text>
                    <Text style={styles.subtitleText}>Length: {props.totalDays} day(s)</Text>
                    <Text style={styles.subtitleText}>{props.subtitle2}, {props.status}</Text>
                    {/* <Text style={styles.subtitleText}>AVG Rate: {props.avgrating} ☆</Text> */}
        </View>
        </View>
        <TouchableOpacity style={styles.dotButton} onPress={() => {
            setIsVisible((prev) => !prev);
            console.log(props.planID);
        }}>
            <Icon name="ellipsis-h" size={30} color="white" />
        </TouchableOpacity>
        {showMessage && (
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: statusCode >= 200 && statusCode < 300 ? 'rgb(34,80,42)' : '#rgb(200, 50, 100)', 
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: '#fff',
                }}
            >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>
                    {statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failure'}
                </Text>
            </View>
        )}
        {isVisible && (
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.overlay}>
                <View style={styles.comboBox}>
                    <TouchableOpacity
                        style={styles.comboItem1}
                        onPress={() => handleSign()}
                    >
                        <Text style={styles.comboText2}>Start plan!</Text>
                    </TouchableOpacity>
                    {props.status === 'PRIVATE' && (
                        <TouchableOpacity
                            style={styles.comboItem2}
                            onPress={handlePublic}
                        >
                            <Text style={styles.comboText}>Public this plan</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.comboItem2nd}
                        onPress={handlePress}
                    >
                        <Text style={styles.comboText}>Recustomize plan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.comboItem3}
                        onPress={() => handleDEL()}
                    >
                        <Text style={styles.comboTextDEL}>Remove plan</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </TouchableWithoutFeedback>
        )}

            <Modal
                transparent={true}
                animationType="fade"
                visible={isModalWarningVisible}
                onRequestClose={handleCancel} 
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Are you sure you want to remove this plan?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmDelete}
                            >
                                <Text style={styles.confirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LottieView
                            source={require('../../assets/403.json')} 
                            autoPlay
                            loop={false}
                            style={styles.lottie}
                        />
                        <Text style={styles.modalText}>Only private plans can be recustomized!</Text>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={public2}
                onRequestClose={() => setPublic2(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LottieView
                            source={require('../../assets/completed.json')} 
                            autoPlay
                            loop={false}
                            style={styles.lottie}
                        />
                        <Text style={styles.modalText}>Success public! This plan is pending to be approved!</Text>
                    </View>
                </View>
            </Modal>
    </View>
    </LinearGradient>
    )
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)", 
        zIndex: 1,
    },
    blockContent:{
        width: '100%',
        height: 100,
        flex : 1,
        borderColor: '#fff',
        borderWidth : 2,
        marginBottom: 30
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //marginVertical: 5,
        height:100,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20
    },
    textContainer: {
        marginLeft: 30,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitleText: {
        fontSize: 20,
        color: 'white',
    },
    dotButton: {
        padding: 5,
        marginRight:40
    },

    comboBox: {
        position: 'absolute',
        top: 50, 
        right: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 1,
      },
      comboItem1: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor:'rgb(36, 105, 68)',
        borderTopLeftRadius:5,
        borderTopRightRadius:5
    },
      comboItem2: {
          padding: 10,
          borderBottomWidth: 1,
          
          borderBottomColor: '#ddd',
          backgroundColor:'rgb(36, 105, 68)',
      },
      comboItem2nd: {
        padding: 10,
        borderBottomWidth: 1,
        borderTopWidth: 2,
        borderTopColor: '#fff',
        borderBottomColor: '#ddd',
        backgroundColor:'rgb(36, 105, 68)',
    },
      comboItem3: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
      comboText: {
          fontSize: 16,
          color: 'rgb(97, 255, 212)',
          fontWeight:'600'
      },
      comboText2: {
        fontSize: 16,
        color: 'rgb(97, 255, 212)',
        fontWeight:'800'
    },
      comboTextDEL: {
        fontSize: 16,
        color: 'red',
        fontWeight:'700'
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: 300,
        height: 150,
        backgroundColor: "rgb(34,90,52)",
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        color:'#fff',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        padding: 10,
        marginRight: 10,
        backgroundColor: 'rgba(34,139,34,0.9)',
        borderColor:'#fff',
        borderWidth: 2,
        borderRadius: 5,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    confirmButton: {
        flex: 1,
        padding: 10,
        backgroundColor: "rgb(190,30,16)",
        borderColor:'#fff',
        borderWidth: 2,
        borderRadius: 5,
        alignItems: "center",
    },
    confirmButtonText: {
        color: "white",
        fontWeight: "800",
    },
    lottie: {
        width: 200,
        height: 200,
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'rgb(0, 92, 69)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
});


export default PlanContent;