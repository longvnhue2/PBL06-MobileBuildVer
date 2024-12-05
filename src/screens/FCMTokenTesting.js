import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import JWT, * as jwt from 'expo-jwt';
import axios from 'axios';
const FirebaseMessaging = () => {
  useEffect(() => {
    const fetchBearerToken = async () => {
      try{
      const serviceAccount = {
        client_email: 'firebase-adminsdk-ru9rz@homeworkoutapplication-a9904.iam.gserviceaccount.com',
        private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZq3ZmrGfWqrW3\nPeMh5RJP5qUNnJIgkDwpz8opCAuXsDlcYOfLvBYTpejFGfeVfY1H7AuC8lWaYZsQ\nKuoClgKoMRMubVJuoT4wsdb9AYYuHmOKY2J5iCdSv03XeYanD7Kngz/wUuGKjBeq\nfhpiWF6lI5Ys5EUMPhsnT3E7HLhbQ6nEX/JQJ66iIjSV6O6loP0N+jFiB/KoOFwg\nvjM5/v6I6N2U71g9WH7sCUJmIs3WC653tve7GZTzAXykYrfWmB7r50oRqbgcPCy3\n+3oJ3oD+NEW4/0dDjK4bOl9km23VYH3zPRklAOcVn3Cs9lNg/NAXsi76Pd89ANFH\nBcZ9kkQVAgMBAAECggEADhDZbtsXPrT7VyMFqWwPGeCyq8WBX99SM/V8f9hIP34g\nxspwUCcQWiavewUpjZx2Y75qJAUa6QYDqjDLvG0LMOky7x4bZJDA3w6u8NyHWjWW\ngxvXAjl9KQi5tAHjZKpMBi0iFZqVfol9AgRyGgbR3uQE0VPS7m6Y/JpSm9pIQ4Vm\nUAhlskLfnEkp1e1AbHxpf76Yh+Ae2Ub2ONEVzNLRnM5+1RCXmacYVtal2OKtRdMm\naLJgN40gXWQFZNd2E3v78PcI4JNHqcVnRoEV01pfyMSkohRdvjSQibkwxuWsFcm0\n1JUgD1QRkx7WebCH9Dt8TdRylJ1+gq3bVQV4cYppYQKBgQDxMyKhVgN8KVSEvHAO\nb+sbgu0QP96xTZrM0CemTcfllFFp42feTwkZgZUD/K0GSIv5cnb801Oe+y3fqWsx\nphu+FRV910fcfhWGi6MP9Q/cKztsvE+o+/4V6WFJReveDKw08O9n1D1y+2v0EtY3\n7V9l/T2K9IGv7iinGvM0uyYB/QKBgQDnBrVxs1JTxPt/6ITDVMp+sz5wWmZDv3SL\npAyRw53k7opLw3TwVcGViXcLHohT4lfbeaBmoRaLPrWkyVjpcwlCImG8Sw58Gxgj\nfSS1+nCEWsY6U32EX3ngSuPgYC9Z5X2Ksv9fcMsi6Iw/8K//HZHllLKi3r2/tZW7\nIqeME505+QKBgFBuOtgN9K+MoLB6netSitXrvN20TrBVLo+pwe8E9OmrodJrkJFj\nTaeBvI1NzuzPeE3AS8lXNwVGwS9aMXKm741dPoNuLHpsWQU6vy9tCtLiX7iMuwug\nrEPmRRjIBjVPiIVG6q526d7T1FXZijGwKCW8Yq9ZhX2DL28532vwFGaJAoGBAIjT\nAlcKmzGdsk34ydhduWf8hHhKMdLh6wZg7EjQEA1r8WAZrIJCZ9pGhciCFr+Hh/0m\nNYdS1GU3iKDF1vC7/rm6XyQDV9rMuSkbjshwQH9Cu7ADjoz9dtMNx5Q1oxWcwxOI\nG5LM3KIaFCYySCnRu3y66mlnff2yb7FbPtvJKg8RAoGABuRxJDWzqfCHD/2vA5zf\n993ONvUeEyHj4a9jmo3rQBEXioc15UvYe6KdWAUO1LroXd7ySgBKZv8LSa/Kw0/9\n3NQWFSqgnhGg94IR/a3q0bE0Vy52Tcy6Q/56q8uuhstfzhOGuLDScmJmoU7Y1fi2\n+GPLc812kN0e4NaQdkHaPlc=\n-----END PRIVATE KEY-----\n`,
      };
      const SCOPES = 'https://www.googleapis.com/auth/firebase.messaging';

      const now = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        iss: serviceAccount.client_email,
        scope: SCOPES,
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      };


      const signedJwt = JWT.encode(jwtPayload, serviceAccount.private_key, 'RS256');
      console.log(signedJwt);
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signedJwt,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(response.status);
  
      // Xử lý kết quả
      if (response.data.access_token) {
        console.log('Bearer Token:', response.data.access_token);
        return response.data.access_token;
      } else {
        console.error('Error fetching access token:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

    fetchBearerToken();
  }, []);

  return (
    <View>
      <Text>Firebase Messaging</Text>
    </View>
  );
};

export default FirebaseMessaging;
