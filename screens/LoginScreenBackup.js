import React, { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext is defined in context/AuthContext.js

import Users from '../utils/Users'; // Assuming Users is a utility file for user-related functions   


const LoginScreenBackup = () => {
    login_user = new Users('', '', '', '', new Date(), 1);
    const { setToken } = useContext(AuthContext);
    const [userID, setuserID] = useState('userID');
    const [username, setusername] = useState('username');
    const [useremail, setuseremail] = useState('useremail');
    const [userpass_hashed, setuserpass_hashed] = useState('pwd');
    const [user_createDatetime, setuser_createDatetime] = useState(new Date());
    const [user_isActive, setuser_isActive] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');


    const handleLogin = () => {
        //ToDo: Implement login logic here
        // Replace this with actual login logic
        Alert.alert('Login Attempt', `Email: ${username}\nPassword: ${userpass_hashed}`);
    };

    console.log('LoginScreen rendereding');
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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            {message !== '' && (
                <Text style={[styles.message, styles.messageSuccess]}>{message}</Text>
            )}


        </View>
    ); // end of return 

};
export default LoginScreenBackup;


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