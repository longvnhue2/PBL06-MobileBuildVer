import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';

const shuffleArray = (array) => {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const ImageSlide = (props) => {
    const { data } = props;
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledData, setShuffledData] = useState(shuffleArray(data));

    const fadeAnim = useState(new Animated.Value(1))[0];

    const handleNext = () => {
        animateFadeOut(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
            animateFadeIn();
        });
    };

    const handlePrev = () => {
        animateFadeOut(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
            animateFadeIn();
        });
    };

    const animateFadeOut = (callback) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => callback());
    };

    const animateFadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const goToSlide = (index) => {
        animateFadeOut(() => {
            setCurrentIndex(index);
            animateFadeIn();
        });
    };

    useEffect(() => {
        setShuffledData(shuffleArray(shuffledData));
        const timer = setInterval(handleNext, 5000);
        return () => clearInterval(timer);
    }, [currentIndex === 0]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.icon} onPress={handlePrev}>
                <Icon name="chevron-left" size={35} color={'rgba(0, 0, 0, 0.5)'} />
            </TouchableOpacity>

            <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
                <Image source={shuffledData[currentIndex].source} style={styles.image} />
            </Animated.View>

            <TouchableOpacity style={[styles.icon, { left: '90%' }]} onPress={handleNext}>
                <Icon name="chevron-right" size={35} color={'rgba(0, 0, 0, 0.5)'} />
            </TouchableOpacity>

            <View style={styles.pagination}>
                {data.map((_, index) => (
                    <TouchableOpacity key={`dot-${index}`} onPress={() => goToSlide(index)}>
                        <Text style={[styles.dot, currentIndex === index && styles.activeDot]}>&bull;</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    imageContainer: {
        width: '100%',
        height: 300,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    icon: {
        justifyContent: 'center',
        paddingLeft: 15,
        width: 50,
        height: 50,
        position: 'absolute',
        top: '40%',
        zIndex: 1,
    },
    pagination: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
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

export default ImageSlide;
