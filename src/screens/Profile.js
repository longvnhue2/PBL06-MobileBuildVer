import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useState, useEffect } from "react";
import ProgressTabs from "../components/ProgressTabs";
import UserAttribute from "../components/UserAttribute";
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import { useColor } from "../context/ColorContext";

const Profile = ({ navigation }) => {
    const { selectedColor } = useColor()
    const [Token, setToken] = useState('')
    const [refresh, setRefresh] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userAttributes, setUserAttributes] = useState([])
    const [userData, setUserData] = useState({
        id: 0,
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        birthday: new Date().toISOString(),
        level: "BEGINNER",
        isActivated: true,
        avatarUrl: '',
        publicAvatarUrl: '',
        roleId: 0,
        role: {
            id: 0,
            name: ''
        }
    })
    const userDataConfig = [
        { label: 'Username', field: 'username'},
        { label: 'Email', field: 'email'},
        { label: 'First name', field: 'firstName'},
        { label: 'Last name', field: 'lastName' },
        { label: 'Birthday', field: 'birthday'},
        { label: 'Age', field: 'age'}
    ]

    const uploadAvatar = async (formData) => {
        try {
            await axios.post(`${BASE_URL}/api/update-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${Token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            setRefresh(!refresh)
        }
        catch (err) {
            console.error('Error updating avatar:', err.response ? err.response.data : err.message);
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
    }

    const handleUserAvatar = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera roll is required!");
            return;
        }

        let ava = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1
        })

        if (!ava.canceled) {
            const avaUri = ava.assets[0].uri
            const fileName = avaUri.split('/').pop();
            const formData = new FormData()
            formData.append('file', {
                uri: avaUri,
                name: fileName,
                type: 'image/jpeg',
            })

            uploadAvatar(formData)
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setToken(token)

            if (!token) {
                navigation.navigate('LoginScreen');
                return
            }
            setIsLogin(true);

            try {
                const userData = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setUserData(userData.data);
                setUserData(prevData => ({
                    ...userData.data,
                    roleId: userData.data.role ? userData.data.role.id : 0, 
                    role: {
                        id: userData.data.role ? userData.data.role.id : 0,
                        name: userData.data.role ? userData.data.role.name : ''
                    }
                }));

                let userAttribute = await axios.get(`${BASE_URL}/api/user-attributes?userId.equals=${userData.data.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                userAttribute = userAttribute.data.map(attr => ({
                    ...attr,
                    userId: attr.user ? attr.user.id : 0,
                    attributeId: attr.attribute ? attr.attribute.id : 0
                }));
                setUserAttributes(userAttribute)
            }
            catch (err) {
                console.log("Error getting user data or attribute: ", err)
            }
            finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [refresh]);

    const handleUpdateData = async () => {
        try {
            await axios.put(`${BASE_URL}/api/account`, userData, {
                headers: {
                    Authorization: `Bearer ${Token}`
                }
            })
            
            const updateUserAttributesPromises = userAttributes.map(attribute => {
                return axios.put(`${BASE_URL}/api/user-attributes/${attribute.id}`, attribute, {
                    headers: {
                        Authorization: `Bearer ${Token}`
                    }
                });
            });
            await Promise.all(updateUserAttributesPromises);

            Alert.alert('Success', 'Update successfully!');
        }
        catch (error) {
            console.error("There was an error updating user data or attribute:", error)
            Alert.alert('Error', 'Update fail. Please try later!');
        }
    }

    const calculateAge = (birthday) => {
        const birthDate = new Date(birthday)
        const currentDate = new Date()
        const monthDifference = currentDate.getMonth() - birthDate.getMonth()
        const dayDifference = currentDate.getDate() - birthDate.getDate()

        let age = currentDate.getFullYear() - birthDate.getFullYear()

        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0))
        {
            age--
        }

        return age
    }

    const calculateBMI = (height, weight) => {
        if (height > 0 && weight > 0) {
            return (weight / ((height / 100) * (height / 100))).toFixed(1);
        }

        return 0;
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return ( 
        <View style={[styles.container, {backgroundColor: selectedColor}]}>
            <Header1 
                title="Profile" 
                navigation={navigation} 
                isLogin={isLogin} 
                username={userData.username} 
                name='Profile'
            />

            <ProgressTabs navigation={navigation} target="Profile" />

            <View style={styles.legendContainer}>
                <View style={styles.legendDisplay}>
                    <View style={styles.legendColorFocus} />
                    <Text style={styles.legendText}>is focus</Text>
                </View>

                <View style={styles.legendDisplay}>
                    <View style={styles.legendColorNotFocus} />
                    <Text style={styles.legendText}>not focus</Text>
                </View>
            </View>

            <ScrollView style={styles.mainContent}>
                <View style={styles.userProfile}>
                    <TouchableOpacity style={styles.user} onPress={handleUserAvatar}>
                        <Image 
                            style={styles.userAva} 
                            source={userData.publicAvatarUrl ? { uri: userData.publicAvatarUrl } : require("../../assets/default avatar.jpg")}
                        />
                        <View style={styles.cameraImage}>
                            <Icon name="camera-retro" size={15}/>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.username}>{userData.username}</Text>
                </View>

                {userDataConfig.map(({label, field}) => (
                    <UserAttribute
                        key={field}
                        label={label}
                        field={field}
                        input={label === 'Birthday' ? 'DateTimePicker' : 'TextInput'}
                        value={label === 'Age' ? calculateAge(userData['birthday']).toString() : userData[field]}
                        data={userData}
                        setData={setUserData}
                    />
                ))}

                {userAttributes.map(attribute => (
                    <View key={attribute.id} style={styles.userAttributeContainer}>
                        <UserAttribute
                            label={attribute.attribute.name} 
                            input='TextInput' 
                            value={attribute.measure.toString()}
                            unit={attribute.unit}
                            isFocus={attribute.isFocus}
                            data={userAttributes}
                            setData={setUserAttributes}
                        />

                        <UserAttribute
                            label='Goal'
                            field={attribute.attribute.name}
                            input='TextInput' 
                            value={attribute.measureGoal.toString()}
                            unit={attribute.unit}
                            isFocus={attribute.isFocus}
                            data={userAttributes}
                            setData={setUserAttributes}
                        />
                    </View>
                    
                ))}

                <UserAttribute 
                    label='BMI' 
                    input='TextInput' 
                    value={
                        calculateBMI(
                            userAttributes.find(attr => attr.attribute.name === 'height')?.measure,
                            userAttributes.find(attr => attr.attribute.name === 'weight')?.measure
                        ).toString()
                    }
                />

                <View style={styles.btnSaveContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleUpdateData}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    legendDisplay: {
        width: '45%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    legendColorFocus: {
        width: '40%',
        height: '40%',
        backgroundColor: '#49cc90',
        borderRadius: 10,
    },
    legendColorNotFocus: {
        width: '40%',
        height: '40%',
        backgroundColor: 'red',
        borderRadius: 10,
    },
    legendText: {
        fontSize: 16,
        color: 'white',
    },
    mainContent: {
        height: '100%'
    },
    userAttributeContainer: {
        flexDirection: 'row',
    },
    userProfile: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    userAva: {
        width: 120,
        height: 120,
        fontSize: 30,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraImage: {
        width: 40,
        height: 40,
        position: 'absolute',
        bottom: 0,
        left: 80,
        borderRadius: 20,
        backgroundColor: '#d8dadf',
        alignItems: 'center',
        justifyContent: 'center',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },
    userStatus: {
        fontSize: 20,
        color: '#53565f'
    },

    btnSaveContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 100
    },
    button: {
        borderWidth: 3,
        borderColor: '#3ab9ff',
        width: '30%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    buttonText: {
        color: '#3ab9ff',
        fontSize: 25,
        fontWeight: 'bold'
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default Profile;