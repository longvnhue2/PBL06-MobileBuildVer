import React, {useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image, TouchableWithoutFeedback, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";


const PlanContent = (props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalWarningVisible, setModalWarningVisible] = useState(false);
    const [statusCode, setStatusCode] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const handleSign = async() => {
        const nows = new Date();
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
                }, 1250);
            if (POSTinstanceResponse.status >= 200 && POSTinstanceResponse.status <= 300){
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
    return (<LinearGradient 
        colors={['#00687c', '#022b33']}
        start={{ x: 0, y: 0 }}
        end={{x: 1, y : 0}}
        style={styles.blockContent}
    ><View style={styles.cardContainer}>
        <View style={styles.leftSection}>
        <Icon name={props.iconName} size={70} color="rgba(20, 240, 171, 1)" />

        <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{props.title}</Text>
                    <Text style={styles.subtitleText}>Length: {props.totalDays} day(s)</Text>
                    <Text style={styles.subtitleText}>{props.subtitle2}</Text>
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
                    <TouchableOpacity
                        style={styles.comboItem2}
                        onPress={() => handleEDIT()}
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
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //marginVertical: 5,
        height:100
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
});


export default PlanContent;