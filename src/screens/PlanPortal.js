import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor } from '../context/ColorContext'
import Header1 from '../components/Header1'
import Footer1 from '../components/Footer1'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TopPlan from '../components/TopPlan'
import axios from 'axios'
import BASE_URL from '../../IPHelper'
import MyPlan from '../components/MyPlan'
import { Image } from 'react-native-svg'
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'

const PlanPortal = (props) => {
    const { navigation } = props
    const {selectedColor} = useColor()
    const username = AsyncStorage.getItem('username')

    const [planData, setPlanData] = useState([]);
    const [randomPlans, setRandomPlans] = useState([]);
    const [planInstanceData, setPlanInstanceData] = useState([]);

    const bgImage = [
        { id: 0, source: require('../../assets/bg-image1.jpg') },
        { id: 1, source: require('../../assets/bg-image2.jpg') },
        { id: 2, source: require('../../assets/bg-image3.jpg') },
        { id: 3, source: require('../../assets/bg-image4.jpg') },
        { id: 4, source: require('../../assets/bg-image5.jpg') },
        { id: 5, source: require('../../assets/bg-image6.jpg') },
        { id: 6, source: require('../../assets/bg-image7.jpg') },
        { id: 7, source: require('../../assets/bg-image8.jpg') },
        { id: 8, source: require('../../assets/bg-image9.jpg') },
        { id: 9, source: require('../../assets/bg-image10.jpg') },
    ];
    
    // Mảng ảnh dữ liệu
    const imageDataImages = [
        { id: 0, source: require('../../assets/imageData1.jpg') },
        { id: 1, source: require('../../assets/imageData2.jpg') },
        { id: 2, source: require('../../assets/imageData3.jpg') },
        { id: 3, source: require('../../assets/imageData4.jpg') },
        { id: 4, source: require('../../assets/imageData5.jpg') },
        { id: 5, source: require('../../assets/imageData6.jpg') },
        { id: 6, source: require('../../assets/imageData7.jpg') },
        { id: 7, source: require('../../assets/imageData8.jpg') },
        { id: 8, source: require('../../assets/imageData9.jpg') },
        { id: 9, source: require('../../assets/imageData10.jpg') },
    ];

    useEffect(() => {
        const fetchData = async () => {
            await getAllPlan();
            await getAllPlanInstance();
        }
        fetchData();
    }, [])

    const getAllPlan = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const { data: getAllPlan } = await axios.get(`${BASE_URL}/public/api/plans/all`);
            const publicPlan = getAllPlan.filter((plan) => plan.status === 'PUBLIC');

            const { data: getAccount } = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const feedbackResponse = await axios.get(`${BASE_URL}/api/feedbacks/all`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const DatePlanResponse = await axios.get(`${BASE_URL}/api/date-plans/all`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            const updatedPlanData = publicPlan.map((plan) => {
                const feedbackNumber = feedbackResponse.data.filter((feedback) => feedback.planId === plan.id).length;
                const DayNumber = DatePlanResponse.data.filter((datePlan) => datePlan.planId === plan.id).length;

                return {
                    ...plan,
                    feedbackNumber,
                    DayNumber
                };
            });
            setPlanData(updatedPlanData);
            setRandomPlans(updatedPlanData.sort(() => 0.5 - Math.random()).slice(0, 3));
        }
        catch (error){
            console.error("Error getting plan:", error)
        }
    }

    const getAllPlanInstance = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken')
        try {
            const { data: getAccount } = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            const { data: getAllPlanInstance } = await axios.get(`${BASE_URL}/api/plan-instances/all?userId.equals=${getAccount.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const inProgressPlanInstances = getAllPlanInstance.filter(item => item.status === 'IN_PROGRESS');
            setPlanInstanceData(inProgressPlanInstances);
        }
        catch (error){
            console.error("Error getting plan instance:", error)
        }
    }


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          getAllPlanInstance();
        });
        return unsubscribe;
      }, [navigation]);

    return (
        <View style={[styles.container, { backgroundColor: selectedColor }]}>
            <Header1
                title={'Plan Portal'}
                navigation={navigation}
                isLogin={true}
                username={username}
                name={'PlanPortal'}
            />
            
            <ScrollView style={styles.bodyContainer}>
                <MyPlan
                    title='Started Plan'
                    data={planInstanceData}
                    navigation={navigation}
                />
                <View style={{marginTop:-200}}>
                    <Text style={styles.title1}>Suggest for you</Text>
                </View>
                {/* <View style={styles.card2}>
                <ImageBackground
                    source={require('../../assets/bg-image1.jpg')}
                    style={styles.card2}
                >
                <View style={styles.imageContainer2}>
                    <ImageBackground
                        source={require('../../assets/imageData2.jpg')}
                        style={styles.image2}
                    >
                    <View style={styles.overlay2}>
                        <View style={styles.infoBadge2}>
                            <FontAwesome5Icon name="clock" size={20} color="blue" />
                            <Text style={styles.infoText2}>45 Min</Text>
                        </View>
                        <View style={styles.infoBadge2}>
                            <FontAwesome5Icon name="fire-alt" size={20} color="red" />
                            <Text style={styles.infoText2}>430 kcal</Text>
                        </View>
                        <View style={{position:'absolute', top:150, left:15}}>
                            <Text style={[styles.title2, {color:'#fff', fontSize:25}]}>Resistance Band Front Squats</Text>
                        </View>
                    </View>     
                    </ImageBackground>

                </View>
                <Text style={styles.description2}>
                    Unlike traditional squats, bands provide a more focused contraction on your quads, giving you that extra burn!
                </Text>
                <View style={styles.line1}/>
                <View style={styles.ratingContainer2}>
                    <View style={{flexDirection:'column'}}>
                        <Text style={[styles.reviewText2, {textAlign:'center'}]}>AVG rating: 5⭐</Text>
                        <Text style={[styles.reviewText2, {fontStyle:'italic'}]}>(Based on 53 Reviews)</Text>
                    </View>
                    <TouchableOpacity style={styles.button2}>
                        <Text style={styles.buttonText2}>START NOW</Text>
                    </TouchableOpacity>
                </View>
                </ImageBackground>
                </View> */}
                <View style={{marginBottom:350}}>
                {randomPlans.map((data, index) => {
                    const randomImageDataImage = imageDataImages[Math.floor(Math.random() * imageDataImages.length)];
                    return (
                        <View key={index} style={styles.card2}>
                            <ImageBackground
                                source={require('../../assets/bg-image6.jpg')}
                                style={styles.card2}
                            >
                                <View style={styles.imageContainer2}>
                                    <ImageBackground
                                        source={randomImageDataImage.source}
                                        style={styles.image2}
                                    >
                                        <View style={styles.overlay2}>
                                            <View style={styles.infoBadge2}>
                                                <FontAwesome5Icon name="clock" size={20} color="blue" />
                                                <Text style={styles.infoText2}>{data.DayNumber} day(s)</Text>
                                            </View>
                                            <View style={styles.infoBadge2}>
                                                <Icon name="star" size={20} color="rgb(209, 171, 2)" />
                                                <Text style={styles.infoText2}>{data.rating}</Text>
                                            </View>
                                            <View style={{ position: 'absolute', top: 150, left: 15 }}>
                                                <Text style={[styles.title2, { color: '#fff', fontSize: 25 }]}>{data.name}</Text>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                                <Text style={styles.description2}>{data.description}</Text>
                                <View style={styles.line1} />
                                <View style={styles.ratingContainer2}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={[styles.reviewText2, { fontStyle: 'italic' }]}>
                                            (Based on {data.feedbackNumber} Reviews)
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.button2} onPress={() => props.navigation.navigate('Plan', {
                                        planID: data.id,
                                        totalDays: data.totalDays,
                                        numExercises : data.DayNumber,
                                        namePlan : data.name,
                                        avgrating: data.rating
                                    })}>
                                        <Text style={styles.buttonText2}>START NOW</Text>
                                    </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        </View>
                    );
                })}
                </View>
                {/* <TopPlan
                    title='Top plan'
                    data={planData}
                    bgData={bgImage}
                    numberPlansOfSlide={5}
                    navigation={navigation}
                /> */}
            </ScrollView>

            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bodyContainer: {
        padding: 20,
        borderWidth: 1,
        borderColor: 'white',
        marginBottom: 90,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },

    card2: {
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        marginTop: 15,
        overflow: 'hidden',
      },
      imageContainer2: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius:20,
        marginHorizontal: 5,
      },
      image2: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        
      },
      overlay2: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
      },
      infoBadge2: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
      },
      infoText2: {
        marginLeft: 5,
        fontSize: 18,
        fontWeight: 'bold',
      },
      title2: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
      },
      description2: {
        fontSize: 18,
        color: 'rgb(39, 38, 38)',
        textAlign:'justify',
        marginHorizontal: 5,
        marginVertical: 10,
      },
      ratingContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: 10,
        marginTop:20,
      },
      reviewText2: {
        fontSize: 16,
        marginLeft: 5,
      },
      button2: {
        backgroundColor: 'rgb(0, 155, 83)',
        padding: 10,
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        width: '30%',
        alignItems: 'center',
      },
      buttonText2: {
        color: '#fff',
        fontWeight: 'bold',
      },
      backgroundImage: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    line1:{
        alignSelf: 'center',
        height: 2,
        width: '95%',
        backgroundColor: 'rgb(216, 216, 216)'
    },
    line2:{
        marginTop: 5,
        alignSelf: 'center',
        height: 2,
        width: '80%',
        backgroundColor: 'rgb(216, 216, 216)'
    },
    title1:{
        fontWeight:'700',
        fontSize: 25,
        color: '#fff'
    }
})

export default PlanPortal