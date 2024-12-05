import React from "react";
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Footer1 = (props) => {
    return <View style={styles.foot}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' , alignItems: 'center', marginBottom: 10, marginTop: 10}}>
            <TouchableOpacity onPress={() => props.navigation.navigate('HomieScr')}>
                <Icon name="compass" size={45} color="black" /> 
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate('MyPlan')}>
                <Icon name="home" size={45} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate('ExerciseType')}>
                <Icon name="dumbbell" size={45} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate('ProgressCalendar')}>
                <Icon name="calendar" size={45} color="black" />
            </TouchableOpacity>
        </View>
    </View>
};


const styles = StyleSheet.create({
    foot:{
        flex: 1,
        borderTopWidth: 2,
        borderTopColor: 'cyan',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        height : '30%',
        backgroundColor : 'rgb(23, 79, 79)',
    }
});

export default Footer1;