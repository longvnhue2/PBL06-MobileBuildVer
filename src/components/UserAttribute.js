import { useState } from "react";
import { TouchableOpacity, Text, View, TextInput, StyleSheet, Switch } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

const UserAttribute = (props) => {
    const { label, input, value, unit, isFocus, button, onUpdate } = props;
    const [isUpdate, setUpdate] = useState(false);
    const [buttonText, setButtonText] = useState('Update');
    const [valueInput, setValueInput] = useState(value);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date(value));
    const [toggleFocus, setToggleFocus] = useState(isFocus);

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1; 
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };
    
    const handleUpdate = () => {
        if (input === 'DateTimePicker') {
            setShowPicker(true);
            return;
        }

        if (isUpdate) {
            onUpdate(valueInput, toggleFocus);
        }
        setUpdate(!isUpdate);
        setButtonText(isUpdate ? 'Update' : 'OK');
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowPicker(false);
        setDate(currentDate);
        const formattedDate = currentDate.toISOString();
        setValueInput(formattedDate);
        onUpdate(formattedDate);
    };

    const handleInputChange = (text) => {
        if (unit !== '') {
            // Only allow numbers
            const numericValue = text.replace(/[^0-9]/g, ''); 
            setValueInput(numericValue);
        } else {
            setValueInput(text);
        }
    };

    const toggleSwitch = () => {
        setToggleFocus(!toggleFocus);
        if (!toggleFocus) {
            //onUpdate(valueInput);  // Update the database with the current value when switching to focus mode
        }
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
                        onValueChange={toggleSwitch}
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
                        value={valueInput}
                        editable={isUpdate}
                        onChangeText={handleInputChange}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        placeholderTextColor="#aaa"
                    />
                ) : input === 'DateTimePicker' ? (
                    <TextInput
                        style={styles.input}
                        value={formatDate(date)}
                        editable={false}
                        placeholderTextColor="#aaa"
                    />
                ) : null}
                
                {button ? (
                    <TouchableOpacity style={[styles.button, unit && styles.buttonAttribute]} onPress={handleUpdate}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                ) : null}
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
        width: '70%',
        backgroundColor: 'black',
        borderRadius: 8,
        paddingVertical: 5,
        paddingRight: 5,
        paddingLeft: 15,
    },
    inputContainerAttribute: {
        width: '100%',
        padding: 0
    },
    input: {
        width: '60%',
        color: 'white',
        fontSize: 18,
        height: 60,
    },
    inputAttribute: {
        width: '45%',
    },
    focus: {
        borderWidth: 2,
        borderColor: '#49cc90'
    },
    notFocus: {
        borderWidth: 2,
        borderColor: 'red'
    },
    button: {
        borderWidth: 2,
        borderColor: '#3ab9ff',
        // width: 108,
        width: '32%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    buttonAttribute: {
        width: '50%'
    },
    buttonText: {
        color: '#3ab9ff',
        fontSize: 18,
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