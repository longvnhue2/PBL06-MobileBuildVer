import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useColor } from '../context/ColorContext';

const TopPlan = (props) => {
    const { title, data, numberPlansOfSlide } = props;
    const {selectedColor} = useColor();
    const [currentIndex, setCurrentIndex] = useState(0);
    const sortedPlans = [...data].sort((a, b) => b.rating - a.rating);
    const topPlans = sortedPlans.slice(0, numberPlansOfSlide);

    const animatedValue = useState(new Animated.Value(0))[0];
    const [clickIcon, setClickIcon] = useState(0);

    const handleNext = () => {
        setClickIcon(1)
        setCurrentIndex((prevIndex) => (prevIndex + 1) % topPlans.length);
        triggerAnimation();
    };

    const handlePrev = () => {
        setClickIcon(-1)
        setCurrentIndex((prevIndex) => (prevIndex - 1 + topPlans.length) % topPlans.length);
        triggerAnimation();
    };

    const triggerAnimation = () => {
        animatedValue.setValue(0);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    
    useEffect(() => {
        const timer = setInterval(handleNext, 5000);
        return () => clearInterval(timer);
    })

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [300 * clickIcon, 0],
    });

    const goToSlide = (index) => {
        if (index === currentIndex) return;
        index > currentIndex ? setClickIcon(1) : setClickIcon(-1);
        setCurrentIndex(index);
        triggerAnimation();
    };

    return (
        <View style={[styles.container, { backgroundColor: selectedColor }]}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.cardContainer}>
                <TouchableOpacity onPress={handlePrev}>
                    <Icon name='chevron-left' size={35} color={'white'} />
                </TouchableOpacity>

                <View style={styles.card}>
                    <ImageBackground
                        source={require('../../assets/bg-template.jpg')}
                        style={styles.backgroundImage}
                    >
                        <Animated.View style={[styles.animatedContainer, { transform: [{ translateX: translateX }] }]}>
                            <TouchableOpacity onPress={() => props.navigation.navigate('MyPlan')}>
                                <View style={styles.cardContent}>
                                    <Image source={require('../../assets/bodyS.png')} style={styles.image} />
                                    <View style={styles.cardTextContainer}>
                                        <Text style={styles.cardText}>{topPlans[currentIndex]?.name}</Text>
                                        <Text>Rating: {topPlans[currentIndex]?.rating}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </ImageBackground>
                </View>

                <TouchableOpacity onPress={handleNext}>
                    <Icon name='chevron-right' size={35} color={'white'} />
                </TouchableOpacity>
            </View>

            <View style={styles.pagination}>
                {topPlans.map((_, index) => (
                    <TouchableOpacity key={`dot-${index}`} onPress={() => goToSlide(index)}>
                        <Text style={[styles.dot, currentIndex === index && styles.activeDot]}>&bull;</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color:'#fff'
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    card: {
        width: '70%',
        height: 300, 
        overflow: 'hidden',
        borderRadius: 20,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        
    },
    image: {
        width: '50%',
        height: 200,
    },
    cardTextContainer: {
        width: '50%',
        justifyContent: 'center',
        padding: 10,
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        // color: 'white',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    dot: {
        fontSize: 50,
        color: '#cccccc',
        marginHorizontal: 5,
    },
    activeDot: {
        color: '#6200EE',
    },
});

export default TopPlan;