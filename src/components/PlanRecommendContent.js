import React, {useState} from "react";
import {TouchableOpacity, View, StyleSheet, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";


const PlanRecommendContent = (props) => {
    return <TouchableOpacity style={{marginBottom: 30}} onPress={() => props.navigation.navigate('Plan', {
        planID: props.id,
        totalDays: props.totalDays,
        numExercises : props.subtitle1,
        namePlan : props.title,
        avgrating: props.avgrating
    })}><LinearGradient 
        colors={['#00687c', '#022b33']}
        start={{ x: 0, y: 0 }}
        end={{x: 1, y : 0}}
        style={styles.blockContent}
    ><View style={styles.cardContainer}>
        <View style={styles.leftSection}>
        <Icon name={props.iconName} size={70} color="white" />

        <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{props.title}</Text>
                    <Text style={styles.subtitleText}>{props.subtitle1}</Text>
                    <Text style={styles.subtitleText}>AVG Rate: {props.avgrating} ☆</Text>
                    <Text style={styles.subtitleText}>{props.subtitle2}</Text>
        </View>
        </View>
        <View style={{flexDirection:'column', marginRight:15}}>
            <Icon name="star" size={35} color="white" marginLeft={4}/>
            <Text style={styles.titleText}>200</Text>
        </View>
    </View></LinearGradient></TouchableOpacity>
};

const styles = StyleSheet.create({
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
        marginTop:10
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
    },

});


export default PlanRecommendContent;