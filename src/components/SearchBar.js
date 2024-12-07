import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

const SearchBar = (props) => {
  const { placeholder, onChange } = props
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Search:</Text>
      
      <View style={styles.inputContainer}>
        <Icon name='search' size={18} color="white"/>
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor='gray'
          onChangeText={onChange}
          style={styles.input}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '50%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 21,
    color: 'white'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 30,
    width: '70%',
    height: '80%',
    paddingHorizontal: 15
  },
  input: {
    fontSize: 20,
    color: 'white',
    marginLeft: 8
  }
})

export default SearchBar