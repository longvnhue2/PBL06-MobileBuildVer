import React, {useEffect, useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";

const ExerciseContentNotDetailForInstance = (props) => {
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
                <Text style={styles.TextDesc}>{`${props.setCount || 0} sets, ${props.repCount || 0} reps, Rest: ${props.restTime}(s)`}</Text>
                <Text style={styles.TextDesc}>Met value: {props.met || 0}</Text>
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
        marginTop : 10,
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

export default ExerciseContentNotDetailForInstance;