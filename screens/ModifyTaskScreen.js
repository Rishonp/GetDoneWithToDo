import React, { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch, StatusBar, Platform, Modal, ScrollView, FlatList } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import { MainTasks } from '../utils/Users';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard } from 'react-native';
import { BASE_URL } from '../utils/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { taskcal } from '../utils/Users';



export const removeEventIdFromDatabase = async (taskUniqueIdentifier, eventid) => {
    let tc = new taskcal("", eventid, taskUniqueIdentifier)
    const payload = Common.getpayload_taskcal(tc)
    try {
        const response = await axios.post(`${BASE_URL}/DeleteFromCalendar/`, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        //console.log("Response from DeleteFromCalendar API", response);
        if (response.status === 200) {
            return "Success - Task Removed From Calendar";
        } else {
            console.log('Error removing task ', response);
            return "Error - Failed to Remove Task";
        }
    } catch (error) {
        console.log('Error saving task as done ', error);
        return "Error - Failed to Remove Task" + (error?.message ? error.message : "");
    }

}



export const getEventIdFromDatabase = async (tuid) => {
    try {
        const response = await axios.get(`${BASE_URL}/CalanderEventIDExistsORNot/`, { params: { inputData: tuid } });
        return response?.data?.eventid || null; // Return eventid if exists, else null
    } catch (error) {
        console.log("Error in API CalanderEventIDExistsORNot", error);
        if (typeof error.response !== 'undefined') {
            if (error.response.data?.detail) {
                console.log("Error detail", error.response.data.detail);
                return null; // Return null on error
            } else {
                console.log("Error status", error.response.status);
                return null; // Return null on error
            }
        } else if (error.request) {
            console.log("No response from Server");
            return null; // Return null on no response
        } else {
            console.log("Error", error.message);
            return null; // Return null on other errors
        }
    }

}


const ModifyTaskScreen = ({ route, navigation }) => {
    const { taskStringifyed } = route.params;
    const [mymode, setMymode] = useState("Add"); // Default mode is Add other is "Mod"
    let local_task = new MainTasks()
    if (!taskStringifyed || taskStringifyed === '' || taskStringifyed === 'undefined' || taskStringifyed === 'null') {
    } else {
        local_task = MainTasks.fromStringDict(taskStringifyed)
    }

    const [original_MainTask, setOriginal_MainTask] = useState(local_task); // this is only to check if the user has changed anything before we save it 
    const [task_MainTask, setTask_MainTask] = useState(local_task);
    const { setToken } = useContext(AuthContext);
    const { setCurrentUsrToken } = useContext(AuthContext);
    const { currentUsrToken } = useContext(AuthContext);
    const { token } = useContext(AuthContext);
    const [message_s, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [donestatus_s, setdonestatus_s] = useState(false);
    const [addToCalendar, setAddToCalendar] = useState(task_MainTask.addtocal === 1);

    // DatePicker visibility
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showAddedByPicker, setShowAddedByPicker] = useState(false);

    const [showStartPicker_time, setShowStartPicker_time] = useState(false);
    const [showEndPicker_time, setShowEndPicker_time] = useState(false);

    const [showPriorityPicker, setShowPriorityPicker] = useState(false);


    const [relationList, setRelationList] = useState([]);
    const [selectedId, setSelectedId] = useState(null); // this is for the selected item in FlatList of relationships - this is the unique Identifier
    const [selectedId_relation, setSelectedId_relation] = useState(null); // this is for the selected item in FlatList of relationships - this is the relation ID
    const [is_addtocalSwitchEnabled, setIs_addtocalSwitchEnabled] = useState(false); // you can only add to cal if the task si for you and not for others



    const priorityOptions = [
        { label: 'P0', value: 0 },
        { label: 'P1', value: 1 },
        { label: 'P2', value: 2 }
    ];



    const handleAddingToCal = async (task, originalTask) => {
        console.log("handleAddingToCal called");
        // Section  1: check if add or modify or delete
        let mymode = null;
        let eventid = null;
        let response;
        //console.log("CalanderEventIDExistsORNot called iwth task uid : AAAAA", task.uniqueidentifyer);
        const tuid = task.uniqueidentifyer;
        eventid = await getEventIdFromDatabase(tuid);
        // easy condif : if not found in DB and also use has not clicked add to cal then no  further action required
        if ((eventid == null) && task.addtocal !== 1) {
            //console.log("No event found in DB and user wants to add to calendar");
            return;
        }
        if (eventid == null) {
            // add mode
            mymode = "add";
        } else {
            // modify mode
            mymode = "modify";
        }
        if (task.addtocal === 0 && mymode === "modify") {
            mymode = "delete";
        }
        // Section 2 get permissions and calendar ID
        const perm = await Common.requestPermission();
        if (!perm) {
            Alert.alert("Calendar permission Required", "Calendar permission is required to add events to your calendar",);
            return;
        }
        const calID = await Common.getDefaultCalendarId();
        if (!calID) {
            Alert.alert("No default calendar found", "Default calendar is required to add events to your calendar",);
            console.log("No default calendar found");
            return;
        }
        //sECTION 2.1 // Create calendar data
        const calendarData = {
            title: task.tasktext,
            location: "",
            start: task.startdatetime,
            end: task.enddatetime,
            description: task.remarks,
            priority: task.priority
        };

        console.log("FINAL MODE Is", mymode);
        switch (mymode) {
            case 'add': {
                let new_eventid = await Common.createEvent(calendarData.title, calendarData.location, calendarData.start, calendarData.end, calendarData.description, calendarData.priority);
                if (new_eventid !== null) {
                    await Common.storeEventIdInDatabase(new_eventid, task.uniqueidentifyer);
                } else {
                    Alert.alert("Error", "Failed to add event to calendar. Please try again later.");
                }
                break;
            }
            case 'modify': {
                await Common.deleteEvent(eventid);
                await removeEventIdFromDatabase(task.uniqueidentifyer, eventid);
                let new_eventid = await Common.createEvent(calendarData.title, calendarData.location, calendarData.start, calendarData.end, calendarData.description, calendarData.priority);
                if (new_eventid !== null) {
                    await Common.storeEventIdInDatabase(new_eventid, task.uniqueidentifyer);
                } else {
                    Alert.alert("Error", "Failed to add event to calendar. Please try again later.");
                }
                break;
            }
            case 'delete': {
                await Common.deleteEvent(eventid);
                await removeEventIdFromDatabase(task.uniqueidentifyer, eventid);
                break;
            }
        }
    };

    const isModified = (oT, mT) => {
        if (JSON.stringify(oT) === JSON.stringify(mT)) {
            //console.log("No changes detected");
            return false; // No changes detected
        } else {
            //console.log("Changes detected");
            return true; // Changes detected
        }
    }


    const showStartTimePicker = () => {
        setShowStartPicker_time(true);
    };

    const showEndTimePicker = () => {
        setTask_MainTask({ ...task_MainTask, enddatetime: task_MainTask.enddatetime || new Date() })
        setShowEndPicker_time(true);
    };


    const hideStartTimePicker = () => {
        setShowStartPicker_time(false);
    };

    const hideEndTimePicker = () => {
        setShowEndPicker_time(false);
    };


    const handleConfirmStartPicker_time = (selectedTime) => {
        //console.log("handleConfirmStartPicker_time called with selectedTime", selectedTime);
        //console.log("handleConfirmStartPicker_time called with startdatetime", task_MainTask.startdatetime);
        hideStartTimePicker();
        let msg = Common.validateStartDateAndEndDate(task_MainTask.startdatetime, Common.SlidedDateTime(task_MainTask.startdatetime, selectedTime));
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        let a = Common.SlidedDateTime(task_MainTask.startdatetime, selectedTime);
        setTask_MainTask({ ...task_MainTask, startdatetime: a });
    };


    const handleConfirmEndPicker_time = (selectedTime) => {
        hideEndTimePicker();
        let msg = Common.validateStartDateAndEndDate(task_MainTask.startdatetime, Common.SlidedDateTime(task_MainTask.enddatetime, selectedTime));
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        let a = Common.SlidedDateTime(task_MainTask.enddatetime, selectedTime);
        setTask_MainTask({ ...task_MainTask, enddatetime: a });
    };


    const handleConfirmEndPicker = (date) => {
        hideEndDatePicker();
        let actualPickedDate = Common.takeDateFromOneAndTimeFromOther(date, task_MainTask.enddatetime);
        let msg = Common.validateStartDateAndEndDate(task_MainTask.startdatetime, actualPickedDate);
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }
        setTask_MainTask({ ...task_MainTask, enddatetime: actualPickedDate });
    };


    const handleConfirmStartPicker = (date) => {
        hideStartDatePicker();
        console.log("handleConfirmStartPicker called with date", date);
        console.log("handleConfirmStartPicker called with startdatetime", task_MainTask.startdatetime);
        let actualPickedDate = Common.takeDateFromOneAndTimeFromOther_V2(date, task_MainTask.startdatetime);
        console.log("actualPickedDate", actualPickedDate);
        let msg = Common.validateStartDateAndEndDate(actualPickedDate, task_MainTask.enddatetime);
        if (msg.length > 0) {
            Alert.alert("Error", msg);
            return;
        }

        console.log("setting start time with ", actualPickedDate);
        setTask_MainTask({ ...task_MainTask, startdatetime: actualPickedDate });
    };


    const onChangeDateTimePicker = (event, selectedDate) => {
        console.log("onChangeDateTimePicker called with event", event.type, "and selectedDate", selectedDate);
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
            //Keyboard.dismiss(); // Dismiss the keyboard on Android
        }

        // Only hide the picker on Android manually
        console.log("NEXT LINE ", event, "and selectedDate", selectedDate);
        // Only set if action is not dismissed
        if (event.type === "set" && selectedDate !== null) {
            console.log("event type is set and selectedDate is", selectedDate);
            //setShowStartPicker(false);
            if (selectedDate) {
                console.log("Setting startdatetime to", selectedDate);
                // Ensure selectedDate is a Date object
                if (!(selectedDate instanceof Date)) {
                    selectedDate = new Date(selectedDate);
                }
                setTask_MainTask({ ...task_MainTask, startdatetime: selectedDate });
            }

        }
        else if (event.type === "dismissed") {
            console.log("DateTimePicker dismissed");
            /////setShowStartPicker(false);
        }
        else {
            console.log("Unexpected event type", event.type);
        }

    };



    const showEndDatePicker = () => {
        setTask_MainTask({ ...task_MainTask, enddatetime: task_MainTask.enddatetime || new Date() })
        setShowEndPicker(true);
    };
    const hideEndDatePicker = () => {
        setShowEndPicker(false);
    };



    const showStartDatePicker = () => {
        setTask_MainTask({ ...task_MainTask, startdatetime: task_MainTask.startdatetime || new Date() })
        setShowStartPicker(true);
    };
    const hideStartDatePicker = () => {
        setShowStartPicker(false);
    };



    const handleNotification_Local = async (taskItem) => {
        //console.log("handleNotification_Local called with taskItem", taskItem);
        console.log("handleNotification_Local called with currentUsrToken.user", currentUsrToken.user);
        let resp = await Common.handleNotification(taskItem, taskItem.userid, currentUsrToken.user.userid, currentUsrToken.user.username, 'HomeScreen')
        if (resp.includes("Error")) {
            Toast.show({
                type: 'error',
                text1: 'Notification Error',
                text2: 'Failed to send notification. Please try again later. ' + resp,
            });
        } else {
            Toast.show({
                type: 'success',
                text1: 'Notification Sent',
                text2: 'User has been notified successfully.',
            });
        }

    };



    const renderPriorityPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={[
                            styles.pickerButton,
                            { backgroundColor: task_MainTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                        ]}
                        onPress={() => setShowPriorityPicker(true)}
                    >
                        <Text style={styles.pickerButtonText}>
                            P{task_MainTask.priority}
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
                                            task_MainTask.priority === option.value && styles.selectedOption
                                        ]}
                                        onPress={() => {
                                            setTask_MainTask({ ...task_MainTask, priority: option.value });
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
                    { backgroundColor: task_MainTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                ]}>
                    <Picker
                        selectedValue={task_MainTask.priority}
                        style={styles.picker}
                        onValueChange={(itemValue) => setTask_MainTask({ ...task_MainTask, priority: itemValue })}
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
        // Check if the user has modified the task
        //console.log("Original Task:", original_MainTask.tasktext);
        //console.log("Modified Task:", task_MainTask.tasktext);


        // if (isModified(original_MainTask, task_MainTask) === false) {
        //     Alert.alert("No changes made", "You have not made any changes to the task.");
        //     return; // Return early if no changes
        // }

        console.log("selectedId_relation", selectedId_relation);
        console.log("currentUsrToken.user.userid", currentUsrToken.user.userid);
        if (selectedId_relation === null || selectedId_relation === undefined || selectedId_relation === '') {
            console.log("Part 1");
            task_MainTask.userid = currentUsrToken.user.userid; // if no relation selected then add task for yourself
            task_MainTask.addedby_userid = "";
            task_MainTask.addedby_datetime = new Date();
        } else {
            console.log("Part 2");
            task_MainTask.userid = selectedId_relation; // if relation selected then add task for relation
            task_MainTask.addedby_userid = currentUsrToken.user.userid;
            task_MainTask.addedby_datetime = new Date();

            //setTask_MainTask({ ...task_MainTask, userid: selectedId_relation });
            //setTask_MainTask({ ...task_MainTask, addedby_userid: currentUsrToken.user.userid });
            //setTask_MainTask({ ...task_MainTask, addedby_datetime: new Date() });
        }
        //setTask_MainTask({ ...task_MainTask, donestatus_datetime: new Date() }); // just store some date time
        task_MainTask.donestatus_datetime = new Date(); // just store some date time
        console.log("Main task ", task_MainTask);
        const payload = Common.getpayLoadFromMainTask111(task_MainTask);
        //console.log("Payload for UpdateTask API", payload);
        try {
            const response = await axios.post(`${BASE_URL}/UpdateTask/`, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                // Call handleAddingToCal ONLY if the API call succeeds

                await handleAddingToCal(task_MainTask, original_MainTask);

                // Notification logic
                if (task_MainTask.addedby !== '') {
                    Alert.alert("Task Updated", "Task has been updated successfully.");
                }

                let send_to_userId = "";
                //console.log("Logged in ", currentUsrToken.user.userid);
                //console.log("main task", task_MainTask);

                if (currentUsrToken.user.userid === task_MainTask.userid) {
                    send_to_userId = task_MainTask.addedby_userid;
                } else if (currentUsrToken.user.userid === task_MainTask.addedby_userid) {
                    send_to_userId = task_MainTask.userid;
                }

                //console.log("send_to_userId Final ", send_to_userId);
                if (send_to_userId !== "") {
                    Common.handleNotification(task_MainTask, send_to_userId, task_MainTask.userid, currentUsrToken.user.username, 'ModifyTaskScreen');
                }

                navigation.goBack();
            }
        } catch (error) {
            if (typeof error.response !== 'undefined') {
                if (error.response.data?.detail) {
                    setMessage(error.response.data.detail);
                } else {
                    setMessage("Error -" + error.response.status);
                }
            } else if (error.request) {
                setMessage("Error - No response from Server");
            } else {
                setMessage("Error - " + error.message);
            }

            setMessage("Error - " + error.message);
        }
    };
    // Save logic here (API call or state update)
    // After saving, go back

    //console.log("Saving task:", task_MainTask);
    //navigation.navigate('HomeScreen');



    const handleCancel = () => {
        //navigation.navigate('HomeScreen')
        navigation.goBack()
    };


    const handleTaskAck = (value) => {
        if (value === true)
            setTask_MainTask({ ...task_MainTask, taskack: 1 });
        if (value === false)
            setTask_MainTask({ ...task_MainTask, taskack: 0 });
    };
    const handleDoneStatus = (value) => {
        setdonestatus_s(value);
        if (value === true)
            setTask_MainTask({ ...task_MainTask, donestatus: 1 });
        if (value === false)
            setTask_MainTask({ ...task_MainTask, donestatus: 0 });
    };


    const submit = () => {
        axios
            .post(
                `http://<YOUR_IP>:8000/tasks?token=${token}`,
                { taskID: parseInt(taskID), taskName: name, startDate: new Date(sd), endDate: new Date(ed) }
            )
            .then(() => navigation.navigate('HomeScreen'))
            .catch(() => Alert.alert('Error posting task'));
    };

    const onFormLoadFunction = () => {
        if (route.params?.taskStringifyed) { // this if is necessary when user visits  modif then home then again modi screen .. to refres hte task selected 
            const { taskStringifyed } = route.params;
            let local_task = new MainTasks()
            local_task = MainTasks.fromStringDict(taskStringifyed)
            //convert all dates to UTC
            local_task.startdatetime = Common.serverDatetoUTCDate(local_task.startdatetime);
            local_task.enddatetime = Common.serverDatetoUTCDate(local_task.enddatetime);
            local_task.addedby_datetime = Common.serverDatetoUTCDate(local_task.addedby_datetime);
            local_task.donestatus_datetime = Common.serverDatetoUTCDate(local_task.donestatus_datetime);
            local_task.taskack_datetime = Common.serverDatetoUTCDate(local_task.taskack_datetime);
            setTask_MainTask(local_task);
            setOriginal_MainTask(local_task); // set the original task to the local task
        }
    }

    const OnPageLoad = async () => {
        setLoading(true);
        if (taskStringifyed === 'undefined' || taskStringifyed === 'null' || taskStringifyed === '') {
            setTask_MainTask({
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
        }
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

    useFocusEffect(
        React.useCallback(() => {
            OnPageLoad(); // is  for users relation fetch
            onFormLoadFunction(); // is is original Mod form load function
        }, [route.params?.taskStringifyed])
    );

    useEffect(() => {
        // console.log("=== DEBUGGING COMMON FUNCTIONS ===");
        //console.log("Available Common functions:", Object.keys(Common));
        //console.log("Looking for removeEventIdFromDatabase:", typeof Common.removeEventIdFromDatabase);
        //console.log("=== END DEBUG ===");
        OnPageLoad(); // is  for users relation fetch
        onFormLoadFunction() // is  original Mod form load function

    }, [route.params?.taskStringifyed]); /// Re-run when taskStringifyed changes, useful when i keep going back and fotth between home scree nand modify task screen


    const selectDeselectItem = (item) => {
        if (selectedId === item.Userrelation.uniqueidentifyer) {
            setSelectedId(null);
            setSelectedId_relation(null);
            // add to cal functionality is only avaialble if oyu are adding task  for yourself .
            setTask_MainTask({ ...task_MainTask, addtocal: task_MainTask.addtocal });
            setIs_addtocalSwitchEnabled(false);
            console.log("selectDeselectItem called , switch being enabled ", is_addtocalSwitchEnabled);
        } else {
            setSelectedId(item.Userrelation.uniqueidentifyer);
            setSelectedId_relation(item.Userrelation.relationuserid);
            // add to cal functionality is only avaialble if oyu are adding task  for yourself .
            setTask_MainTask({ ...task_MainTask, addtocal: 0 });
            setIs_addtocalSwitchEnabled(true);
            console.log("selectDeselectItem called , switch being disabled ", is_addtocalSwitchEnabled);

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

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0 }}>
            <LinearGradient
                colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >
                <View style={styles.container}>
                    <View style={styles.middleSection}>
                        <ScrollView
                            style={styles.scrollContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.container}>
                                {/* Error Message */}
                                {message_s !== '' && (
                                    <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
                                )}

                                {/* Task Acknowledged Row */}
                                <View style={[styles.row, { marginBottom: 20 }]}>
                                    <Text style={styles.largeText}>Task Acknowledged</Text>
                                    <Switch
                                        style={styles.switch}
                                        value={task_MainTask.taskack === 1 ? true : false}
                                        onValueChange={(value) => handleTaskAck(value)}
                                        trackColor={{
                                            false: '#FDECEA',
                                            true: Common.getColor("green")
                                        }}
                                        thumbColor={task_MainTask.taskack === 1 ? Common.getColor("darkgreen") : 'grey'}
                                        ios_backgroundColor="#FDECEA"
                                    />
                                </View>

                                {/* Task Text Input */}
                                <TextInput
                                    style={styles.inputMainTaskText}
                                    value={task_MainTask.tasktext}
                                    onChangeText={(text) => setTask_MainTask({ ...task_MainTask, tasktext: text })}
                                    placeholder="Task Text"
                                    multiline={true}
                                    numberOfLines={6}
                                    scrollEnabled={true}
                                />

                                {/* Priority Row */}
                                <View style={[styles.row, { marginBottom: 20 }]}>
                                    <Text style={styles.largeText}>Priority</Text>
                                    <View style={styles.verticallyCentered}>
                                        <View style={[
                                            styles.pickerWrapper,
                                            { backgroundColor: task_MainTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                                        ]}>
                                            {renderPriorityPicker()}
                                        </View>
                                    </View>
                                </View>

                                {/* Done Status Row */}
                                <View style={[styles.row, { marginBottom: 20 }]}>
                                    <Text style={styles.largeText}>Done?</Text>
                                    <Switch
                                        style={styles.switch}
                                        value={donestatus_s}
                                        onValueChange={(value) => handleDoneStatus(value)}
                                        trackColor={{
                                            false: '#FDECEA',
                                            true: Common.getColor("green")
                                        }}
                                        thumbColor={donestatus_s ? Common.getColor("darkgreen") : 'grey'}
                                        ios_backgroundColor="#FDECEA"
                                    />
                                </View>

                                {/* Add to Calendar Row */}
                                <View style={[styles.row, { marginBottom: 20 }]}>
                                    <Text style={styles.largeText}>Add to Calendar?</Text>
                                    <Switch
                                        style={styles.switch}
                                        value={addToCalendar}
                                        onValueChange={(value) => {
                                            setAddToCalendar(value);
                                            setTask_MainTask({ ...task_MainTask, addtocal: value ? 1 : 0 });
                                        }}
                                        trackColor={{
                                            false: '#FDECEA',
                                            true: Common.getColor("green")
                                        }}
                                        thumbColor={addToCalendar ? Common.getColor("darkgreen") : 'grey'}
                                        ios_backgroundColor="#FDECEA"
                                    />
                                </View>

                                {/* Start Date Row */}
                                <View style={styles.row}>
                                    <Text style={styles.largeText}>Start Date</Text>
                                    <TouchableOpacity
                                        style={styles.buttonStart}
                                        onPress={() => showStartDatePicker()}
                                        onLongPress={() => showStartTimePicker()}
                                    >
                                        <Icon name="today" size={20} color="black" style={{ marginRight: 6 }} />
                                        <Text style={styles.buttonTextBlack}>{Common.formatToLocalDateString_inputIsDataObj(task_MainTask.startdatetime)}</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Start Date Pickers */}
                                <DateTimePickerModal
                                    isVisible={showStartPicker}
                                    mode="date"
                                    date={task_MainTask.startdatetime}
                                    onConfirm={handleConfirmStartPicker}
                                    onCancel={hideStartDatePicker}
                                />

                                <DateTimePickerModal
                                    isVisible={showStartPicker_time}
                                    mode="time"
                                    date={task_MainTask.startdatetime}
                                    onConfirm={handleConfirmStartPicker_time}
                                    onCancel={hideStartTimePicker}
                                />

                                {/* End Date Row */}
                                <View style={styles.row}>
                                    <Text style={styles.largeText}>End Date</Text>
                                    <TouchableOpacity
                                        style={styles.buttonEnd}
                                        onPress={() => showEndDatePicker()}
                                        onLongPress={() => showEndTimePicker()}
                                    >
                                        <Icon name="event" size={20} color="black" style={{ marginRight: 6 }} />
                                        <Text style={styles.buttonTextBlack}>{Common.formatToLocalDateString_inputIsDataObj(task_MainTask.enddatetime)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* End Date Pickers */}
                                <DateTimePickerModal
                                    isVisible={showEndPicker}
                                    mode="date"
                                    date={task_MainTask.enddatetime}
                                    onConfirm={handleConfirmEndPicker}
                                    onCancel={hideEndDatePicker}
                                />

                                <DateTimePickerModal
                                    isVisible={showEndPicker_time}
                                    mode="time"
                                    date={task_MainTask.enddatetime}
                                    onConfirm={handleConfirmEndPicker_time}
                                    onCancel={hideEndTimePicker}
                                />

                                {/* Remarks Input */}
                                <TextInput
                                    style={styles.input}
                                    value={task_MainTask.remarks}
                                    onChangeText={(text) => setTask_MainTask({ ...task_MainTask, remarks: text })}
                                    placeholder="Task Remarks"
                                />

                                {/* Action Buttons Row */}
                                <View style={styles.row}>
                                    <TouchableOpacity style={styles.editButton} onPress={() => handleSave()}>
                                        <Icon name="edit" size={20} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.buttonText}>Save</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.editButton} onPress={() => handleCancel()}>
                                        <Icon name="cancel" size={20} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>

                        </ScrollView>
                    </View>
                    <View style={styles.bottomSection}>
                        <View style={styles.containerFlatList}>
                            {relationList && relationList.length == 0 && (
                                <>
                                    <Text style={styles.smallText}>Add relations of your friends/ family so that  you can add tasks for them. Click on UserRelation icon below !</Text>
                                </>
                            )}

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


                        </View>
                    </View>
                </View>


            </LinearGradient>
        </View>
    );
};
export default ModifyTaskScreen;
const styles = StyleSheet.create({
    selectedItem: {
        backgroundColor: 'lightgreen',
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
    middleSection: {
        flex: 7, // 80%
        //backgroundColor: '#d1ecf1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,          // Thickness of the border
        borderColor: 'black',    // Border color
        borderRadius: 5,         // Optional: rounded corners
        padding: 2,             // Optional: space inside the border
        margin: 2,              // Optional: space outside the border
    },
    bottomSection: {
        flex: 3, // 10%
        //backgroundColor: 'white',
        borderWidth: 1,          // Thickness of the border
        borderColor: 'black',    // Border color
        borderRadius: 5,         // Optional: rounded corners
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    containerFlatList: {
        flex: 1,
        justifyContent: 'top',
        padding: 2,
        //backgroundColor: '#fff',
        width: '100%', // Ensure full width
        marginVertical: 1
    },


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

    container: {
        flex: 1,
        justifyContent: 'top',
        padding: 10,
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

    inputMainTaskText: {
        height: 'auto', // Change from fixed height (58) to auto
        minHeight: 58, // Minimum height for single line
        maxHeight: 90, // Maximum height for 3 lines (approximately 30px per line)
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12, // Add vertical padding
        fontSize: 16,
        color: '#000',
        textAlignVertical: 'top', // Align text to top  
    },



    input: {
        height: 58,
        borderColor: 'black',
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
        backgroundColor: 'lightgray',
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
        minHeight: 50,

    },
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonTextBlack: {
        color: 'black', // Black text
        fontSize: 14,
        fontWeight: '600',
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    switch: { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], },
});