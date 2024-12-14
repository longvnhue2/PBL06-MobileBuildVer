import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import { loginValidationSchema } from '../components/Validate';
import BASE_URL from '../../IPHelper.js';

const AuthLoginApi = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const LoginScreen = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const name = props.route.params?.name || 'HomieScr';

  const handleLogin = async (values) => {
    try {
      const { data: res } = await AuthLoginApi.post('/api/auth/login', {
        username: values.username,
        password: values.password,
      });

      const {accessToken, refreshToken, expiredIn} = res;

      console.log("Access token:", accessToken);

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('expiresIn', (Date.now() + expiredIn * 1000).toString());
      await AsyncStorage.setItem('username', values.username);

      startRefreshTokenInterval()

      if (name) props.navigation.navigate(name);
      else props.navigation.navigate('HomieScr');
    } 
    catch (error) {
      console.log(error);
      Alert.alert('Error', 'Wrong username or password! Please try again!');
    }
  }

  const startRefreshTokenInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const refreshTime = 55 * 60 * 1000;

    intervalRef.current = setInterval(async () => {
      console.log("Attempting to refresh token...");
      await refreshAccessToken();
    }, refreshTime);
  };

  const refreshAccessToken = async () => {
    console.log("Checking for refresh token...");
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      return;
    }

    try {
      console.log("Refreshing token...");
      const { data: accessToken } = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
        refreshToken: refreshToken,
      })

      await AsyncStorage.setItem('accessToken', accessToken.accessToken);

      console.log("Token refreshed successfully");
      console.log("New access token:", accessToken.accessToken);
    }
    catch (error) {
      console.log("Error to refresh token: ", error);
    }
  };

  const submitLogin = async (values) => {
    setLoading(true); 
    await handleLogin(values);
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <Formik
        initialValues={{ username: '', password: ''}}
        validationSchema={loginValidationSchema}
        onSubmit={submitLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>

            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor="#ccc"
              value={values.username}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
            />
            {touched.username && errors.username && 
              <Text style={styles.errMessage}>{errors.username}</Text>
            }

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#ccc"
                value={values.password}
                secureTextEntry={!showPassword}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
                <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && 
              <Text style={styles.errMessage}>{errors.password}</Text>
            }

            <View style={styles.navigationContainer}>
              <TouchableOpacity style={styles.forgotPassword} onPress={() => props.navigation.navigate('SignUp')}>
                <Text style={styles.SecondText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotPassword} onPress={() => props.navigation.navigate('ForgotPassword')}>
                <Text style={styles.SecondText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <AntDesign name="google" size={24} color="white" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
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
    fontFamily:'DancingScript-Bold',
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
  showText: {
    color: 'gray',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  SecondText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#00e676',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    color: '#ccc',
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  googleButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  errMessage: {
    color: 'red',
    fontSize: 14,
  },
});

export default LoginScreen;
