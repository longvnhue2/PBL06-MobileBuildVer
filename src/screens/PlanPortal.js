import { View, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor } from '../context/ColorContext'
import Header1 from '../components/Header1'
import Footer1 from '../components/Footer1'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TopPlan from '../components/TopPlan'
import axios from 'axios'
import BASE_URL from '../../IPHelper'
import MyPlan from '../components/MyPlan'

const PlanPortal = (props) => {
    const { navigation } = props
    const {selectedColor} = useColor()
    const username = AsyncStorage.getItem('username')

    const [planData, setPlanData] = useState([]);
    const [planInstanceData, setPlanInstanceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken')
            const userId = await getUserId();
            await getAllPlan();
            await getAllPlanInstance(userId);
        }
        fetchData();
    }, [])

    const getAllPlan = async () => {
        try {
            const { data: getAllPlan } = await axios.get(`${BASE_URL}/public/api/plans/all`);
            const publicPlan = getAllPlan.filter((plan) => plan.status === 'PUBLIC');
            setPlanData(publicPlan);
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
            setPlanInstanceData(getAllPlanInstance);
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

    const getUserId = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken')
        try {
            const { data: getUserData } = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return getUserData.id
        }
        catch (error){
            console.error("Error getting user data:", error)
        }
    }

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
                <TopPlan
                    title='Top plan'
                    data={planData}
                    numberPlansOfSlide={5}
                    navigation={navigation}
                />

                <MyPlan
                    title='Started Plan'
                    data={planInstanceData}
                    navigation={navigation}
                />
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
        marginBottom: 30
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
})

export default PlanPortal