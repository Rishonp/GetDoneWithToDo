import React, { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext is defined in context/AuthContext.js
import Users from '../utils/Users'; // Assuming Users is a utility file for user-related functions   
import { BASE_URL } from "../utils/config";

const LoginScreen = async () => {
    console.log('LoginScreen rendereding 1');
    currentUser = Users(userID = '', username = '', useremail = '', userpass_hashed = '', user_createDatetime = None, user_isActive = 0);
    const { setToken } = useContext(AuthContext);
    const [userID, setuserID] = useState('userID');
    const [username, setusername] = useState('');
    const [useremail, setuseremail] = useState('');
    const [userpass_hashed, setuserpass_hashed] = useState('');
    const [user_createDatetime, setuser_createDatetime] = useState(new Date());
    const [user_isActive, setuser_isActive] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');


    const handleLoginSignUp = () => {
        axios
            .get(`${BASE_URL}/CheckifUserExists/`, { params: { username: username } })
            .then((response) => {

                console.log("Got response from CheckifUserExists API:......");
                console.log(response.data);
                if (response.data.success) {
                    const userRet = Users.fromDict(response.data);
                    if (userRet.username === "") {
                        message = "User does not exist, pls sign up";
                        setMessage(message);
                    } else {
                        console.log("User esists now checking password ");
                        if (userRet.userpass_hashed !== userpass_hashed) {
                            message = "Password is incorrect, pls try again";
                            setMessage(message);
                        } else {
                            message = "Login successful";
                            setMessage(message);
                            currentUser = userRet;
                            console.log("User is logged in successfully");
                        }
                    }
                } else {
                    Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
                }
            })
            .catch((error) => {
                Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
            });
    }







    console.log('LoginScreen rendereding 2');
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="User Name"
                value={username}
                keyboardType="default"
                autoCapitalize="none"
                onChangeText={setusername}
                placeholderTextColor="#888"

            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={userpass_hashed}
                secureTextEntry
                onChangeText={setuserpass_hashed}
                placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.button} onPress={handleLoginSignUp}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLoginSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {message !== '' && (
                <Text style={[styles.message, styles.messageSuccess]}>{message}</Text>
            )}

        </View>
    ); // end of return 

};
export default LoginScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    message: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
    },
    messageSuccess: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        marginBottom: 40,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
});