import axios from 'axios';
import React, {useState, useRef} from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Modal, Pressable } from 'react-native';
import BASE_URL from '../../IPHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommentCard = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  //console.log(props.avatarURL);
  
  const handleEDIT = () => {
    try{
      props.setRating(props.rating);
      props.setComment(props.comment);
      props.setCMTmodalVisible(true);
      props.setTypeFeedback('PUT');
      props.setIDCMT(props.id);
      setIsVisible(false);
    }
    catch(e){
      console.error(e);
    }
  }
  
  const handleDEL = async() => {
    try{
        const token = await AsyncStorage.getItem('accessToken');
        const accountResponse = await axios.get(`${BASE_URL}/api/account`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      const userId = accountResponse.data.id;
      const DELResponse = await axios.delete(`${BASE_URL}/api/feedbacks/${props.id}`, {
        headers:{
          Authorization: `Bearer ${token}`,
        }
      });
      if (DELResponse.status >= 200 && DELResponse.status <= 300){
        props.setStatusMessage('Successful deleted your feedback!');
        props.setModalNotiVisible(true);
        setTimeout(() => {
          props.setModalNotiVisible(false);
        }, 2000);
        props.fetchCMT();
      }
      else{
        props.setStatusMessage('Failed to deleted your feedback! :(');
        props.setModalNotiVisible(true);
        setTimeout(() => {
          props.setModalNotiVisible(false);
        }, 2000);
      }
      setIsVisible(false);


    }
    catch(e){
      console.error(e);
    }
  } 


  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/cmt.png')} 
        style={styles.card}
        imageStyle={styles.bubbleImage}
      >
        <View style={styles.contentRow}>
          <View style={styles.leftColumn}>
            <View style={[styles.star, {justifyContent:'space-between', flexDirection:'row'}]}>
            <Text style={{color:'rgb(255, 0, 0)', fontSize:22, fontWeight:'600'}}>{props.id}</Text>
            {props.isEditable === 1 && (
                <TouchableOpacity onPress={() => setIsVisible((prev) => !prev)}>
                    <Text style={{color:'rgb(18, 255, 104)', fontSize:25, fontWeight:'800'}}>... </Text>
                </TouchableOpacity>
            )}
            </View>


            
            <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
            <Text 
                key={index} 
                style={styles.star}
            >
                {index < props.rating ? '🌟' : '⚝'}
            </Text>
            ))}
            
            </View>
            <Text style={styles.comment}>
              {props.comment}
            </Text>
            <Text style={styles.name}>user: {props.usernameCMT} ({props.level})</Text>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={
                props.avatarURL 
                  ? { uri: props.avatarURL } 
                  : require('../../assets/accel.jpg')
              }
            />
            </View>
          </View>
        </View>
      </ImageBackground>
      {isVisible && (
                <View style={styles.comboBox}>
                    <TouchableOpacity
                        style={styles.comboItem}
                        onPress={() => handleEDIT()}
                    >
                        <Text style={styles.comboText}>Edit Feedback</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.comboItem2}
                        onPress={() => handleDEL()}
                    >
                        <Text style={styles.comboTextDEL}>Delete Feedback</Text>
                    </TouchableOpacity>
                </View>
            )}
                </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  card: {
    width: '100%',
    height: 250,
    padding: 0,
    flexDirection: 'row',
    
  },
  bubbleImage: {
    resizeMode: 'stretch',
    
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '6%',
    flex: 1,
  },
  leftColumn: {
    flex: 3, 
    paddingRight: 10,
    marginBottom:20,
    marginLeft:'12%'
  },
  rightColumn: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:50
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
    color: '#fbc02d',
    marginRight: 4,
  },
  comment: {
    fontSize: 12,
    color: '#000',
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: '700',
    textAlign:'justify'
  },
  name: {
    fontSize: 15,
    color: '#000',
    fontStyle: 'italic',
    
  },
  avatarContainer: {
    width: 100,
    height: 100,
    marginBottom: 35,
    borderRadius: 99,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderWidth:4,
    borderColor:'rgba(18, 255, 104, 0.5)',
    borderRadius: 99
  },
  comboBox: {
    position: 'absolute',
    top: 50, 
    right: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
  comboItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      backgroundColor:'rgb(36, 105, 68)',
      borderTopLeftRadius:5,
      borderTopRightRadius:5
  },
  comboItem2: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  comboText: {
      fontSize: 16,
      color: 'rgb(97, 255, 212)',
      fontWeight:'600'
  },
  comboTextDEL: {
    fontSize: 16,
    color: 'red',
    fontWeight:'700'
  },
});

export default CommentCard;
