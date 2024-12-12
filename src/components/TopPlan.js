import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useColor } from '../context/ColorContext';

const shuffleArray = (array) => {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
};

const TopPlan = (props) => {
    const { title, data, bgData, numberPlansOfSlide } = props;
    
    const {selectedColor} = useColor();
    const [currentIndex, setCurrentIndex] = useState(0);
    const sortedPlans = [...data].sort((a, b) => b.rating - a.rating);
    const topPlans = sortedPlans.slice(0, numberPlansOfSlide);

    const [shuffledData, setShuffledData] = useState(shuffleArray(bgData));

    const animatedValue = useState(new Animated.Value(0))[0];
    const [clickIcon, setClickIcon] = useState(0);

    const handleNext = () => {
        setClickIcon(1)
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % topPlans.length;
            if (nextIndex === 0) {
                setShuffledData(shuffleArray(shuffledData));
            }
            return nextIndex;
        });
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
        if (bgData && bgData.length > 0) {
            setShuffledData(shuffleArray(bgData));
        }
    }, [bgData]);

    
    useEffect(() => {
        if (shuffledData.length > 0) {
            const timer = setInterval(handleNext, 5000);
            return () => clearInterval(timer);
        }
    }, [shuffledData, currentIndex]);


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
            
            <View style={styles.card}>
                {shuffledData.length > 0 && shuffledData[currentIndex]?.source ? (
                    <ImageBackground
                        source={shuffledData[currentIndex].source}
                        style={styles.backgroundImage}
                    >
                        <TouchableOpacity onPress={handlePrev}>
                            <Icon name='chevron-left' size={35} color={'rgba(0, 0, 0, 0.5)'} />
                        </TouchableOpacity>

                        <View style={{ width: '80%' }}>
                            <Animated.View style={[styles.animatedContainer, { transform: [{ translateX: translateX }] }]}>
                                <TouchableOpacity
                                    style={styles.sliderContainer}
                                    onPress={() => props.navigation.navigate('MyPlan')}
                                >
                                    <View style={styles.cardContent}>
                                        <Image source={require('../../assets/bodyS.png')} style={styles.image} />
                                        <View style={styles.cardTextContainer}>
                                            <Text style={[styles.cardText, { textAlign: 'right' }]}>
                                                Rating: {topPlans[currentIndex]?.rating} 🌟
                                            </Text>
                                            <Text style={styles.cardText}>{topPlans[currentIndex]?.name}</Text>
                                            <Text style={{ fontSize: 16 }}>{topPlans[currentIndex]?.description}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>

                            <View style={styles.pagination}>
                                {topPlans.map((_, index) => (
                                    <TouchableOpacity key={`dot-${index}`} onPress={() => goToSlide(index)}>
                                        <Text style={[styles.dot, currentIndex === index && styles.activeDot]}>&bull;</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleNext}>
                            <Icon name='chevron-right' size={35} color={'rgba(0, 0, 0, 0.5)'} />
                        </TouchableOpacity>
                    </ImageBackground>
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
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
        width: '100%',
        height: 300, 
        overflow: 'hidden',
        borderRadius: 20,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    animatedContainer: {
        width: '100%',
    },
    sliderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 30
    },
    image: {
        width: '50%',
        height: 200,
    },
    cardTextContainer: {
        width: '50%',
        justifyContent: 'space-around',
        padding: 10,
    },
    cardText: {
        fontSize: 20,
        fontWeight: 'bold',
        // color: 'white',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
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