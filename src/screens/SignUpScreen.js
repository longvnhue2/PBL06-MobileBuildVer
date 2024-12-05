import axios from 'axios';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { signUpValidationSchema } from '../components/Validate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../IPHelper';
const SignUpScreen = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleSignUp = async (values) => {
    setLoading(true)
    try {
        await AsyncStorage.setItem('usernameReg', values.username);
        await AsyncStorage.setItem('passwordReg', values.password);
        await AsyncStorage.setItem('emailReg', values.email);
        const response = await axios.post(`${BASE_URL}/api/register/api/register`, {
                  username: values.username,
                  password: values.password,
                  email: values.email,
      })
      console.log("Registration successfully: ", response.data)
      Alert.alert(
        "Success",
        "Registration successful! Please check your email for active your account!",
        [
          { text: "OK", onPress: () => props.navigation.navigate('LoginScreen') }
        ],
        { cancelable: false }
      );
    }
    catch (err) {
      console.log("Registration failed: ", err)
      Alert.alert('Error', err);
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <Formik
        initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={signUpValidationSchema}
        onSubmit={handleSignUp}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#ccc"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {touched.username && errors.username && <Text style={styles.errMessage}>{errors.username}</Text>}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email && <Text style={styles.errMessage}>{errors.email}</Text>}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showPassword}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
                <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={styles.errMessage}>{errors.password}</Text>}

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your Password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showConfirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showButton}>
                <Icon name={showConfirmPassword ? 'eye' : 'eye-slash'} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errMessage}>{errors.confirmPassword}</Text>}

            <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
              {loading ? (
                <ActivityIndicator color='white'/>
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.navigate('LoginScreen')}>
              <Text style={styles.backText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 50,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  showButton: {
    paddingRight: 12,
  },
  signUpButton: {
    backgroundColor: '#00e676',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
  },
  errMessage: {
    maxWidth: '100%',
    fontSize: 14,
    color: 'red',
  }
});

export default SignUpScreen;
