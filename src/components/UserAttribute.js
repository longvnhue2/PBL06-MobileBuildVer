import { useState } from "react";
import { Text, View, TextInput, StyleSheet, Switch } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/FontAwesome5";
import { measure } from "react-native-reanimated";

const UserAttribute = (props) => {
    const { label, field, input, value, unit, isFocus, data, setData } = props;

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date(value));
    const [toggleFocus, setToggleFocus] = useState(isFocus);

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1; 
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };

    const handleToggleFocus = () => {
        setToggleFocus(!toggleFocus)
        setData(data.map(item => 
            item.attribute.name === field
                ? {
                    ...item,
                    isFocus: !toggleFocus
                }
                : item
        ));
    }

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        setDate(selectedDate);
        setData({
            ...data,
            [field]: selectedDate.toISOString()
        })
    };

    const handleInputChange = (text) => {
        if (unit) {
            setData(data.map(item => 
                item.attribute.name === (label === 'Goal' ? field : label)
                    ? {
                        ...item,
                        [label === 'Goal' ? 'measureGoal' : 'measure']: text,
                    }
                    : item
            ));
            return;
        }

        setData({
            ...data,
            [field]: text,
        });
    };

    return (
        <View style={[styles.container, unit && styles.containerAttribute]}>
            <View style={[styles.labelAndSwitchContainer, unit && styles.labelAttribute]}>
                <Text style={[styles.label]}>
                    {label} {unit && `(${unit})`}:
                </Text>
                {unit && (label === 'Goal' && (
                    <Switch
                        style={styles.switch}
                        onValueChange={handleToggleFocus}
                        value={toggleFocus}
                    />
                    )) 
                }
            </View>
            
            <View style={[
                    styles.inputContainer,
                    unit && styles.inputContainerAttribute,
                    unit && (toggleFocus ? styles.focus : styles.notFocus)
                ]}
            >
                {input === 'TextInput' ? (
                    <TextInput
                        style={[styles.input, unit && styles.inputAttribute]}
                        value={value}
                        editable={label === 'Username' || label === 'Age' || label === 'BMI' ? false : true}
                        onChangeText={handleInputChange}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        placeholderTextColor="#aaa"
                    />
                ) : input === 'DateTimePicker' && (
                    <TextInput
                        style={styles.input}
                        value={formatDate(date)}
                        editable={false}
                        placeholderTextColor="#aaa"
                    />
                )}
                
                {input === 'DateTimePicker' && 
                    <Icon 
                        name="calendar-day" 
                        size={25} 
                        color='white'
                        onPress={() => setShowPicker(true)}
                    />
                }
            </View>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginVertical: 15,
    },
    containerAttribute: {
        flexDirection: 'column',
        width: '50%'
    },
    labelAndSwitchContainer: {
        width: '28%',
    },
    label: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 'auto',
    },
    labelAttribute: {
        width: '100%',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '70%',
        backgroundColor: 'black',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },
    inputContainerAttribute: {
        width: '100%',
        padding: 0
    },
    input: {
        width: '89%',
        color: 'white',
        fontSize: 18,
        height: 60,
    },
    inputAttribute: {
        width: '100%',
    },
    focus: {
        borderWidth: 2,
        borderColor: '#49cc90'
    },
    notFocus: {
        borderWidth: 2,
        borderColor: 'red'
    },
    switchContainer: {
        width: 100,
        borderWidth: 1,
        borderColor: 'red'
    },
    switch: {
        width: 20,
        height: 30,
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
    }
});
 
export default UserAttribute;