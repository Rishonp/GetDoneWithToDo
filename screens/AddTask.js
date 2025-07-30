import React, { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch, FlatList, StatusBar, Platform, Modal } from 'react-native';
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
import { BASE_URL } from '../utils/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';


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
        donestatus_datetime: new Date(),
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

    const [showStartPicker_time, setShowStartPicker_time] = useState(false);
    const [showEndPicker_time, setShowEndPicker_time] = useState(false);

    const [selectedId, setSelectedId] = useState(null); // this is for the selected item in FlatList of relationships - this is the unique Identifier
    const [selectedId_relation, setSelectedId_relation] = useState(null); // this is for the selected item in FlatList of relationships - this is the relation ID

    const [showPriorityPicker, setShowPriorityPicker] = useState(false);

    const priorityOptions = [
        { label: 'P0', value: 0 },
        { label: 'P1', value: 1 },
        { label: 'P2', value: 2 }
    ];


    const renderPriorityPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={[
                            styles.pickerButton,
                            { backgroundColor: theTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                        ]}
                        onPress={() => setShowPriorityPicker(true)}
                    >
                        <Text style={styles.pickerButtonText}>
                            P{theTask.priority}
                        </Text>
                    </TouchableOpacity>

                    <Modal
                        visible={showPriorityPicker}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Priority</Text>
                                {priorityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.modalOption,
                                            theTask.priority === option.value && styles.selectedOption
                                        ]}
                                        onPress={() => {
                                            setTheTask({ ...theTask, priority: option.value });
                                            setShowPriorityPicker(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.modalCancel}
                                    onPress={() => setShowPriorityPicker(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            );
        } else {
            return (
                <View style={[
                    styles.pickerWrapper,
                    { backgroundColor: theTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                ]}>
                    <Picker
                        selectedValue={theTask.priority}
                        style={styles.picker}
                        onValueChange={(itemValue) => setTheTask({ ...theTask, priority: itemValue })}
                    >
                        <Picker.Item label="P0" value={0} />
                        <Picker.Item label="P1" value={1} />
                        <Picker.Item label="P2" value={2} />
                    </Picker>
                </View>
            );
        }
    };


    const handleSave = async () => {
        if (theTask.tasktext.trim() === '') {
            setMessage("Task description required");
            return;
        }


        console.log("Saving task with start date", theTask.startdatetime);
        if (selectedId == null || selectedId === undefined || selectedId === '') {
            // this means user has not selected any relation from the list
            // no need to do anything as task will be added for self
            // hence addedby_userid will be empty
            console.log("selectedId is null or undefined or empty, hence adding task for self");
            theTask.addedby_userid = ""
            theTask.addedby_datetime = new Date();
        } else {
            // add task for that Guy
            theTask.userid = selectedId_relation;
            theTask.addedby_userid = currentUsrToken.user.userid;
            theTask.addedby_datetime = new Date();
        }
        theTask.donestatus_datetime = new Date(); // just store some date time


        //console.log("start date time before conversion", theTask.startdatetime);
        //console.log("start date time with ToLocale conversion", theTask.startdatetime.toLocaleString());
        const payload = Common.getpayLoadFromMainTask111(theTask)
        //console.log("Sending data to server", payload);
        try {
            const response = await axios.post(`${BASE_URL}/AddTask/`, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            //console.log("response is ", response);
            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Task Added Successfully',
                    position: 'top',
                });
                navigation.navigate('HomeScreen');
            } else {
                console.error('Error adding task ', response);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to Add Task',
                    position: 'top',
                });
            }
        } catch (error) {
            console.error('Error saving task as done ', error);
        }
    };

    const handleCancel = () => {
        navigation.navigate('HomeScreen');
    };



    const OnPageLoad = async () => {
        setLoading(true);
        setTheTask({
            userid: currentUsrToken.user.userid,
            tasktext: '',
            addtocal: 0,
            priority: 0,
            startdatetime: new Date(),
            enddatetime: new Date(),
            donestatus: 0,
            donestatus_datetime: new Date(),
            remarks: '',
            addedby_userid: currentUsrToken.user.userid,
            addedby_datetime: new Date(),
            uniqueidentifyer: '',
            taskack: 0,
            taskack_datetime: new Date(),
        });
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
                //console.log("Response data is ", response.data);
                //console.log("Response data length ", response.data.length);
                // Toast.show({
                //     type: 'success',
                //     text1: 'User found',
                //     text2: `Found user: ${response.data.username}`,
                // });
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
        } finally {
            setLoading(false);
        }


    };


    // Refresh tasks when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            OnPageLoad();
        }, [])
    );

    useEffect(() => {
        OnPageLoad()
        //ToDO call function to load user name of added by user 
    }, []);


    const handleConfirmStartPicker_time = (selectedTime) => {
        hideStartTimePicker();
        let msg = Common.validateStartDateAndEndDate(theTask.startdatetime, Common.SlidedDateTime(theTask.startdatetime, selectedTime));
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        theTask.startdatetime = Common.SlidedDateTime(theTask.startdatetime, selectedTime);
        setTheTask({ ...theTask, startdatetime: theTask.startdatetime });
    };


    const handleConfirmEndPicker_time = (selectedTime) => {
        hideEndTimePicker();
        let msg = Common.validateStartDateAndEndDate(theTask.startdatetime, Common.SlidedDateTime(theTask.enddatetime, selectedTime));
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        theTask.enddatetime = Common.SlidedDateTime(theTask.enddatetime, selectedTime);
        setTheTask({ ...theTask, enddatetime: theTask.enddatetime });
    };



    const handleConfirmStartPicker = (date) => {
        hideStartDatePicker();
        // we ned to pick only the date part and not the time part 
        let actualPickedDate = Common.takeDateFromOneAndTimeFromOther(date, theTask.startdatetime);
        let msg = Common.validateStartDateAndEndDate(actualPickedDate, theTask.enddatetime);
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }

        setTheTask({ ...theTask, startdatetime: actualPickedDate });
    };

    const handleConfirmEndPicker = (date) => {
        hideEndDatePicker();
        let actualPickedDate = Common.takeDateFromOneAndTimeFromOther(date, theTask.enddatetime);
        let msg = Common.validateStartDateAndEndDate(theTask.startdatetime, actualPickedDate);
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        setTheTask({ ...theTask, enddatetime: actualPickedDate });
    };
    const showStartDatePicker = () => {
        setTheTask({ ...theTask, startdatetime: theTask.startdatetime || new Date() })
        setShowStartPicker(true);
    };
    const showStartTimePicker = () => {
        setTheTask({ ...theTask, startdatetime: theTask.startdatetime || new Date() })
        setShowStartPicker_time(true);
    };

    const showEndTimePicker = () => {
        setTheTask({ ...theTask, enddatetime: theTask.enddatetime || new Date() })
        setShowEndPicker_time(true);
    };



    const hideStartTimePicker = () => {
        setShowStartPicker_time(false);
    };

    const hideEndTimePicker = () => {
        setShowEndPicker_time(false);
    };

    const hideStartDatePicker = () => {
        setShowStartPicker(false);
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
                <View style={[styles.itemContainer, selectedId === item.Userrelation.uniqueidentifyer && styles.selectedItem]}>
                    <Text style={styles.text}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <Common.LoadingScreen />;
    }

    return (

        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0 }}>

            <LinearGradient
                colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >

                <View style={styles.container}>
                    <View style={styles.middleSection}>
                        <View style={styles.container}>
                            <TextInput
                                style={styles.input}
                                value={theTask.tasktext}
                                onChangeText={(text) => setTheTask({ ...theTask, tasktext: text })}
                                placeholder="add a new Task..."
                            />

                            <View style={[styles.row, { paddingRight: 10 }]}>
                                <Text style={styles.largeText}>Done?</Text>

                                {/* <Switch style={styles.switch} value={theTask.donestatus == 1 ? true : false} onValueChange={(value) => setTheTask({ ...theTask, donestatus: value == true ? 1 : 0 })} /> */}

                                <Switch
                                    style={styles.switch}
                                    value={theTask.donestatus == 1 ? true : false}
                                    onValueChange={(value) => setTheTask({ ...theTask, donestatus: value == true ? 1 : 0 })}
                                    trackColor={{
                                        false: Common.getColor("oldred"), // Bright red when off
                                        true: Common.getColor("green")   // Material green when on
                                    }}
                                    thumbColor={theTask.donestatus == 1 ? Common.getColor("darkgreen") : 'grey'} // White thumb always
                                    ios_backgroundColor={Common.getColor("oldred")} // iOS background when off
                                />



                            </View>

                            <View style={styles.row}>
                                <Text style={styles.largeText}>Priority          </Text>
                                <View style={styles.verticallyCentered}>
                                    <View style={[
                                        styles.pickerWrapper,
                                        { backgroundColor: theTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                                    ]}>
                                        {renderPriorityPicker()}

                                        {/* <Picker
                                            selectedValue={theTask.priority}
                                            style={styles.picker}
                                            onValueChange={(itemValue) => setTheTask({ ...theTask, priority: itemValue })}>
                                            <Picker.Item label="P0" value={0} />
                                            <Picker.Item label="P1" value={1} />
                                            <Picker.Item label="P2" value={2} />
                                        </Picker> */}
                                    </View>

                                </View>

                            </View>
                            <View style={styles.row}>
                                <Text style={styles.largeText}>Start</Text>
                                <TouchableOpacity style={styles.buttonStart} onPress={() => showStartDatePicker()} onLongPress={() => showStartTimePicker()} >
                                    <Icon name="today" size={20} color="black" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonTextBlack}>{Common.formatToLocalDateString_inputIsDataObj(theTask.startdatetime)}</Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={showStartPicker}
                                    mode="date"
                                    date={theTask.startdatetime}
                                    onConfirm={handleConfirmStartPicker}
                                    onCancel={hideStartDatePicker}
                                />
                                <DateTimePickerModal
                                    isVisible={showStartPicker_time}
                                    mode="time"
                                    date={theTask.startdatetime}
                                    onConfirm={handleConfirmStartPicker_time}
                                    onCancel={hideStartTimePicker}
                                />

                            </View>

                            <View style={styles.row}>
                                <Text style={styles.largeText}>Finish</Text>
                                <TouchableOpacity style={styles.buttonEnd} onPress={() => showEndDatePicker()} onLongPress={() => showEndTimePicker()}>
                                    <Icon name="event" size={20} color="black" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonTextBlack}>{Common.formatToLocalDateString_inputIsDataObj(theTask.enddatetime)}</Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={showEndPicker}
                                    mode="date"
                                    date={theTask.enddatetime}
                                    onConfirm={handleConfirmEndPicker}
                                    onCancel={hideEndDatePicker}
                                />

                                <DateTimePickerModal
                                    isVisible={showEndPicker_time}
                                    mode="time"
                                    date={theTask.enddatetime}
                                    onConfirm={handleConfirmEndPicker_time}
                                    onCancel={hideEndTimePicker}
                                />

                            </View>
                            <TextInput
                                style={styles.input}
                                value={theTask.remarks}
                                onChangeText={(text) => setTheTask({ ...theTask, remarks: text })}
                                placeholder="additional remarks..."
                            />

                            <View style={styles.row}>
                                <TouchableOpacity style={styles.editButton} onPress={() => handleSave()}>
                                    <Icon name="add" size={20} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>  Add  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.editButton} onPress={() => handleCancel()}>
                                    <Icon name="cancel" size={20} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>  Cancel  </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                        {message_s !== '' && (
                            <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
                        )}

                    </View>
                    <View style={styles.bottomSection}>
                        <View style={styles.containerFlatList}>

                            {relationList && relationList.length > 0 && (
                                <>
                                    <Text style={styles.message}>You can add for ...</Text>
                                    <FlatList
                                        data={relationList}
                                        keyExtractor={(item) => item.Userrelation.uniqueidentifyer}
                                        renderItem={renderItem}
                                    />
                                </>
                            )}
                            {relationList && relationList.length == 0 && (
                                <>
                                    <Text style={styles.smallText}>Add relations of your friends/ family so that  you can add tasks for them. Click on UserRelation icon below !</Text>
                                </>
                            )}
                        </View>


                    </View>
                </View>

            </LinearGradient>


        </View>







    )
}

