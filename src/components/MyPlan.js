import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useColor } from '../context/ColorContext'
import Icon from 'react-native-vector-icons/FontAwesome5';


const MyPlan = (props) => {
    const { title, data, navigation} = props
    const { selectedColor } = useColor()
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    const flashListRefScrollToIndex = (index) => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: index,
                animated: true,
                viewPosition: 0.5,
            });
            setCurrentIndex(index);
        }
    }

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % data.length;
        flashListRefScrollToIndex(newIndex);
    };

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + data.length) % data.length;
        flashListRefScrollToIndex(newIndex);
    };

    useEffect(() => {
        const timer = setInterval(handleNext, 5000);
        return () => clearInterval(timer);
    })

    useEffect(() => {
        if (flatListRef.current && data.length > 0) {
            flatListRef.current.scrollToIndex({
                index: 0,
                animated: false,
                viewPosition: 0.5,
            });
        }
    }, [data]);

    const goToSlide = (index) => {
        if (index === currentIndex) return;
        flashListRefScrollToIndex(index);
    };

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        setScrollOffset(contentOffsetX);
    };

    const handleScrollEnd = () => {
        const cardWidth = 210;
        const index = Math.round(scrollOffset / cardWidth);
        flashListRefScrollToIndex(index % data.length);
    };


    const renderItem = ({ item, index }) => {
        const scale = index === currentIndex ? 1.2 : 1;
        return (
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <TouchableOpacity onPress={() => {
                    console.log(`Plan Instance ID: ${item.id}`);
                    if (item.status === 'IN_PROGRESS') 
                        navigation.navigate('WorkoutPlan', { planInstanceID: item.id, namePlan: item.name});
                }}>
                    <Text style={styles.cardText}>{item.name}</Text>
                    <Text style={styles.cardText}>
                       Start on: {new Date(item.startDate).getDate()}/{new Date(item.startDate).getMonth() + 1}/{new Date(item.startDate).getFullYear()}
                    </Text>

                    <Text>Status: {item.status === 'IN_PROGRESS' ? 'In progress' : 'completed'}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: selectedColor }]}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {data.length ? (
                <View style={styles.cardContainer}>
                    <TouchableOpacity onPress={handlePrev}>
                        <Icon name='chevron-left' size={35} color={'black'} />
                    </TouchableOpacity>

                    <View
                        style={[
                            styles.flatListContainer,
                        ]}
                    >
                        <FlatList
                            ref={flatListRef}
                            data={data}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            onScroll={handleScroll}
                            onMomentumScrollEnd={handleScrollEnd}
                            decelerationRate="fast"
                            contentContainerStyle={{
                                paddingHorizontal: styles.card.width / 2,
                            }}
                        />

                    </View>

                    <TouchableOpacity onPress={handleNext}>
                        <Icon name='chevron-right' size={35} color={'black'} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.noPlanContainer}>
                    <Text style={styles.noPlanText}>You have not started any plan yet !!!</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('MyPlan')}
                    >
                        <Text style={styles.buttonText}>Let's start a plan now</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.pagination}>
                {data.map((_, index) => (
                    <TouchableOpacity key={`dot-${index}`} onPress={() => goToSlide(index)}>
                        <Text style={[styles.dot, currentIndex === index && styles.activeDot]}>&bull;</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '30%',
    },
    noPlanContainer: {
        height: '30%',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    noPlanText: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
    },
    button: {
        alignContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(34,139,34,0.5)',
        borderRadius: 5,
        padding: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 24,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flatListContainer: {
        width: '80%',
        height: '70%',
    },
    card: {
        backgroundColor: '#f9c2ff',
        marginHorizontal: 20,
        borderRadius: 10,
        width: 200,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
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
})

export default MyPlan