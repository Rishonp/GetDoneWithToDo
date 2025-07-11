import React, { useEffect, useState, createContext, useContext, act } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import ModifyTaskScreen from './screens/ModifyTaskScreen';
import UserSettingsScreen from './screens/UserSettingsScreen';
import UserSearchScreen from './screens/UserSearchScreen';
import UserRelationSimple from './screens/UserRelationSimple';

import Token from './utils/Token';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();




const AppNav = () => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <SplashScreen />;
  console.log("Inside App Nav with token ", token);
  console.log(typeof token);
  console.log(token === null);
  console.log(token !== null && token.length !== 0)
  console.log("Just before the return statement !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  return (
    <Stack.Navigator>
      {token !== null && token.length !== 0 ? (
        <>
          <Stack.Screen name="UserRelationSimple" component={UserRelationSimple} options={{ headerShown: true }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ModifyTaskScreen" component={ModifyTaskScreen} options={{ headerShown: true }} />
        </>
      ) : (
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: true }} />
      )}
    </Stack.Navigator>
  );
};


export default function App() {

  const getUsers = async () => {
    console.log("HAHAHA getUsers in react native  starting.......");
    try {
      const response = await axios.get('http://192.168.0.113:8000/getuserdemo/', { params: { username: "zoe" } });
      console.log("getUsers is all ok ......1111111");
      console.log("below is the response from the API in front of jia");
      console.log(response.status);
      console.log(response.data);
    } catch (error) {
      // Handle any errors that occurred during the request
      console.log(response.status);
      console.log(response.data);
      console.error('Error fetching todos:', error.message);
    }
  }

  //getUsers()
  return (
    //Step 1 call  fast API to get the list of todo for this user
    // Step 2 check if API returned succesful or with error
    // Step 3 if error show error message
    // Step 4 if success show the list of todos

    <AuthProvider>
      <NavigationContainer>
        <AppNav />
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