export default AddTask;
const styles = StyleSheet.create({

    pickerButton: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 20,
        height: 44,
        width: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
    },

    pickerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // Add horizontal padding
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        maxWidth: 300, // Add max width
        alignSelf: 'center', // Ensure self-centering
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },

    modalOption: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#E8F5E8',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },

    modalOptionText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        color: '#333',
    },
    modalCancel: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },

    // above styles are for the modal

    containerWBorder: {
        flex: 1,
        justifyContent: 'top',
        padding: 2,
        //backgroundColor: '#fff',
        width: '100%',
        marginVertical: 1,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20,         // Optional: rounded corners
    },
    largeText: {
        textAlign: 'center',
        fontSize: 16,
    },

    containerFlatList: {
        flex: 1,
        justifyContent: 'top',
        padding: 2,
        //backgroundColor: '#fff',
        width: '100%', // Ensure full width
        marginVertical: 1
    },

    container: {
        flex: 1,
        justifyContent: 'top',
        padding: 0,
        //backgroundColor: '#fff',
        width: '100%',
        marginVertical: 0
    },
    largeText: {
        textAlign: 'center',
        fontSize: 16,
    },

    smallText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
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
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 20,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    picker: {
        height: 58,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 8,
        paddingHorizontal: 5,
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    verticallyCentered: {
        justifyContent: 'center',
        alignItems: 'center', //

    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 20,
        overflow: 'hidden', // Prevents Picker from spilling out
        height: 44, // Ensures consistent height
        // flex: .25, // Take available space in the row
        backgroundColor: '#f0f0f0',
        //justifyContent: 'center', // Centers vertically
        //alignItems: 'center', //
        width: '150',
        fontSize: 14,
        fontWeight: '600',
    },
    button_datetime: {
        backgroundColor: 'blue',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonStart: {
        backgroundColor: '#E8F5E8',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',

    },

    buttonEnd: {
        backgroundColor: '#FDECEA',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',

    },

    editButton: {
        backgroundColor: Common.getColor("blueblue"),
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',

    },

    buttonTextBlack: {
        color: 'black', // Black text
        fontSize: 14,
        fontWeight: '600',
    },

    buttonText: {
        color: '#fff', // White text
        fontSize: 14,
        fontWeight: '600',
    },

    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    switch: { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], },
    middleSection: {
        flex: 6, // 80%
        //backgroundColor: '#d1ecf1',
        justifyContent: 'center',
        alignItems: 'center',
        //borderWidth: 1,          // Thickness of the border
        //borderColor: 'black',    // Border color
        //borderRadius: 5,         // Optional: rounded corners
        padding: 2,             // Optional: space inside the border
        margin: 2,              // Optional: space outside the border
    },
    bottomSection: {
        flex: 4, // 10%
        //backgroundColor: 'white',
        //borderWidth: 1,          // Thickness of the border
        //borderColor: 'black',    // Border color
        //borderRadius: 5,         // Optional: rounded corners
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    selectedItem: {
        backgroundColor: 'lightgreen',
    },

    flatListStyle: {
        width: '100%', // Take full width
        flex: 1, // Take available vertical space
    },
    flatListContent: {
        width: '100%', // Ensure content takes full width
        paddingHorizontal: 0, // Remove any horizontal padding
    },
    item: {
        width: '100%', // Full width
        padding: 10,
        backgroundColor: '#f0f0f0',
        marginVertical: 2,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        textAlign: 'center', // Center the text
    },
    itemContainer: {
        width: '100%',
        padding: 12,
        backgroundColor: '#f0f0f0',
        marginVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },

});