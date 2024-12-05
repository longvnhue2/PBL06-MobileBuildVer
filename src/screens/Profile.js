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

const Profile = ({ navigation }) => {
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

                let userAttribute = await axios.get(`${BASE_URL}/api/user-attributes?userId.equals=${userData.data.id}&page=0&size=20`, {
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

    const handleUpdateUserData = async (field, value) => {
        const updateData = { ...userData, [field]: value }
        
        try {
            await axios.put(`${BASE_URL}/api/account`, updateData, {
                headers: {
                    Authorization: `Bearer ${Token}`
                }
            })
            setUserData(updateData)
            setRefresh(!refresh)
            Alert.alert('Success', 'Update successfully!');
        }
        catch (err) {
            console.error("Error updating user data:", err);
            Alert.alert('Error', 'Update fail. Please try later!');
        }
    }

    const handleUpdateUSerAttributes = async (name, field, value, isFocus, focus) => {
        const updateUserAttribute = userAttributes.map(attr => {
            if (attr.name === name){
                return {
                    ...attr,
                    [isFocus]: focus,
                    [field]: value,
                }
            }
            return attr
        })

        const updatedAttribute = updateUserAttribute.find(attr => attr.name === name);
        
        try {
            await axios.put(`${BASE_URL}/api/user-attributes/${updatedAttribute.id}`, updatedAttribute, {
                headers: {
                    Authorization: `Bearer ${Token}`
                }
            })
            setUserAttributes(updateUserAttribute)
            setRefresh(!refresh)
            Alert.alert('Success', 'Update successfully!');
        }
        catch (err) {
            console.error("Error updating user attribute:", err);
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
        <View style={styles.container}>
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
                <UserAttribute 
                    label='Username' 
                    input='TextInput' 
                    value={userData.username}
                    unit=''
                    isFocus={false}
                    button={true}
                    onUpdate={(value) => handleUpdateUserData('username', value)}
                />
                <UserAttribute 
                    label='Email' 
                    input='TextInput' 
                    value={userData.email}
                    unit=''
                    isFocus={false}
                    button={true}
                    onUpdate={(value) => handleUpdateUserData('email', value)}
                />
                <UserAttribute 
                    label='First name' 
                    input='TextInput' 
                    value={userData.firstName}
                    unit=''
                    isFocus={false}
                    button={true}
                    onUpdate={(value) => handleUpdateUserData('firstName', value)}
                />
                <UserAttribute 
                    label='Last name' 
                    input='TextInput' 
                    value={userData.lastName}
                    unit=''
                    isFocus={false}
                    button={true}
                    onUpdate={(value) => handleUpdateUserData('lastName', value)}
                />

                <UserAttribute 
                    label='Birthday' 
                    input='DateTimePicker' 
                    value={userData.birthday}
                    unit=''
                    isFocus={false}
                    button={true}
                    onUpdate={(value) => handleUpdateUserData('birthday', value)}
                />

                <UserAttribute 
                    label='Age' 
                    input='TextInput' 
                    value={calculateAge(userData.birthday).toString()}
                    unit=''
                    isFocus={false}
                    button={false}
                />

                {userAttributes.map(attribute => (
                    <View key={attribute.id} style={styles.userAttributeContainer}>
                        <UserAttribute
                            label={attribute.attribute.name} 
                            input='TextInput' 
                            value={attribute.measure.toString()}
                            unit={attribute.unit}
                            isFocus={attribute.isFocus}
                            button={true}
                            onUpdate={(value, focus) => handleUpdateUSerAttributes(attribute.name, 'measure', value, 'isFocus', focus)}
                        />

                        <UserAttribute
                            label='Goal'
                            input='TextInput' 
                            value={attribute.measureGoal.toString()}
                            unit={attribute.unit}
                            isFocus={attribute.isFocus}
                            button={true}
                            onUpdate={(value, focus) => handleUpdateUSerAttributes(attribute.name, 'measureGoal', value, 'isFocus', focus)}
                        />
                    </View>
                    
                ))}

                <UserAttribute 
                    label='BMI' 
                    input='TextInput' 
                    value={
                        calculateBMI(
                            userAttributes.find(attr => attr.name === 'Height')?.measure,
                            userAttributes.find(attr => attr.name === 'Weight')?.measure
                        ).toString()
                    }
                    unit=''
                    isFocus={false}
                    button={false}
                />
            </ScrollView>

            <View style={styles.userProfile}>
                <TouchableOpacity style={styles.user} onPress={handleUserAvatar}>
                    <Image 
                        style={styles.userAva} 
                        source={userData.publicAvatarUrl ? { uri: userData.publicAvatarUrl } : require("../../assets/default avatar.jpg")}
                    />
                    <View style={styles.cameraImage}>
                        <Icon name="camera-retro" size={15}/>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{userData.username}</Text>
                        <Text style={styles.userStatus}>{`${userData.firstName} ${userData.lastName}`}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.dot}>...</Text>
            </View>

            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(25,20,50)',
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
        marginBottom: 180,
    },
    userAttributeContainer: {
        flexDirection: 'row',
    },
    userProfile: {
        position: 'absolute',
        bottom: 73,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgb(24, 26, 39)',
    },
    user: {
        flexDirection: 'row'
    },
    userAva: {
        width: 90,
        height: 90,
        fontSize: 30,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraImage: {
        width: 30,
        height: 30,
        position: 'absolute',
        bottom: 0,
        left: 60,
        borderRadius: 15,
        backgroundColor: '#d8dadf',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        justifyContent: 'center',
        marginLeft: 13,
    },
    username: {
        fontSize: 20,
        color: '#fff'
    },
    userStatus: {
        fontSize: 20,
        color: '#53565f'
    },
    dot: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold'
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default Profile;