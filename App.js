import React, { useEffect, useState, createContext, useContext, act, useRef } from 'react';
import { View, SafeAreaView } from 'react-native';
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
// Add this import at the top with your other imports
import Constants from 'expo-constants';
import { MaterialIcons } from "@expo/vector-icons";


import * as Device from 'expo-device'; // Add this line
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native'; // Add this import if not already present





//code for notifications : How it wil lbe handelled 
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});






const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const EmptyLogoutComponent = () => null;

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
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {

          if (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") {
            return null; // hide icon
          }

          let iconName;
          if (route.name === 'HomeScreen') {
            return focused ? null : (
              <Ionicons name="home-outline" size={size} color={Common.getColor('blueblue')} />
            );
          } else if (route.name === 'AddTask') {
            return focused ? null : (
              <Ionicons name="create-outline" size={size} color={Common.getColor('blueblue')} />
            );
          } else if (route.name === 'RelationshipAck') {
            return focused ? null : (
              <Ionicons name="people-circle-outline" size={size} color={Common.getColor('blueblue')} />
            );

          } else if (route.name === 'UserRelationSimple') {
            return focused ? null : (
              <Ionicons name="people-outline" size={size} color={Common.getColor('blueblue')} />
            );
          } else if (route.name === 'ModifyTaskScreen') {
            return focused ? null : (
              <Ionicons name="create-outline" size={size} color={Common.getColor('blueblue')} />
            );

          } else if (route.name === 'Logout') {
            return focused ? null : (
              <Ionicons name="log-out-outline" size={size} color="grey" />
            );

          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: () => null,
        // tabBarLabel: (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") ? () => null : route.name,
        // tabBarItemStyle: (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") ? { width: 0, padding: 0 } : undefined,
        tabBarItemStyle: (route.name === 'HomeScreen' || route.name === "ModifyTaskScreen") ? {
          display: 'none' // Completely hide HomeScreen tab
        } : {
          flex: 1, // Evenly distribute visible tabs
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: Common.getColor('darkgreen'),
          borderTopWidth: 1,
          //borderTopColor: '#e9ecef',
          height: 60,
          paddingBottom: 0,
          paddingTop: 0,

        },
      })}>

      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="AddTask" component={AddTask} />
      <Tab.Screen name="RelationshipAck" component={RelationshipAck} />
      <Tab.Screen name="UserRelationSimple" component={UserRelationSimple} />
      {/* <Tab.Screen name="ModifyTaskScreen" component={ModifyTaskScreen} /> */}

      <Tab.Screen
        name="Logout"
        component={EmptyLogoutComponent} // Use the external component
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      // options={{ tabBarLabel: 'Logout' }}
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

    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator>
        {token !== null && token.length !== 0 ? (
          <>
            <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ModifyTaskScreen" component={ModifyTaskScreen} options={{ headerShown: false }} />

          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </SafeAreaView>

  );
};


export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [lastNotification, setLastNotification] = useState(null);


  const notificationListener = useRef();
  const responseListener = useRef();


  const storeNoticificationToken = async (token) => {
    console.log("Storing notification token in App.js");
    try {
      setExpoPushToken(token)
      console.log("1")
      await SecureStore.setItemAsync('expoPushToken', token);
      console.log("2")

      //ToDo: Write code to store the token in the backend
      //Step 1 get user ID and UserName stored in secure store
      const storedToken = await Common.retrieveUserTokenInMobile()
      console.log("3")
      console.log("Stored token is ", storedToken);
      if (storedToken !== null) {
        const payload = {
          params: {
            userid: storedToken.user.userid,
            notitoken: token,
            username: storedToken.user.username,
          }
        }
        try { // this is for api call to store the token in the backend
          console.log("Payload in APP. js  is ", payload);
          const response = await axios.post(`${BASE_URL}/createUserNotificationToken/`, payload, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          console.log("Response from API to store notification token is ", response.data);
        } catch (error) {
          console.error('Error in API for storing notification token ', error);
        }
      } else {
        console.log("Setting token as null ,cannot store notification token to DB")
      }
      console.log("Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
    }
  }


  useEffect(() => {
    // Get permission + token
    registerForPushNotificationsAsync()
      .then(token => {
        console.log("Token received from registerForPushNotificationsAsync:", token);
        if (token) {
          storeNoticificationToken(token);
        } else {
          console.log("No token received from registerForPushNotificationsAsync");
        }
      })
      .catch(error => {
        console.error("Error in registerForPushNotificationsAsync:", error);
      });
    // Foreground listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setLastNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };

  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    console.log("Registering for push notifications...");

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      console.log("just before checking if device is physical");
      console.log("Device.isDevice is ", Device.isDevice);

      if (Device.isDevice) {
        console.log("device is physical");
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          console.log("status is not granted, requesting permissions");
          const { status } = await Notifications.requestPermissionsAsync();
          console.log("status after requesting permissions is ", status);
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return null;
        }

        // Get project ID from app.json via Constants
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          console.log('Project ID from app.json:', projectId);

          if (projectId) {
            const expoPushToken = await Notifications.getExpoPushTokenAsync({
              projectId: projectId
            });
            token = expoPushToken.data;
            console.log('Expo push token with project ID:', token);
          } else {
            console.log('No project ID found, using fallback method');
            const expoPushToken = await Notifications.getExpoPushTokenAsync();
            token = expoPushToken.data;
            console.log('Expo push token (fallback):', token);
          }
        } catch (tokenError) {
          console.error('Error getting push token:', tokenError);
          // Fallback without project ID
          try {
            const expoPushToken = await Notifications.getExpoPushTokenAsync();
            token = expoPushToken.data;
            console.log('Expo push token (final fallback):', token);
          } catch (fallbackError) {
            console.error('Fallback token error:', fallbackError);
            return null;
          }
        }
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }
      console.log("Token registered successfully:", token);
      // Return the token
      console.log("Returning token from registerForPushNotificationsAsync:", token);
      return token;
    } catch (error) {
      console.error('Error in registerForPushNotificationsAsync:', error);
      return null;
    }
  }


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
