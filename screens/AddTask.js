import { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch, FlatList } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import { MainTasks } from '../utils/Users';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
//import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard } from 'react-native';
import { Platform } from 'react-native';
import { BASE_URL } from '../utils/config';

const AddTask = ({ route, navigation }) => {
    const { currentUsrToken } = useContext(AuthContext);
    const { token } = useContext(AuthContext);
    const [message_s, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [theTask, setTheTask] = useState({
        userid: currentUsrToken.user.userid,
        tasktext: '',
        addtocal: 0,
        priority: 0,
        startdatetime: new Date(),
        enddatetime: new Date(),
        donestatus: 0,
        remarks: '',
        addedby_userid: currentUsrToken.user.userid,
        addedby_datetime: new Date(),
        uniqueidentifyer: '',
        taskack: 0,
        taskack_datetime: new Date(),
    });
    const [relationList, setRelationList] = useState([]);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // this is for the selected item in FlatList of relationships - this is the unique Identifier
    const [selectedId_relation, setSelectedId_relation] = useState(null); // this is for the selected item in FlatList of relationships - this is the relation ID


    const handleSave = async () => {
        console.log("Saving task:", theTask);
        if (selectedId == null || selectedId === undefined || selectedId === '') {
            // no need to do anything as task will be added for self
            console.log("selectedId is null or undefined or empty, hence adding task for self");
            theTask.addedby_userid = ""
            theTask.addedby_datetime = None
        } else {
            // add task for that Guy
            theTask.userid = selectedId_relation;
            theTask.addedby_userid = currentUsrToken.user.userid;
            theTask.addedby_datetime = new Date();
        }



        const payload = Common.getpayLoadFromMainTask(theTask)
        try {
            const response = await axios.post(`${BASE_URL}/AddTask/`, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Task Added Successfully',
                    position: 'top',
                });
                navigation.navigate('HomeScreen');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to Add Task',
                    position: 'top',
                });
            }
        } catch (error) {
            console.error('Error saving task as done ', error);
        }
        // Save logic here (API call or state update)
        // After saving, go back
        //navigation.goBack();
        console.log("Saving task:", theTask);

    };

    const handleCancel = () => {
        navigation.navigate('HomeScreen');
    };



    const OnPageLoad = async () => {
        // api call to fetch user names who have consented to relatiopnship
        const usertoken = new UserNToken(currentUsrToken.user, currentUsrToken.token)
        try {
            const dataForAPI = {
                "loggedInUserID": usertoken.user.userid,
                "loggedInUserName": usertoken.user.username,
            }
            const dictAsString = JSON.stringify(dataForAPI);
            //console.log("dictAsString is ", dictAsString);
            const response = await axios.get(`${BASE_URL}/GetRelationsofUserWhoAcnowleged/`, { params: { inputData: dictAsString } }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data) {
                setRelationList(response.data);
                console.log("Response data is ", response.data);
                //console.log("Response data length ", response.data.length);
                Toast.show({
                    type: 'success',
                    text1: 'User found',
                    text2: `Found user: ${response.data.username}`,
                });
            }

        } catch (error) {
            console.error("Error in OnPageLoad", error);
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
        }


    };
    useEffect(() => {
        OnPageLoad()
        //ToDO call function to load user name of added by user 
    }, []);

    const handleConfirmStartPicker = (date) => {
        //not sure why date picker returns a date with one day more than selected. Hence the -1
        //console.log("handleConfirmStartPicker called with date", date);
        let tempdate = new Date(date);
        ////////// tempdate.setDate(tempdate.getDate() - 1);
        //console.log("handleConfirmStartPicker called with date", tempdate);
        setTheTask({ ...theTask, startdatetime: tempdate });
        hideStartDatePicker();
    };

    const showStartDatePicker = () => {
        setTheTask({ ...theTask, startdatetime: theTask.startdatetime || new Date() })
        setShowStartPicker(true);
    };
    const hideStartDatePicker = () => {
        setShowStartPicker(false);
    };

    const handleConfirmEndPicker = (date) => {
        //not sure why date picker returns a date with one day more than selected. Hence the -1
        let tempdate = new Date(date);
        tempdate.setDate(tempdate.getDate() - 1);
        setTheTask({ ...theTask, enddatetime: tempdate });
        hideEndDatePicker();
    };

    const showEndDatePicker = () => {
        setTheTask({ ...theTask, enddatetime: theTask.enddatetime || new Date() })
        setShowEndPicker(true);
    };
    const hideEndDatePicker = () => {
        setShowEndPicker(false);
    };

    //console.log("_______________________________");
    //console.log("aaaaaaa", theTask.startdatetime);
    //a = Common.convertDateToStringDDMMYYYYHHMMSS(theTask.startdatetime);
    //console.log("aaaaaaa1111", a);
    //console.log("convertDateToStringDDMMYYYYHHMMSS called with date", theTask.startdatetime);
    //console.log("convertDateToStringDDMMYYYYHHMMSS called with date", theTask.startdatetime instanceof Date);
    //theTask.startdatetime.setDate(theTask.startdatetime.getDate() + 1);
    //console.log("New date .....", theTask.startdatetime);

    const selectDeselectItem = (item) => {
        if (selectedId === item.Userrelation.uniqueidentifyer) {
            setSelectedId(null);
            setSelectedId_relation(null);
        } else {
            setSelectedId(item.Userrelation.uniqueidentifyer);
            setSelectedId_relation(item.Userrelation.relationuserid);
        }
    }

    const renderItem = ({ item }) => (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => selectDeselectItem(item)}>
                <View style={[styles.item, selectedId === item.Userrelation.uniqueidentifyer && styles.selectedItem]}>
                    <Text style={styles.text}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (

        <View style={styles.container}>
            <View style={styles.middleSection}>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        value={theTask.tasktext}
                        onChangeText={(text) => setTheTask({ ...theTask, tasktext: text })}
                        placeholder="Task Text"
                    />

                    <View style={styles.row}>
                        <Text style={styles.largeText}>Done?</Text>
                        <Switch style={styles.switch} value={theTask.donestatus == 1 ? true : false} onValueChange={(value) => setTheTask({ ...theTask, donestatus: value == true ? 1 : 0 })} />
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={theTask.priority}
                            style={styles.picker}
                            onValueChange={(itemValue) => setTheTask({ ...theTask, priority: itemValue })}>
                            <Picker.Item label="P0" value={0} />
                            <Picker.Item label="P1" value={1} />
                            <Picker.Item label="P2" value={2} />
                        </Picker>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.largeText}>Start Date</Text>
                        <TouchableOpacity style={styles.button_datetime} onPress={() => showStartDatePicker()}>
                            <Text style={styles.buttonText}>{Common.convertDateToStringDDMMYYYYHHMMSS(theTask.startdatetime)}</Text>
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={showStartPicker}
                            mode="date"
                            onConfirm={handleConfirmStartPicker}
                            onCancel={hideStartDatePicker}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.largeText}>End Date</Text>
                        <TouchableOpacity style={styles.button_datetime} onPress={() => showEndDatePicker()}>
                            <Text style={styles.buttonText}>{Common.convertDateToStringDDMMYYYYHHMMSS(theTask.enddatetime)}</Text>
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={showEndPicker}
                            mode="date"
                            onConfirm={handleConfirmEndPicker}
                            onCancel={hideEndDatePicker}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={theTask.remarks}
                        onChangeText={(text) => setTheTask({ ...theTask, remarks: text })}
                        placeholder="Remarks"
                    />

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.button_datetime} onPress={() => handleSave()}>
                            <Text style={styles.buttonText}>  Add  </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button_datetime} onPress={() => handleCancel()}>
                            <Text style={styles.buttonText}>  Cancel  </Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
            <View style={styles.bottomSection}>
                <Text style={styles.message}>You can add for ...</Text>
                <FlatList
                    data={relationList}
                    keyExtractor={(item) => item.Userrelation.uniqueidentifyer}
                    renderItem={renderItem}
                />

            </View>
        </View>




    )
}

export default AddTask;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'top',
        padding: 2,
        backgroundColor: '#fff',
        width: '100%',
        marginVertical: 1
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
        backgroundColor: 'blue',
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
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    switch: { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], },
    middleSection: {
        flex: 8, // 80%
        backgroundColor: '#d1ecf1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,          // Thickness of the border
        borderColor: 'black',    // Border color
        borderRadius: 5,         // Optional: rounded corners
        padding: 2,             // Optional: space inside the border
        margin: 2,              // Optional: space outside the border
    },
    bottomSection: {
        flex: 2, // 10%
        backgroundColor: 'white',
        borderWidth: 1,          // Thickness of the border
        borderColor: 'black',    // Border color
        borderRadius: 5,         // Optional: rounded corners
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedItem: {
        backgroundColor: 'lightgreen',
    },
});