import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../IPHelper';

const ProgressOnline = (props) => {
    const [Current, setCurrent] = useState(props.init);
    const [Goal, setGoal] = useState(props.goal);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const percentage = Math.abs(((props.goal - Math.abs(props.goal - Current)) / props.goal) * 100);


    useEffect(() => {
        if (Current !== props.init) {
            setCurrent(props.init);
        }
        if (Goal !== props.goal) {
            setGoal(props.goal);
        }
    }, [props.init, props.goal]);

    const handleSave = async () => {
        if (!isNaN(parseFloat(inputValue))) {
            setCurrent(parseFloat(inputValue));
        }
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await axios.get(`${BASE_URL}/api/user-attributes/all?userId.equals=${props.userID}`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            const dataList = response.data;
            const headID = dataList[0].id;

            let targetID;

            switch (props.attID) {
                case '1':
                    targetID = headID;
                    break;
                case '2':
                    targetID = headID + 1;
                    break;
                case '3':
                    targetID = headID + 2;
                    break;
                case '4':
                    targetID = headID + 3;
                    break;
                case '5':
                    targetID = headID + 4;
                    break;
                default:
                    targetID = null; 
            }

            
            const dataUpdate = {
                'name' : props.type,
                'isFocus' : true,
                'unit' : (props.attID === '1' ? 'KG' : 'CM'), 
                'measure' : parseFloat(inputValue),
                'measureGoal' : props.goal,
                'userId' : props.userID,
                'attributeId' : props.attID
            }
            const PUTresponse = await axios.put(`${BASE_URL}/api/user-attributes/${targetID}`, dataUpdate, {
                headers:{
                    Authorization: `Bearer ${token}`, 
                },
            });
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
        setModalVisible(false);
    };

    return (
        <View style={[
        styles.itemContainer, 
        { marginTop: props.type === 'weight' ? 40 : '15%' }
    ]}>
            <View style={styles.circleAndTypeContainer}>
                <View style={styles.circle}>
                    {(props.iconName === 'human-male-height' || props.iconName === 'arm-flex') ? (
                        <MaterialCommunityIcons name={props.iconName} size={25} color="black" />
                    ) : (
                        <Icon name={props.iconName} size={25} color="black" />
                    )}
                </View>
                <Text style={styles.Text}>{props.type}</Text>
            </View>

            <TouchableOpacity style={styles.currentContainer} onPress={() => setModalVisible(true)}>
                <Text style={styles.TextCur}>{Current}{props.unit}</Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>               
                <Text style={styles.percentageText}>{Math.abs(percentage.toFixed(1))}%</Text>     
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.abs(percentage)}%` }]} />
                </View>
            </View>

            <View style={styles.goalContainer}>
                <Text style={styles.TextGoal}>{props.goal}{props.unit}</Text>
            </View>

            {/* <Modal transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Enter new ${props.type}`}
                            keyboardType="numeric"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <Button title="Save" onPress={handleSave} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal> */}
            <Modal transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 22}}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={`Enter new ${props.type}`}
                            placeholderTextColor="#fff"
                            keyboardType="numeric"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <TouchableOpacity onPress={handleSave} style={styles.confirmButton}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    circleAndTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '30%',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    Text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 18,
        marginLeft: 10,
    },
    currentContainer: {
        width: '17%',
        alignItems: 'center'
    },
    TextCur: {
        color: '#48CAE4',
        fontWeight: '600',
        fontSize: 20,
        marginLeft: 10,
    },
    progressContainer: {
        width: '30%',
        alignItems: 'center'
    },
    percentageText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#48CAE4',
        transform: [{translateY: -10}]
    },
    progressBarContainer: {
        width: '100%',
        height: 10,
        backgroundColor: '#E0F7FA',
        borderRadius: 10,
        transform: [{translateY: -10}]
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#00BFFF',
        borderRadius: 10,
    },
    goalContainer: {
        width: '14%',
        alignItems: 'center'
    },
    TextGoal: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 17,
        justifyContent: 'flex-end', 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'rgb(36, 105, 68)',
        alignItems: 'center',
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: 40,
        backgroundColor: 'rgba(42, 85, 176, 1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 5,
        backgroundColor: 'transparent',
        
    },
    input: {
        borderColor: '#fff',
        borderWidth: 1,
        padding: 10,
        marginVertical: 20,
        fontSize: 18,
        borderRadius: 5,
        color: 'white',
        width: '80%',
        textAlign: 'center',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: 'rgba(42, 85, 176, 1)',
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProgressOnline;
