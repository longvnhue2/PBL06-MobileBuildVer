import React, {useEffect, useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
const ExerciseContentNotDetailAction = (props) => {
    const { selectedExercise, exerciseID: targetExerciseID } = props;
    const [state, setState] = useState(false);
    const [selected, setSelected] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [sets, setSets] = useState(1);
    const [reps, setReps] = useState(1);
    const [rest, setRest] = useState(1);
    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    // const SetChecked = async () => {
    //     const newSelected = state
    //         ? selected.filter((id) => id !== targetExerciseID)
    //         : [...selected, targetExerciseID];
    
    //     setState(!state);
    //     setSelected(newSelected);
    //     await props.QuickRefreshSelected(newSelected); 
    // };

    const handleUP = () => {
        const index = props.exerciseIds.indexOf(props.exerciseID);
        if (index > 0) {
            const newExerciseIds = [...props.exerciseIds];
            [newExerciseIds[index - 1], newExerciseIds[index]] = [newExerciseIds[index], newExerciseIds[index - 1]];
            props.QuicklyRefresh(newExerciseIds); 
        }
        console.log(`HANDLE UP id: ${props.exerciseID}`);
    };

    const handleDOWN = () => {
        const index = props.exerciseIds.indexOf(props.exerciseID);
        if (index < props.exerciseIds.length - 1) {
            const newExerciseIds = [...props.exerciseIds];
            [newExerciseIds[index + 1], newExerciseIds[index]] = [newExerciseIds[index], newExerciseIds[index + 1]];
            props.QuicklyRefresh(newExerciseIds);
        }
        console.log(`HANDLE DOWN id: ${props.exerciseID}`);
    };

    const handleDEL = () => {
        const updatedExerciseIds = props.exerciseIds.filter((id) => id !== targetExerciseID);
        props.QuicklyRefresh(updatedExerciseIds);

        console.log(`Deleted ID: ${targetExerciseID}`);
        console.log('Updated Exercise IDs:', updatedExerciseIds);
    };
    return <LinearGradient 
        colors={['#00687c', '#022b33']}
        start={{ x: 0, y: 0 }}
        end={{x: 1, y : 0}}
        style={styles.blockContent}
    ><View>
        <TouchableOpacity 
        style={styles.insideBlock}
        onPress={() => console.log(props.exerciseID)}
        >
            <Image source={{ uri: props.imgsrc}} style={{width:100, height:100}}/>
            
            <View style={styles.textContainer}>
                <Text style={styles.TextDesc}>{props.text}</Text>
                <Text style={styles.TextDesc}>{props.propertyDetail}</Text>
                <Text style={styles.TextDesc}>Calorine consume: {props.caloConsume}</Text>
            </View>
            {/* <View style={{marginRight:30, flexDirection:'row'}}> */}
            <View style={{flexDirection:'column'}}>
            <TouchableOpacity onPress={() => handleUP()} style={{marginRight:-5}}>
                <MaterialCommunityIcons name='chevron-double-up' size={50} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => handleDOWN()} style={{marginRight:-5}}>
                <MaterialCommunityIcons name='chevron-double-down' size={50} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            </View>
            <View style={{flexDirection:'column', paddingRight:20}}>
            <TouchableOpacity onPress={toggleModal}>
                <MaterialIcons name='perm-data-setting' size={45} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDEL()} style={{marginRight:15}}>
                <MaterialCommunityIcons name='delete-empty-outline' size={50} color="red"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            </View>
            {/* </View> */}
            
        </TouchableOpacity>
    </View>
    <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Adjust Values</Text>
                    <Text style={styles.TextDesc}>Sets: {sets}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={sets}
                        onValueChange={(value) => setSets(value)}
                    />
                    <Text style={styles.TextDesc}>Reps: {reps}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={reps}
                        onValueChange={(value) => setReps(value)}
                    />
                    <Text style={styles.TextDesc}>Rest: {rest}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                        value={rest}
                        onValueChange={(value) => setRest(value)}
                    />
                    <TouchableOpacity onPress={toggleModal()} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Confirm!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </LinearGradient>
    
};


const styles = StyleSheet.create({
    blockContent: {
        width: '100%',
        height: 130,
        borderColor: '#fff',
        borderWidth : 2,
        marginTop : 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    insideBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems : 'center',

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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'rgb(34,80,58)',
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color:'#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
        marginVertical: 10,
    },
    closeButton: {
        alignContent: 'center',
        alignSelf:'center',
        width:'30%',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: '5%',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign:'center',

    },
});

export default ExerciseContentNotDetailAction;