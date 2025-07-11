import { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
    //console.log('LoginScreen rendereding... ');
    const currentUser = new Users('', '', '', '', '', 1);
    const { setToken } = useContext(AuthContext);
    const { setCurrentUsrToken } = useContext(AuthContext);
    //const [userID, setuserID] = useState('userID');
    const [username_s, setusername] = useState('');
    //const [useremail, setuseremail] = useState('');
    const [userpass_hashed_s, setuserpass_hashed] = useState('');
    //const [user_createDatetime, setuser_createDatetime] = useState(new Date());
    //const [user_isActive, setuser_isActive] = useState(1);
    //const [loading, setLoading] = useState(false);
    //const [error, setError] = useState(null);
    const [message_s, setMessage] = useState('');



    const handleTheLogin = () => {
        const user = new Users("", username_s, "", userpass_hashed_s, new Date(), 1)
        const tkn = new Token("", "bearer", new Date(), "", username_s)

        const usertoken = new UserNToken(user, tkn)
        const usertoken_dict = usertoken.toDict()
        //console.log("sending1111111")
        //console.log(usertoken_dict)

        axios
            .post('http://192.168.0.113:8000/LogInUserNew1/', { params: usertoken_dict })
            .then((response) => {
                setMessage("login successful..refreshing token")
                //console.log("response!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                //console.log(response.data)
                Common.storeUserTokenInMobile_Dict(response.data).then((responseDict) => {
                    console.log("good till here1 ")
                    if (responseDict != null) {
                        //now write code tyo move to Home screen
                        //console.log("responseDict is ")
                        //console.log(responseDict)
                        const usrTkn = UserNToken.fromDict(responseDict)
                        //console.log("uerTkn is ... ")
                        //console.log(usrTkn)
                        //console.log("good till here2 ")
                        console.log("good till here2 from handlelogin")
                        setToken(usrTkn.token.access_token)
                        console.log("good till here3 from handlelogin")
                        setCurrentUsrToken(usrTkn)
                        console.log("good till here4 from handlelogin")
                        console.log("setCurrentUsrToken called in login with    ", usrTkn)
                    }
                }).catch((errorStoringSecureStore) => {
                    console.log("errorStoringSecureStore", errorStoringSecureStore)
                    console.log("responseDict", responseDict)
                    setMessage(errorStoringSecureStore)
                })
            })
            .catch((error) => {
                console.log("error1111111")
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
            });
    }


    const handleLoginSignUp = () => {
        // Make sure to import axios at the top: import axios from 'axios';


        user = Users("", username_s, "", userpass_hashed_s, "", 1)
        tkn = Token("", "bearer", "", "", username_s)
        usertoken = UserNToken(user, tkn)
        axios
            .get('http://192.168.0.113:8000/LogInUserNew1/', { params: { username: username_s } })
            .then((response) => {
                console.log("Got response from CheckifUserExists API:......");
                console.log(response.data);
                const userRet = Users.fromDict(response.data);
                console.log("below is userRect Object");
                console.log(userRet);
                if (userRet.username === "") {
                    // user not found, proceed to sign up
                    console.log(" user not found, proceed to sign up");
                } else {
                    // user exists, check password
                    console.log("User exists now checking password ");
                    if (userRet.userpass_hashed !== userpass_hashed_s) {
                        // password incorrect
                        console.log("Password is incorrect, pls try again");
                        setMessage("Password is incorrect, pls try again");
                    } else {
                        // login successful
                        console.log("Login successful");
                        setMessage("Login successful");
                        currentUser.username = userRet.username;
                        currentUser.useremail = userRet.useremail;
                        currentUser.userpass_hashed = userRet.userpass_hashed;
                        currentUser.user_createDatetime = userRet.user_createDatetime;
                        currentUser.user_isActive = userRet.user_isActive;
                        console.log("User is logged in successfully");
                        //ToDO : set new JWT token and then let user move to Home screen
                        /////navigation.navigate('HomeScreen', currentUser.toDict()); // Navigate to Home screen after successful login

                    }
                }
            })
            .catch((error) => {
                Alert.alert('Error calling Axios get  ', error.response?.data?.message || 'Something went wrong');
            });
    }



    //console.log('LoginScreen rendereding 2');
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

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
                style={styles.input} z
                placeholder="Password"
                value={userpass_hashed_s}
                secureTextEntry
                onChangeText={setuserpass_hashed}
                placeholderTextColor="#888"
            />

            {message_s !== '' && (
                <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleTheLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLoginSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>


        </View>
    ); // end of return 
}

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