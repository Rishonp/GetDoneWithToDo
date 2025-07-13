import React, { useEffect, useState, createContext, useContext, act } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { BASE_URL } from './utils/config'; // Adjust the import path as necessary

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import ModifyTaskScreen from './screens/ModifyTaskScreen';
import UserSettingsScreen from './screens/UserSettingsScreen';
import UserSearchScreen from './screens/UserSearchScreen';
import RelationshipAck from './screens/RelationshipAck';
import UserRelationSimple from './screens/UserRelationSimple';
import AddTask from './screens/AddTask';
import { UserNToken } from './utils/Token';
import { MainTasks } from './utils/Users';
import SignUp from './screens/SignUp';
import * as Common from './utils/Common';
import Token from './utils/Token';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const HomeTabs = () => {
  const { setToken, setCurrentUsrToken } = useContext(AuthContext);
  const handleLogout = async () => {
    console.log("Logout button pressed");
    await Common.deleteUserTokenInMobile()
    setToken(null)
    setCurrentUsrToken(null)
    console.log("Logout button done successfully");
  };




  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {

          if (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") {
            return null; // hide icon
          }

          let iconName;
          if (route.name === 'HomeScreen') {
            return focused ? null : (
              <Ionicons name="home-outline" size={size} color={color} />
            );
          } else if (route.name === 'AddTask') {
            return focused ? null : (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            );
          } else if (route.name === 'RelationshipAck') {
            return focused ? null : (
              <Ionicons name="people-outline" size={size} color={color} />
            );

          } else if (route.name === 'UserRelationSimple') {
            return focused ? null : (
              <Ionicons name="person-add-outline" size={size} color={color} />
            );
          } else if (route.name === 'ModifyTaskScreen') {
            return focused ? null : (
              <Ionicons name="create-outline" size={size} color={color} />
            );

          } else if (route.name === 'Logout') {
            return focused ? null : (
              <Ionicons name="log-out-outline" size={size} color={color} />
            );

          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") ? () => null : route.name,
        tabBarItemStyle: (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") ? { width: 0, padding: 0 } : undefined,
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="AddTask" component={AddTask} />
      <Tab.Screen name="RelationshipAck" component={RelationshipAck} />
      <Tab.Screen name="UserRelationSimple" component={UserRelationSimple} />
      <Tab.Screen name="ModifyTaskScreen" component={ModifyTaskScreen} />



      <Tab.Screen
        name="Logout"
        component={() => null} // No screen shown
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Prevent default tab behavior
            handleLogout();
          },
        }}
        options={{ tabBarLabel: 'Logout' }}
      />



    </Tab.Navigator>
  );
}



const AppNav = () => {
  const { token, loading, setToken, setCurrentUsrToken } = useContext(AuthContext);
  if (loading) return <SplashScreen />;
  // console.log("Inside App Nav with token ", token);
  // console.log(typeof token);
  // console.log(token === null);
  // console.log(token !== null && token.length !== 0)
  // console.log("Just before the return statement !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  return (
    <Stack.Navigator>
      {token !== null && token.length !== 0 ? (
        <>
          <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />

        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: true }} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: true }} />
        </>
      )}
    </Stack.Navigator>
  );
};


export default function App() {

  const getUsers = async () => {
    console.log("HAHAHA getUsers in react native  starting.......");
    try {
      const response = await axios.get(`${BASE_URL}/getuserdemo/`, { params: { username: "zoe" } });
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
