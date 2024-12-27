import React, { useState , useEffect} from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator,  Modal, FlatList, Animated, Dimensions } from 'react-native';
import Header1 from "../components/Header1";
import Footer1 from "../components/Footer1";
import Icon from 'react-native-vector-icons/FontAwesome';
import ExerciseContent from "../components/ExerciseContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../IPHelper";
import LottieView from 'lottie-react-native';
import SearchBar from "../components/SearchBar";
import { useColor } from "../context/ColorContext";

const WorkoutExerciseList = ({ navigation, route }) => {
    const {selectedColor} = useColor()
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [attributes, setAttributes] = useState([]);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [exercisePlanData, setExercisePlanData] = useState([]);
    const [exerciseData, setExerciseData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [isFavor, setFavor] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown2, setShowDropdown2] = useState(false);
    const [selectedItem, setSelectedItem] = useState();
    const [equipment, setEquipment] = useState('ALL');
    const [showMore, setShowMore] = useState(false); 

    const data2 = ['ALL', '0~2 met', '2~3.5 met', '3.5~6 met', '6~8.5 met', '8.5~10 met'];



    const attributeNameToIdMap = {
        ALL:0,
        weight: 1,
        height: 2,
        waist: 3,
        shoulder: 4,
        forearms: 5
    };

    const updateExerciseData = (attributeId, favor, equipment) => {
        // setExerciseData((prevData) =>
        //     prevData.map((data) => ({
        //         ...data,
        //         visible:
        //             (!attributeId || data.attribute_id.includes(attributeId)) &&
        //             (!favor || data.isFavorited === 1) ? 1 : 0,
        //     }))
        // );
        setExerciseData((prevData) =>
            prevData.map((data) => {
                const isEquipmentMatch =
                    equipment === 'ALL' ||
                    (equipment === '0~2 met' && data.met >= 0 && data.met <= 2) ||
                    (equipment === '2~3.5 met' && data.met > 2 && data.met <= 3.5) ||
                    (equipment === '3.5~6 met' && data.met > 3.5 && data.met <= 6) ||
                    (equipment === '6~8.5 met' && data.met > 6 && data.met <= 8.5) ||
                    (equipment === '8.5~10 met' && data.met > 8.5 && data.met <= 10);
    
                return {
                    ...data,
                    visible:
                        (!attributeId || data.attribute_id.includes(attributeId)) &&
                        (!favor || data.isFavorited === 1) &&
                        isEquipmentMatch
                            ? 1
                            : 0,
                };
            })
        );
    };

    const handleFavorite = () => {
        if (!isLogin) {
            navigation.navigate('LoginScreen');
        } else {
            setFavor(!isFavor);
            // setExerciseData((prevData) =>
            //     prevData.map((data) => ({
            //         ...data,
            //         visible: !isFavor ? (data.isFavorited === 1 ? 1 : 0) : 1
            //     }))
            // );
            updateExerciseData(selectedAttribute, !isFavor, equipment);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleDropdown2 = () => {
        setShowDropdown2(!showDropdown2);
    };

    const selectItem = (item) => {
        setSelectedItem(item);
        const attributeId = attributeNameToIdMap[item];
        setSelectedAttribute(attributeId);
        console.log(`1selected attribute ${attributeId}, selected met ${equipment}`);
        updateExerciseData(attributeId, isFavor, equipment);
        toggleDropdown();
    };

    const selectItem2 = (item) => {
        setEquipment(item);
        console.log(`2selected attribute ${selectedAttribute}, selected met ${item}`);
        updateExerciseData(selectedAttribute, isFavor, item);
        toggleDropdown2();
    };

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };


    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                setIsLogin(true);
                setUsername(await AsyncStorage.getItem('username') || '');
            }
            try{

                const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const userId = accountResponse.data.id;

                const response = await axios.get(`${BASE_URL}/api/exercise-attributes/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const Attribute_response = await axios.get(`${BASE_URL}/public/api/attributes/all`);
                //console.log(Attribute_response.data);
                const fixPublicResponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);
                //console.log(fixPublicResponse.data);
                const exerciseAttributesMap = response.data.reduce((map, data) => {
                    if (!map[data.exercise.id]) {
                        map[data.exercise.id] = [];
                    }
                    map[data.exercise.id].push(data.attribute.id);
                    return map;
                }, {});

                const getAllExercisePlan = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const exercisePlanMap = getAllExercisePlan.data.reduce((map, data) => {
                    if (!map[data.exerciseId]) {
                        map[data.exerciseId] = [];
                    }
                    map[data.exerciseId].push({setCount: data.setCount, repCount: data.repCount});
                    return map;
                })

                setExercisePlanData(getAllExercisePlan.data)

                const favoriteResponse = await axios.get(`${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const FavorSET = new Set(favoriteResponse.data.map(fav => fav.exerciseId));
                
                const DataGET = fixPublicResponse.data.map((data) => ({
                    id: data.id,
                    attribute_id: exerciseAttributesMap[data.id] || [], 
                    imgsrc: data.publicImageUrl,
                    text: data.name,
                    videopath: data.publicVideoUrl,
                    description: data.description,
                    visible: 1,
                    isFavorited : FavorSET.has(data.id) ? 1 : 0,
                    setAndRep: exercisePlanMap[data.id] || {setCount: 0, repCount: 0},
                    met: data.met || 0
                }));
                const DataGETAttribute = [
                    { id: 0, name: 'ALL' },  
                    ...Attribute_response.data.map((data) => ({
                        id: data.id,
                        name: data.name,
                    }))
                ];
                setAttributes(
                    DataGETAttribute.map((item) =>
                        item.name === 'shoulders'
                            ? { ...item, name: 'shoulder' }
                            : item
                    )
                );
                
                setExerciseData(DataGET);

                const attributeType = route.params?.attribute || 'ALL';
                console.log(attributeType);
                if (attributeType){
                    switch (attributeType) {
                        case 'weight':
                            setSelectedItem('weight');
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: data.attribute_id.includes(1) ? 1 : 0
                                }))
                            );
                            break;
                        case 'height':
                            setSelectedItem('height');
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: data.attribute_id.includes(2) ? 1 : 0
                                }))
                            );
                            break;
                        case 'waist':
                            setSelectedItem('waist');
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: data.attribute_id.includes(3) ? 1 : 0
                                }))
                            );
                            break;
                        case 'shoulder':
                            setSelectedItem('shoulder');
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: data.attribute_id.includes(4) ? 1 : 0
                                }))
                            );
                            break;
                        case 'forearms':
                            setSelectedItem('forearms');
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: data.attribute_id.includes(5) ? 1 : 0
                                }))
                            );
                            break;
                        case 'ALL':
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: 1
                                }))
                            );
                            break;
                        default:
                            setExerciseData((prevData) =>
                                prevData.map((data) => ({
                                    ...data,
                                    visible: 1
                                }))
                            );
                            break;
                        }
                }
                setFilterData(DataGET)
            }
            catch (error) {
                console.error('Error fetching exercise data:', error);
            } 
            setLoading(false);
        };
        checkAuth();
    }, []);

    const [statusCode, setStatusCode] = useState(null);
    const [showMessage, setShowMessage] = useState(false);


    const handleFavoriteChange = async (status) => {
        try {
            setStatusCode(status);
            setShowMessage(true); 
            setTimeout(() => {
                setShowMessage(false); 
            }, 1250);
            const token = await AsyncStorage.getItem('accessToken');
            const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userId = accountResponse.data.id;

            const response = await axios.get(`${BASE_URL}/api/exercise-attributes/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const fixPublicResponse = await axios.get(`${BASE_URL}/public/api/exercises/all`);
            const exerciseAttributesMap = response.data.reduce((map, data) => {
                if (!map[data.exercise.id]) {
                    map[data.exercise.id] = [];
                }
                map[data.exercise.id].push(data.attribute.id);
                return map;
            }, {});

            const getAllExercisePlan = await axios.get(`${BASE_URL}/api/exercise-plans/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const exercisePlanMap = getAllExercisePlan.data.reduce((map, data) => {
                if (!map[data.exerciseId]) {
                    map[data.exerciseId] = [];
                }
                map[data.exerciseId].push({setCount: data.setCount, repCount: data.repCount});
                return map;
            })

            setExercisePlanData(getAllExercisePlan.data)

            const favoriteResponse = await axios.get(`${BASE_URL}/api/favourite-exercises/all?userId.equals=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const FavorSET = new Set(favoriteResponse.data.map(fav => fav.exerciseId));
            
            const DataGET = fixPublicResponse.data.map((data) => ({
                id: data.id,
                attribute_id: exerciseAttributesMap[data.id] || [], 
                imgsrc: data.publicImageUrl,
                text: data.name,
                videopath: data.publicVideoUrl,
                description: data.description,
                visible: 1,
                isFavorited : FavorSET.has(data.id) ? 1 : 0,
                setAndRep: exercisePlanMap[data.id] || {setCount: 0, repCount: 0},
                met: data.met || 0
            }));
            setExerciseData(DataGET);
        }
            catch(err) {
                console.error(err);
            }
    }

    const resetFilter = () => {
        setSelectedItem('ALL');
        setEquipment('ALL');
        setSelectedAttribute(0);
        setFavor(false);
        updateExerciseData(0, false, 'ALL');
    }

    const handleChangeInputSearch = (value) => {
        setExerciseData(filterData)
        setExerciseData(filterData.filter((exercise) => exercise.text.toLowerCase().includes(value.toLowerCase())))
    }

    return (
        <View style={[styles.container, {backgroundColor: selectedColor}]}>
            {/* Header */}
            <Header1 title="Workout" navigation={navigation} isLogin={isLogin} username={username} name='WorkoutExerciseList'/>


            {/* Body */}
            {showMessage && (
                <View style={{
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'rgb(34,80,42)', 
                    padding: 10, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 1000,
                    borderRadius:5,
                    borderWidth:2,
                    borderColor:'#fff',
                    
                }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight:'600' }}>
                        {statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failure'}
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={styles.bodyContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Exercises:</Text>
                    <TouchableOpacity style={styles.buttonTitle} onPress={resetFilter}>
                        <Text style={styles.buttonText}>Reset Filter</Text>
                    </TouchableOpacity>
                    
                </View>

                <View style={styles.searchContainer}>
                        <SearchBar
                            placeholder="Name ..."
                            onChange={handleChangeInputSearch}
                        />
                    </View>

                <View style={styles.filtersContainer}>
                    <TouchableOpacity onPress={toggleDropdown} style={styles.button}>
                        <Text style={[styles.text, {textAlign:'center'}]}>{selectedItem}</Text>
                        <Icon name={showDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
                    </TouchableOpacity>
                    <Modal visible={showDropdown} transparent animationType="fade">
                        <TouchableOpacity style={styles.overlay} onPress={toggleDropdown}>
                            <View style={styles.dropdown}>
                                <View style={styles.header}>
                                    <Text style={styles.headerText}>Select Attribute</Text>
                                    <TouchableOpacity onPress={toggleDropdown}>
                                        <Text style={styles.closeButton}>X</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={attributes}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => selectItem(item.name)}>
                                            <Text style={styles.dropdownText}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item.id.toString()}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>


                    <TouchableOpacity onPress={toggleDropdown2} style={styles.button}>
                        <Text style={styles.text}>{equipment}</Text>
                        <Icon name={showDropdown2 ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
                    </TouchableOpacity>

                    <Modal visible={showDropdown2} transparent animationType="fade">
                        <TouchableOpacity style={styles.overlay} onPress={toggleDropdown2}>
                            <View style={styles.dropdown}>
                                <View style={styles.header}>
                                    <Text style={styles.headerText}>Select Number</Text>
                                    <TouchableOpacity onPress={toggleDropdown2}>
                                        <Text style={styles.closeButton}>X</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={data2}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => selectItem2(item)}>
                                            <Text style={styles.dropdownText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>


                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <LottieView
                                source={require('../../assets/403.json')} 
                                autoPlay
                                loop={false}
                                style={styles.lottie}
                            />
                            <Text style={styles.modalText}>Only admin can add exercises!</Text>
                            <TouchableOpacity
                                style={styles.closeButton2}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <TouchableOpacity style={styles.button} onPress={handleFavorite}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.text}>Favorite </Text>
                            <Icon name={isFavor ? 'dot-circle-o' : 'circle-o'} size={25} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Exercise Content */}
                <View style={{ marginBottom: 20 }}>
                    {exerciseData
                        .filter((exercise) => exercise.visible === 1) 
                        .slice(0, showMore ? exerciseData.length : 4)  
                        .map((exercise, index) => (
                            <ExerciseContent
                                key={index}
                                navigation={navigation}
                                imgsrc={exercise.imgsrc}
                                exerciseID={exercise.id}
                                text={exercise.text}
                                propertyDetail={exercise.propertyDetail}
                                setAndRep={exercise.setAndRep}
                                videopath={exercise.videopath}
                                description={exercise.description}
                                isFavorited={exercise.isFavorited}
                                met={exercise.met}
                                back='WorkoutExerciseList'
                                onFavoriteChange={handleFavoriteChange}
                            />
                        ))}
                </View>

                {exerciseData.filter((exercise) => exercise.visible === 1) 
                        .length > 4 && (
                    <TouchableOpacity style={styles.seeMoreContainer} onPress={toggleShowMore}>
                        <Text style={styles.text}>{showMore ? 'See less' : 'See more'}</Text>
                        <Icon name={showMore ? "arrow-up" : "arrow-down"} color={'#fff'} size={20} />
                    </TouchableOpacity>
                )}



                
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Footer1 navigation={navigation} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(34,50,52)',
    },
    bodyContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    titleText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: '4%',
    },
    buttonTitle: {
        width: 160,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgb(34,50,52)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#fff',
    },
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: '4%',
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '4%',
    },
    button: {
        borderColor: '#fff',
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#003b3b',
        padding: 10,
        width: '30%',
        borderRadius: 5,
    },
    text: { // Dark transparent background
        color: 'white',
        fontSize: 20,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        width: '50%',
        backgroundColor: '#003b3b', 
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        fontSize: 18,
        color: '#FF0000', 
    },
    dropdownText: {
        fontSize: 16,
        color: '#fff',
        paddingVertical: 8,
        textAlign: 'center',
    },
    seeMoreContainer: {
        width: 130,
        margin: 'auto',
        borderWidth: 2,
        borderColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },

    modalContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        borderRadius: 8, 
        padding: 10, 
    },
    
    lottie: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    modalText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton2: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default WorkoutExerciseList;