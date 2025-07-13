import { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';


const SignUp = ({ route, navigation }) => {
    //console.log('LoginScreen rendereding... ');
    const currentUser = new Users('', '', '', '', '', 1);
    const { setToken } = useContext(AuthContext);
    const { setCurrentUsrToken } = useContext(AuthContext);
    //const [userID, setuserID] = useState('userID');
    const [username_s, setusername] = useState('');
    const [useremail_s, setuseremail] = useState('');
    const [userpass_hashed_s, setuserpass_hashed] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message_s, setMessage] = useState('');

    const handleTheSignUp = async () => {
        console.log("handleTheSignUp called")
        const user = new Users("", username_s, useremail_s, userpass_hashed_s, new Date(), 1)
        console.log("handleTheSignUp called1")
        const tkn = new Token("", "bearer", new Date(), "", username_s)
        console.log("handleTheSignUp called2")
        const usertoken = new UserNToken(user, tkn)
        console.log("handleTheSignUp called3")
        console.log("dict  is ", user.user_createDatetime)
        console.log("handleTheSignUp called4")
        console.log("dict  is ", tkn)
        const usertoken_dict = usertoken.toDict()
        console.log("All OK till here...")
        console.log("dict  is ", usertoken_dict)
        try {
            const response = await axios.post(`${BASE_URL}/SignUpUser/`, { params: usertoken_dict })
            if (response.data != null) {
                const responseDict = await Common.storeUserTokenInMobile_Dict(response.data)
                const usrTkn = UserNToken.fromDict(responseDict)
                setToken(usrTkn.token.access_token)
                setCurrentUsrToken(usrTkn)
                Toast.show({
                    type: 'success',
                    text1: 'Sign Up Successful',
                    text2: 'Welcome ' + usrTkn.user.username,
                });
            } else {
                console.log("responseDict is null")
            }
        } catch (error) {
            console.log("error In Signup", error)
            if (typeof error.response !== 'undefined') {
                if (error.response.data?.detail) {
                    setMessage(error.response.data.detail)
                } else {
                    setMessage(error.response.status)
                }
            } else if (error.request) {
                setMessage(`No response from Server`)
            } else {
                setMessage(error.message)
            }
            Toast.show({
                type: 'error',
                text1: 'Error signing up',
                text2: error.message,
            });
            return;
        }




    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="User Name"
                value={username_s}
                keyboardType="default"
                autoCapitalize="none"
                onChangeText={setusername}
                placeholderTextColor="#888"
            />


            <TextInput
                style={styles.input}
                placeholder="Password"
                value={userpass_hashed_s}
                secureTextEntry
                onChangeText={setuserpass_hashed}
                placeholderTextColor="#888"
            />


            <TextInput
                style={styles.input}
                placeholder="Email"
                value={useremail_s}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setuseremail}
                placeholderTextColor="#888"
            />

            {message_s !== '' && (
                <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={() => handleTheSignUp()}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    )
}
export default SignUp

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