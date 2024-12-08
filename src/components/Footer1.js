import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet, Text, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useColor } from "../context/ColorContext";

const colors = [
    // pink
    '#F2A7AD', '#F2A2C0', '#F6A7C1', '#F291A3',

    // purple
    '#F2B6E2', '#F2ACE0', '#F27EEA', '#B7AEF2', '#ADA2F2', '#AD82D9',

    // yellow
    '#FCF0CF', '#F2D399', '#F2D98D', '#FDCF76',

    // brown
    '#D99E91', '#B16E4B',
    
    // green
    '#8FD9D1', '#8FD9C4', '#84D9BA', '#59D9CC', '#63F2D8',

    // blue
    '#84B4C8', '#99D9F2', '#079DD9',
];

const Footer1 = (props) => {
    const { selectedColor, setSelectedColor } = useColor();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={[styles.foot]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={() => props.navigation.navigate('HomieScr')}>
                    <Icon name="compass" size={45} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => props.navigation.navigate('PlanPortal')}>
                    <Icon name="home" size={45} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => props.navigation.navigate('ExerciseType')}>
                    <Icon name="dumbbell" size={45} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => props.navigation.navigate('ProgressCalendar')}>
                    <Icon name="calendar" size={45} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="ellipsis-h" size={45} color="black" />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Select Background Color</Text>
                    <FlatList
                        data={colors}
                        keyExtractor={(item) => item}
                        numColumns={3}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.colorOption, { backgroundColor: item }]}
                                onPress={() => {
                                    setSelectedColor(item);
                                }}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    foot: {
        flex: 1,
        borderTopWidth: 2,
        borderTopColor: 'cyan',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        height: '30%',
        backgroundColor : 'rgb(23, 79, 79)',
    },
    modalContainer: {
        width: '70%',
        height: '50%',
        alignSelf: 'center',
        marginTop: '40%',
        paddingVertical: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: 'white',
    },
    colorOption: {
        width: 80,
        height: 80,
        margin: 5,
        borderRadius: 5,
    },
    closeButton: {
        width: '20%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginTop: 15,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Footer1;