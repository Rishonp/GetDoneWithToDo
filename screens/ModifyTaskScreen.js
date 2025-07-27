import { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch, StatusBar, Platform } from 'react-native';
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
import { BASE_URL } from '../utils/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const ModifyTaskScreen = ({ route, navigation }) => {
    const { taskStringifyed } = route.params;
    let local_task = new MainTasks()
    local_task = MainTasks.fromStringDict(taskStringifyed)
    const [task_MainTask, setTask_MainTask] = useState(local_task);
    const { setToken } = useContext(AuthContext);
    const { setCurrentUsrToken } = useContext(AuthContext);
    const { token } = useContext(AuthContext);
    const [message_s, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    //const [theTask, setTheTask] = useState('');
    const [taskack_s, settaskack_s] = useState(false);
    const [donestatus_s, setdonestatus_s] = useState(false);

    // DatePicker visibility
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showAddedByPicker, setShowAddedByPicker] = useState(false);

    const [showStartPicker_time, setShowStartPicker_time] = useState(false);
    const [showEndPicker_time, setShowEndPicker_time] = useState(false);


    const showStartTimePicker = () => {
        //console.log("showStartTimePicker called");
        //console.log(task_MainTask.startdatetime);
        //console.log(Common.serverDatetoUTCDate(task_MainTask.startdatetime));
        //console.log(Common.serverDatetoUTCDate(task_MainTask.startdatetime).toLocaleString());
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

    const handleSave = async () => {
        const payload = Common.getpayLoadFromMainTask111(task_MainTask)
        try {
            const response = await axios.post(`${BASE_URL}/UpdateTask/`, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

        } catch (error) {
            console.error('Error saving task as done ', error);
        }
        // Save logic here (API call or state update)
        // After saving, go back

        //console.log("Saving task:", task_MainTask);
        //navigation.navigate('HomeScreen');
        navigation.goBack()
    };

    const handleCancel = () => {
        //navigation.navigate('HomeScreen')
        navigation.goBack()
    };


    // const handleSave = async () => {
    //    try{





    //    };

    const handleTaskAck = (value) => {
        settaskack_s(value);
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
        }
    }

    useEffect(() => {
        onFormLoadFunction()
    }, [route.params?.taskStringifyed]); /// Re-run when taskStringifyed changes, useful when i keep going back and fotth between home scree nand modify task screen



    return (

        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0 }}>

            <LinearGradient
                colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >
                <View style={styles.container}>
                    <View style={styles.row}>
                        <Text style={styles.largeText}>Task Acknowledged</Text>
                        <Switch
                            style={styles.switch}
                            value={taskack_s}
                            onValueChange={(value) => handleTaskAck(value)}
                            trackColor={{
                                false: '#FDECEA', // Bright red when off
                                true: Common.getColor("green")   // Material green when on
                            }}
                            thumbColor={taskack_s ? Common.getColor("darkgreen") : 'grey'} // White thumb always
                            ios_backgroundColor="#FDECEA" // iOS background when off
                        />

                    </View>
                    <TextInput
                        style={styles.inputMainTaskText}
                        value={task_MainTask.tasktext}
                        onChangeText={(text) => setTask_MainTask({ ...task_MainTask, tasktext: text })}
                        placeholder="Task Text"
                        multiline={true}
                        numberOfLines={6}
                        scrollEnabled={true}
                    />


                    {/* <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={task_MainTask.priority}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTask_MainTask({ ...task_MainTask, priority: itemValue })}>
                    <Picker.Item label="P0" value={0} />
                    <Picker.Item label="P1" value={1} />
                    <Picker.Item label="P2" value={2} />
                </Picker>
            </View> */}




                    <View style={styles.row}>
                        <Text style={styles.largeText}>Priority          </Text>
                        <View style={styles.verticallyCentered}>
                            <View style={[
                                styles.pickerWrapper,
                                { backgroundColor: task_MainTask.priority === 0 ? '#FDECEA' : '#E8F5E8' }
                            ]}>
                                <Picker
                                    selectedValue={task_MainTask.priority}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setTask_MainTask({ ...task_MainTask, priority: itemValue })}>
                                    <Picker.Item label="P0" value={0} />
                                    <Picker.Item label="P1" value={1} />
                                    <Picker.Item label="P2" value={2} />
                                </Picker>
                            </View>

                        </View>

                    </View>





                    <View style={styles.row}>
                        <Text style={styles.largeText}>Done?</Text>


                        <Switch
                            style={styles.switch}
                            value={donestatus_s}
                            onValueChange={(value) => handleDoneStatus(value)}
                            trackColor={{
                                false: '#FDECEA', // Bright red when off
                                true: Common.getColor("green")   // Material green when on
                            }}
                            thumbColor={donestatus_s ? Common.getColor("darkgreen") : 'grey'} // White thumb always
                            ios_backgroundColor="#FDECEA" // iOS background when off
                        />

                    </View>
                    <View style={styles.row}>
                        <Text style={styles.largeText}>Start Date</Text>
                        <TouchableOpacity style={styles.buttonStart} onPress={() => showStartDatePicker()} onLongPress={() => showStartTimePicker()}>
                            <Icon name="today" size={20} color="black" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonTextBlack}>{task_MainTask.startdatetime?.toLocaleString()}</Text>
                        </TouchableOpacity>

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


                    </View>


                    <View style={styles.row}>
                        <Text style={styles.largeText}>End Date</Text>
                        <TouchableOpacity style={styles.buttonEnd} onPress={() => showEndDatePicker()} onLongPress={() => showEndTimePicker()}>
                            <Icon name="event" size={20} color="black" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonTextBlack}>{task_MainTask.enddatetime?.toLocaleString()}</Text>
                        </TouchableOpacity>

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

                    </View>

                    <TextInput
                        style={styles.input}
                        value={task_MainTask.remarks}
                        onChangeText={(text) => setTask_MainTask({ ...task_MainTask, remarks: text })}
                        placeholder="Task Remarks"
                    />

                    <View style={styles.row}>

                        <TouchableOpacity style={styles.editButton} onPress={() => handleSave()}>
                            <Icon name="edit" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>  Save  </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleCancel()}>
                            <Icon name="cancel" size={20} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>  Cancel  </Text>
                        </TouchableOpacity>



                    </View>

                </View>



            </LinearGradient>


        </View>

    );



}

export default ModifyTaskScreen;
const styles = StyleSheet.create({
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
        backgroundColor: Common.getColor("darkgreen"),
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-start',
        flexDirection: 'row',
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