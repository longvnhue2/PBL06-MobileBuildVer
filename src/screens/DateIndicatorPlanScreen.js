import React, {useState, useEffect} from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, Platform, ActivityIndicator, TextInput} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from "@react-native-community/slider";
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { useColor } from "../context/ColorContext";

const DateIndicatorPlanScreen = ({navigation, route}) => {

const DateIndicatorPlanScreen = ({navigation}) => {
    const {selectedColor} = useColor();
    const [description, setDescription] = useState(''); 
    const [planName, setPlanName] = useState('');
    const [selectedNumber, setSelectedNumber] = useState(1); 
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [existID, setExistID] = useState(0);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true); 
    const method = route.params?.method || 'post';

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            
            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
                if (method === 'edit'){
                    setSelectedNumber(route.params?.totalDays);
                    setDescription(route.params?.description);
                    setPlanName(route.params?.planName);
                    setExistID(route.params?.planID);
                }
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

    const toggleDropdown = () => {
        setShowPicker(true);
      };

      const onChange = (event, date) => {
        if (Platform.OS === 'android') {
          setShowPicker(false); 
        }
    
        if (date) {
          setSelectedDate(date);
        }
      };
    
    const openSlider = () => {
        setModalVisible(true);
    };

    const closeSlider = () => {
        console.log(selectedNumber);
        setModalVisible(false);
    };

    const handleADD = async () => {
        try{
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userId = accountResponse.data.id;

            if (method === 'edit'){
                const formEDIT = {
                    name: planName,
                    description : description,
                    status: "PRIVATE",
                    totalDays: selectedNumber,
                    rating: 0,
                    userId: userId
                };
                const PUTresponsePLAN = await axios.put(`${BASE_URL}/api/plans/${existID}`, formEDIT, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(PUTresponsePLAN.status);
                navigation.navigate('RecustomizePlan', {
                    planID: existID,
                    totalDays : selectedNumber
                });
            }
            else{
                const formPOST = {
                    name: planName,
                    description : description,
                    status: "PRIVATE",
                    totalDays: selectedNumber,
                    rating: 0,
                    userId: userId
                };
                const POSTresponsePLAN = await axios.post(`${BASE_URL}/api/plans`, formPOST, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(POSTresponsePLAN.status);
                const PlanListResponse = await axios.get(`${BASE_URL}/api/plans/all`,{
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                });

                const maxId = Math.max(...PlanListResponse.data.map(plan => plan.id));

                if (POSTresponsePLAN.status >= 200 && POSTresponsePLAN.status <=300)
                navigation.navigate('CustomPlan', {
                    planId: maxId,
                    totalDays: selectedNumber,
                    day: 1,
                });
            }
        }
        catch(e){
            console.log(e);
        }
    }

    return <View style={[styles.container, {backgroundColor: selectedColor}]}>
        <Header1 
                title="Workout" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={username} 
                name='DateIndicatorPlan'
                />


        <View style={styles.bodyContent}>

        <View style={{flexDirection: 'row', justifyContent:'space-between', marginTop:30, marginLeft:10, marginRight:10}}>
            <Text style={styles.text}>Plan name:  </Text>
            {/* <View style={styles.titleBar}>
                <Text style={styles.text}>Chest Plan</Text>
            </View> */}
            <TextInput
                style={[styles.text, styles.titleBar]}
                value={planName} 
                onChangeText={setPlanName} 
                placeholder="Enter plan name"
                placeholderTextColor="#aaa"
            />
        </View>

        <View style={{alignContent:'center', alignItems:'center', marginTop:100}}> 
            {(method != 'edit') && (
                <View>
                <Text style={styles.text}>Input days of your plan:</Text>
                <TouchableOpacity style={styles.numberBox} onPress={openSlider}>
                    <Text style={styles.text}>{selectedNumber}</Text>
                </TouchableOpacity>
                </View>
            )}
            
            <View style={{ marginTop: 30, marginHorizontal: 10 }}>
                <Text style={styles.text}>Enter the description (optional):</Text>
                <TextInput
                    style={[styles.numberBox2 , styles.text,{ height: 150, fontSize:20 }]}
                    value={description} 
                    onChangeText={setDescription} 
                    placeholder="Enter description here" 
                    placeholderTextColor="#aaa" 
                    multiline={true}
                    textAlignVertical="top"
                />
            </View>

            
            <TouchableOpacity style={styles.buttonNext} onPress={() => handleADD()}>
             <Text style={styles.text}>Next</Text>
            </TouchableOpacity>
        </View>

        
        </View>

        <View style={styles.footer}>
                <Footer1 navigation={navigation} />
        </View>
        
        <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeSlider} 
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={{color:'#fff', fontSize:20}}>Select a Number</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={20}
                            step={1}
                            value={selectedNumber}
                            onValueChange={(value) => setSelectedNumber(value)}
                        />
                        {/* <RNPickerSelect
                            onValueChange={(value) => setSelectedNumber(value)}
                            items={items}
                            /> */}
                        <Text style={styles.selectedValue}>{selectedNumber}</Text>

                        <TouchableOpacity style={styles.doneButton} onPress={closeSlider}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showPicker && (
                    <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onChange}
                    
                    />
                )}
    </View>
    
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(34,50,52)',
    },
    bodyContent: {
        flexGrow: 1,
        paddingBottom: 100, 
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    button: {
        borderColor:'#fff', borderWidth:2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#003b3b',
        padding: 10,
        width: '45%',
        borderRadius: 5,
        height: 55,
        marginTop:10
    },

    picker: {
        width: 200,
        height: 100,
      },

    buttonNext: {
        borderColor:'#fff', borderWidth:2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#275219',
        padding: 10,
        width: '25%',
        borderRadius: 5,
        height: 55,
        marginTop:10,
        marginTop:'10%'
    },

    text: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    titleBar:{
        width: '60%',
        height: 50,
        alignItems:'center',
        borderColor: '#fff',
        borderWidth: 2,
        
    },
    numberBox: {
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff', 
        marginTop: 10,
        borderRadius:5,
        backgroundColor: '#003b3b',
    },
    numberBox2: {
        width: 350,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff', 
        marginTop: 10,
        borderRadius:5,
        backgroundColor: '#003b3b',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalContent: {
        width: 300,
        padding: 10,
        backgroundColor: '#275219',
        borderRadius: 10,
        alignItems: 'center',
    },
    slider: {
        width: 250,
        height: 40,
    },

    selectedValue: {
        fontSize: 20,
        marginVertical: 5,
        color: '#fff',
        fontWeight:'bold'
    },
    doneButton: {  
        padding: 10,
        borderRadius: 5,
        borderColor:'#fff',
        borderWidth:2
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    dateBox: {
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff', 
        borderRadius: 0,
    },
    dateText: {
        color: '#fff',
        fontSize: 18,
    },
    textInput: {
        fontSize: 16,
        color: '#000',
        flex: 1,
        
      },
});
}

export default DateIndicatorPlanScreen