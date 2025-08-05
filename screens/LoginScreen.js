import { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ route, navigation }) => {
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
        console.log("handleTheLogin called 1");
        const user = new Users("", username_s, "", userpass_hashed_s, new Date(), 1)
        const tkn = new Token("", "bearer", new Date(), "", username_s)

        const usertoken = new UserNToken(user, tkn)
        const usertoken_dict = usertoken.toDict()
        //console.log("sending1111111")
        //console.log("login dict nmnmnmmnmnmnmn", usertoken_dict)
        //console.log("BASE_URL", BASE_URL);
        console.log("handleTheLogin called 2");
        axios
            .post(`${BASE_URL}/LogInUserNew1/`, { params: usertoken_dict })
            .then((response) => {
                setMessage("login successful..refreshing token")
                console.log("handleTheLogin called 2.5");

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
                        console.log("handleTheLogin called 3");

                    }
                }).catch((errorStoringSecureStore) => {
                    console.log("handleTheLogin called ERRORRRRRRR");
                    console.log("errorStoringSecureStore", errorStoringSecureStore)
                    console.log("responseDict", responseDict)
                    setMessage(errorStoringSecureStore)
                })
            })
            .catch((error) => {
                console.log("handleTheLogin called ERERERERER");
                console.log("error1111111", error)
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


    const handleSignUp = () => {
        navigation.navigate('SignUp');
    }



    //console.log('LoginScreen rendereding 2');
    return (
        <LinearGradient
            colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <Image
                source={require('../assets/logo2.png')}
                style={styles.watermarkLogo}
                resizeMode="contain"
            />


            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="User Name"
                value={username_s}
                keyboardType="default"
                autoCapitalize="none"
                onChangeText={setusername}
                placeholderTextColor={Common.getColor("placeholder")}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={userpass_hashed_s}
                secureTextEntry
                onChangeText={setuserpass_hashed}
                placeholderTextColor={Common.getColor("placeholder")}
            />

            {message_s !== '' && (
                <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
            )}

            <View style={styles.containerFlatList}>
                <TouchableOpacity style={styles.editButtonFull} onPress={() => handleTheLogin()}>
                    <Icon name="login" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.buttonText}>  Login  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButtonFull} onPress={() => handleSignUp()}>
                    <Icon name="app-registration" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.buttonText}>  Sign up  </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 2,
        padding: 24,
        backgroundColor: 'transparent',
    },
    watermarkLogo: {
        width: 90,
        height: 90,
        alignSelf: 'center',
        marginBottom: 5,
        marginTop: 5,
        opacity: 0.1,
        zIndex: 0,
    },
    containerFlatList: {
        justifyContent: 'flex-start',
        padding: 2,
        backgroundColor: 'transparent',
        width: '100%',
        marginVertical: 1,
        // Remove: flex: 1,
    },

    message: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
        color: Common.getColor("textPrimary"),
        fontWeight: '500',
        zIndex: 1,
    },
    messageSuccess: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
        color: Common.getColor("success"),
        fontWeight: '600',
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        marginBottom: 10,
        fontWeight: '600',
        textAlign: 'center',
        color: Common.getColor("textPrimary"),
        zIndex: 1,
    },
    input: {
        height: 48,
        borderColor: Common.getColor("inputBorder"),
        borderWidth: 2,
        marginBottom: 20,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: Common.getColor("textPrimary"),
        backgroundColor: Common.getColor("inputBackground"),
        fontWeight: '500',
        zIndex: 1,
    },
    button: {
        backgroundColor: Common.getColor("buttonPrimary"),
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: Common.getColor("buttonPrimary"),
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButtonFull: {
        backgroundColor: Common.getColor("blueblue"),
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: Common.getColor("buttonText"),
        fontSize: 18,
        fontWeight: '500',
    },
});