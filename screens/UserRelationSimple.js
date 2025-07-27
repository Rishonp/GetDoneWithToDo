import React, { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch, StatusBar, Platform } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import { MainTasks } from '../utils/Users';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
//import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard } from 'react-native';
import { BASE_URL } from "../utils/config";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';


const UserRelationSimple = ({ route, navigation }) => {
    //const { taskStringifyed } = route.params;
    const { setToken } = useContext(AuthContext);
    const { currentUsrToken } = useContext(AuthContext);
    const { token } = useContext(AuthContext);
    const [message_s, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [relationUserID, setRelationUserID] = useState('');
    const [relationUserName, setRelationUserName] = useState('');
    const [userrelation_uniqueIdentifier, setuserrelation_uniqueIdentifier] = useState('');
    //Rishon start

    const cancelPress = () => {
        navigation.navigate('HomeScreen')
    }

    const setOnPress = async () => {
        const usertoken = new UserNToken(currentUsrToken.user, currentUsrToken.token)
        if (relationUserName.trim() === '') {
            Alert.alert("Please enter a user name");
            return;
        }
        if (relationUserName.trim() === currentUsrToken.user.username) {
            Alert.alert("You cannot add relation with yourself");
            return;
        }

        setLoading(true);
        try {
            //console.log("currentUsrToken         is ", currentUsrToken);
            //const usertoken = new UserNToken(user, tkn)
            const dataForAPI = {
                "loggedInUserID": usertoken.user.userid,
                "loggedInUserName": usertoken.user.username,
                "relationUserName": relationUserName,
            }
            const dictAsString = JSON.stringify(dataForAPI);
            console.log("dictAsString is ", dictAsString);
            const response = await axios.get(`${BASE_URL}/GetUserIDgivenUserName/`, { params: { inputData: dictAsString } }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setRelationUserID(response.data.id);
                setRelationUserName(response.data.username);
                setuserrelation_uniqueIdentifier(`${Date.now()}_${response.data.id}`);

                Toast.show({
                    type: 'success',
                    text1: 'User Relation Set',
                    text2: `${response.data.username}`,
                });
                setRelationUserName('');
                setMessage(``);
            }
        } catch (error) {
            console.log("Error SETTING  user: ", error);
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


        } finally {
            setLoading(false);
        }
    }

    const onFormLoadFunction = () => {


        //console.log("this is the form load function");
    }



    // Reset message when screen gets focus
    useFocusEffect(
        React.useCallback(() => {
            setMessage('');
            setRelationUserID('');
            setRelationUserName('');
            setuserrelation_uniqueIdentifier('');
        }, [])
    );


    useEffect(() => {
        onFormLoadFunction()
        //ToDO call function to load user name of added by user 
    }, []);



    return (

        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0 }}>

            <LinearGradient
                colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >

                <View style={styles.container}>
                    <Text style={styles.largeText}>Enter your Family's or Friend's user name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="User Name"
                        value={relationUserName}
                        onChangeText={setRelationUserName}
                        autoCapitalize="none"
                    />

                    <View style={styles.row}>

                        <TouchableOpacity style={styles.editButton} onPress={() => setOnPress()}>
                            <Icon name="check" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>  Set  </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => cancelPress()}>
                            <Icon name="chevron-left" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>  Back  </Text>
                        </TouchableOpacity>



                    </View>





                    {message_s !== '' && (
                        <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
                    )}

                </View>


            </LinearGradient>


        </View>


    );



}

export default UserRelationSimple;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'top',
        padding: 24,
        //backgroundColor: '#fff',
    },
    largeText: {
        textAlign: 'center',
        fontSize: 16,
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
        height: 58,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    picker: {
        height: 58,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5,
        overflow: 'hidden', // Prevents Picker from spilling out
        height: 58, // Ensures consistent height
    },
    button_datetime: {
        backgroundColor: 'lightgray',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },

    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: Common.getColor("darkgreen"),
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',

    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    switch: { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], },
});