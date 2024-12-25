import React, {useEffect, useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";

const ExerciseContentNotDetail = (props) => {
    const { selectedExercise, exerciseID: targetExerciseID } = props;
    const [state, setState] = useState(false);
    const [selected, setSelected] = useState([]);
    // const SetChecked = async () => {
    //     const newSelected = state
    //         ? selected.filter((id) => id !== targetExerciseID)
    //         : [...selected, targetExerciseID];
    
    //     setState(!state);
    //     setSelected(newSelected);
    //     await props.QuickRefreshSelected(newSelected); 
    // };

    const SetChecked = async () => {
        props.setExerciseIds((prevExerciseIds) => {
            let updatedExerciseIds;
            setState(!state); 
            if (prevExerciseIds.includes(targetExerciseID)) {
                updatedExerciseIds = prevExerciseIds.filter((id) => id !== targetExerciseID);
                
            } else {
                updatedExerciseIds = [...prevExerciseIds, targetExerciseID];
            }
           // props.QuickRefreshSelected(updatedExerciseIds);
            return updatedExerciseIds;
        });
    };

    useEffect(() => {
        setSelected(selectedExercise || []);
        setState(selectedExercise?.includes(targetExerciseID) || false);
    }, [selectedExercise, targetExerciseID]);

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

            <TouchableOpacity onPress={SetChecked} style={{marginRight:15}}>
                <Icon name={state ? 'dot-circle-o' : 'circle-o'} size={30} color="white"  style={{marginLeft:5}}/>
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

export default ExerciseContentNotDetail;