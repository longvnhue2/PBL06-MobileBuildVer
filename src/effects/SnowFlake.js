import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Modal, Image, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import React, { useRef, useEffect } from 'react';   

const { width, height } = Dimensions.get('window');


const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.random() * 40 + 60;
    const lightness = Math.random() * 40 + 60; 
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const SnowFallEffect = ({ from, to }) => {  
    const snowflakes = Array.from({ length: 20 }, () => ({
        x: Math.random() * width,
        delay: Math.random() * 20, 
        size: Math.random() * 20 + 15, 
        speed: Math.random() * 4000 + 6000, 
        color: getRandomPastelColor(),
    }));

    const animatedValues = snowflakes.map(() => useRef(new Animated.Value(height)).current);

    useEffect(() => {
        // console.log(from);
        // console.log(to);
        const createAnimation = (animatedValue, speed, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: -335, 
                        duration: speed,
                        delay: delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: height, 
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        snowflakes.forEach(({ speed, delay }, index) => {
            createAnimation(animatedValues[index], speed, delay);
        });
    }, [from, to]);  

    return (
        <>
            {snowflakes.map((flake, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.snowflake,
                        {
                            left: flake.x,
                            width: flake.size,
                            height: flake.size,
                            transform: [{ translateY: animatedValues[index] }],
                            backgroundColor: flake.color,
                            borderRadius: 50, 
                        },
                    ]}
                />
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    snowflake: {
        position: 'absolute',
        opacity: 0.8,
    },
});

export default SnowFallEffect;
