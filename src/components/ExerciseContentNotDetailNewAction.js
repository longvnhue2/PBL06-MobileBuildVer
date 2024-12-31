import React, {useEffect, useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image, Keyboard, TextInput, Modal} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";

const ExerciseContentNotDetailNewAction = (props) => {
    const { selectedExercise, exerciseID: targetExerciseID } = props;
    const [state, setState] = useState(false);
    const [selected, setSelected] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    
     const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const handleDEL = () => {
        const updatedExerciseIds = props.exerciseIds.filter((id) => id !== targetExerciseID);
        props.QuicklyRefresh(updatedExerciseIds);

        console.log(`Deleted ID: ${targetExerciseID}`);
        console.log('Updated Exercise IDs:', updatedExerciseIds);
    };

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

    useEffect(() => {
        setSelected(selectedExercise);
        if (selectedExercise && selectedExercise.includes(targetExerciseID)){
            setState(true);
        }
        else setState(false);
    }, [targetExerciseID]);

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
                <Text style={styles.TextDesc}>Met index: {props.met}</Text>
            </View>

            <View style={{flexDirection:'column'}}>
            <TouchableOpacity onPress={() => handleUP()} style={{marginRight:-5}}>
                <MaterialCommunityIcons name='chevron-double-up' size={50} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => handleDOWN()} style={{marginRight:-5}}>
                <MaterialCommunityIcons name='chevron-double-down' size={50} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            </View>
            
            <View style={{flexDirection:'column', paddingRight:20}}>
            <TouchableOpacity onPress={() => props.onOpenModal(targetExerciseID)}>
                <MaterialCommunityIcons name='clock-edit-outline' size={45} color="cyan"  style={{marginLeft:5}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDEL()} style={{marginRight:15}}>
                <MaterialCommunityIcons name='delete-empty-outline' size={50} color="red"  style={{marginLeft:5}}/>
            </TouchableOpacity> 
            </View>
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
   
});

export default ExerciseContentNotDetailNewAction;