import { useContext, useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
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
    const [theTask, setTheTask] = useState('');
    const [taskack_s, settaskack_s] = useState(false);
    const [donestatus_s, setdonestatus_s] = useState(false);

    // DatePicker visibility
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showAddedByPicker, setShowAddedByPicker] = useState(false);

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


    const handleConfirmEndPicker = (date) => {
        //not sure why date picker returns a date with one day more than selected. Hence the -1
        let tempdate = new Date(date);
        tempdate.setDate(tempdate.getDate() - 1);
        setTask_MainTask({ ...task_MainTask, enddatetime: tempdate });
        hideEndDatePicker();
    };

    const showEndDatePicker = () => {
        setTask_MainTask({ ...task_MainTask, enddatetime: task_MainTask.enddatetime || new Date() })
        setShowEndPicker(true);
    };
    const hideEndDatePicker = () => {
        setShowEndPicker(false);
    };


    const handleConfirmStartPicker = (date) => {
        //not sure why date picker returns a date with one day more than selected. Hence the -1
        //console.log("handleConfirmStartPicker called with date", date);
        let tempdate = new Date(date);
        tempdate.setDate(tempdate.getDate() - 1);
        //console.log("handleConfirmStartPicker called with date", tempdate);
        setTask_MainTask({ ...task_MainTask, startdatetime: tempdate });
        hideStartDatePicker();
    };

    const showStartDatePicker = () => {
        setTask_MainTask({ ...task_MainTask, startdatetime: task_MainTask.startdatetime || new Date() })
        setShowStartPicker(true);
    };
    const hideStartDatePicker = () => {
        setShowStartPicker(false);
    };

    const handleSave = async () => {
        const payload = Common.getpayLoadFromMainTask(task_MainTask)
        try {
      const response = await axios.post("http://192.168.0.113:8000/UpdateTask/", payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
    } catch (error) {
      console.error('Error saving task as done ', error);
    }
        // Save logic here (API call or state update)
        // After saving, go back
        //navigation.goBack();
        console.log("Saving task:", task_MainTask);

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

    const handleCancel = () => {
        navigation.goBack();
    };

    const submit = () => {
        axios
            .post(
                `http://<YOUR_IP>:8000/tasks?token=${token}`,
                { taskID: parseInt(taskID), taskName: name, startDate: new Date(sd), endDate: new Date(ed) }
            )
            .then(() => navigation.navigate('Home'))
            .catch(() => Alert.alert('Error posting task'));
    };

    const onFormLoadFunction = () => {
        //console.log("this is incomming task", taskStringifyed)
        //local_task = MainTasks.fromStringDict(taskStringifyed)
        //console.log("local_task", local_task.tasktext)
        //setTask_MainTask(local_task)
        console.log("this sdrfgsdfgsdfgsdfgsdfgi tas ktext ", task_MainTask.tasktext)
        //console.log("This is it !!!", local_task)
    }

    useEffect(() => {
        onFormLoadFunction()
        //ToDO call function to load user name of added by user 
    }, []);



    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.largeText}>Task Acknowledged</Text>
                <Switch style={styles.switch} value={taskack_s} onValueChange={(value) => handleTaskAck(value)} />
            </View>
            <TextInput
                style={styles.input}
                value={task_MainTask.tasktext}
                onChangeText={(text) => setTask_MainTask({ ...task_MainTask, tasktext: text })}
                placeholder="Task Text"
            />
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={task_MainTask.priority}
                    style={styles.picker}
                    onValueChange={(itemValue) => setTask_MainTask({ ...task_MainTask, priority: itemValue })}>
                    <Picker.Item label="P0" value={0} />
                    <Picker.Item label="P1" value={1} />
                    <Picker.Item label="P2" value={2} />
                </Picker>
            </View>
            <View style={styles.row}>
                <Text style={styles.largeText}>Done?</Text>
                <Switch style={styles.switch} value={donestatus_s} onValueChange={(value) => handleDoneStatus(value)} />
            </View>
            <View style={styles.row}>
                <Text style={styles.largeText}>Start Date</Text>
                <TouchableOpacity style={styles.button_datetime} onPress={() => showStartDatePicker()}>
                    <Text style={styles.buttonText}>{Common.convertDateToStringDDMMYYYYHHMMSS(task_MainTask.startdatetime)}</Text>
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
                    <Text style={styles.buttonText}>{Common.convertDateToStringDDMMYYYYHHMMSS(task_MainTask.enddatetime)}</Text>
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
                value={task_MainTask.remarks}
                onChangeText={(text) => setTask_MainTask({ ...task_MainTask, remarks: text })}
                placeholder="Task Remarks"
            />

            <View style={styles.row}>
                <Button title="    Save    " onPress={handleSave} />
                <Button title="   Cancel   " onPress={handleCancel} />
            </View>

        </View>
    );



}

export default ModifyTaskScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'top',
        padding: 24,
        backgroundColor: '#fff',
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
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    switch: { transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], },
});