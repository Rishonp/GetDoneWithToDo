import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Users from "../utils/Users";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { MainTasks } from '../utils/Users';
import * as Common from "../utils/Common"
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

//import CreateTaskScreen from './CreateTaskScreen';
//import ModifyTaskScreen from './ModifyTaskScreen';
//import UserSettingsScreen from './UserSettingsScreen';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentUsrToken } = useContext(AuthContext);
  const { currentUsrToken } = useContext(AuthContext);

  const navigateToModifyTaskScreen = (item) => {
    //console.log(item)
    const mainTaskType = MainTasks.fromDict(item)
    //console.log(mainTaskType)
    //const mainTaskType = MainTasks(userid = item.userid, tasktext = item.tasktext, addtocal = item.addtocal, priority = item.priority, startdatetime = item.startdatetime, enddatetime = item.enddatetime, donestatus = item.donestatus, remarks = item.remarks, addedby_userid = item.addedby_userid, addedby_datetime = item.addedby_datetime, uniqueidentifyer = item.uniqueidentifyer, taskack = item.taskack, taskack_datetime = item.taskack_datetime)
    //const mainTaskType = new MainTasks(item.userid, item.tasktext, item.addtocal, item.priority, item.startdatetime, item.enddatetime, item.donestatus, item.remarks, item.addedby_userid, item.addedby_datetime, item.uniqueidentifyer, item.taskack, item.taskack_datetime)
    const mainTaskStrinifyed = mainTaskType.toStringDict()
    //console.log(mainTaskStrinifyed)
    navigation.navigate('ModifyTaskScreen', { 'taskStringifyed': mainTaskStrinifyed })
  }

  const handleTaskDone = async (taskItem) => {
    // Section 1 to update the screen 
    console.log(" handleTaskDone called ", taskItem.uniqueidentifyer)
    const updatedTasks = tasks.filter(
      (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
    );
    setTasks(updatedTasks);
    // Section 2 to update the database in backend
    //console.log("received task item is ", taskItem)
    const mainTask = MainTasks.fromDict(taskItem) // rishon start here
    //console.log("mainTask is ", mainTask)
    const mainTaskDict = mainTask.toDict()
    //console.log("mainTaskDict  is ", mainTaskDict)
    const payload = Common.getpayLoadFromMainTask(mainTask) 
    console.log("payload  is ", payload)
    try {

      const response = await axios.post("http://192.168.0.113:8000/markATaskAsDone/", payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      //const response = await axios.post('http://192.168.0.113:8000/markATaskAsDone/', { params: mainTaskDict });
      //console.log("got resposne ", response)
      Toast.show({
        type: 'info',     // ✅ Valid type
        text1: 'Hurray !! You did it',
        text2: 'Task marked as done 🎉',
        position: 'top'
      });
    } catch (error) {
      console.error('Error markign tas kas done ', error);
    }



  }


  const handleSaveTaskDone = async (taskItem) => {
    // Section 1 to update the screen 
    console.log(" handleSaveTaskDone called ", taskItem.uniqueidentifyer)
    const updatedTasks = tasks.filter(
      (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
    );
    setTasks(updatedTasks);
    // Section 2 to update the database in backend
    const mainTask = MainTasks.fromDict(taskItem) // rishon start here
    const mainTaskDict = mainTask.toDict()
    const payload = Common.getpayLoadFromMainTask(mainTask) 
    console.log("payload  is ", payload)
    try {
      const response = await axios.post("http://192.168.0.113:8000/markTaskAsDone/", payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      Toast.show({
        type: 'info',
        text1: 'Task Saved as Done',
        text2: 'Task marked as done and saved 🎉',
        position: 'top'
      });
    } catch (error) {
      console.error('Error saving task as done ', error);
    }
  }

  const getTasks = async () => {
    try {
      console.log("Get tasks from Home screen called ")
      console.log("current token is ", currentUsrToken)
      if (currentUsrToken === null) {
        // this is an unlikely condition
        console.log("Logged in USER NOT FOUNT !!!1")
        setTasks([]);
        return
      }
      const apiString = currentUsrToken.user.userid + "||||" + Common.getCurentDateAsStringYYMMDDHHMMSS_Plus_2_Months()
      console.log("apiString is .............................", apiString)
      const response = await axios.get('http://192.168.0.113:8000/getalltasksforuser/', { params: { inputData: apiString } });
      if (response !== null && response.data !== null) {
        //console.log(response.data)
        //console.log(response.data.length)
        //console.log(response.data[0])
        taskInstances = response.data.map(item => MainTasks.fromDict(item));
        console.log("Good till here ......")
        setTasks(taskInstances);
        console.log("TaskInstance set to state ")
      } else {
        console.log("We have a problem OR response is empty")
        taskInstances = [];
        setTasks(taskInstances);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // this function makes the task Red if starte date is of past  OR end date is in next 5 days
  const shouldBeRed = (item) => {
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    const start = new Date(item.startdatetime);
    const end = new Date(item.enddatetime);
    const isStartPast = start < today;
    const isEndNear = end <= fiveDaysFromNow;
    const shouldBeRed = isStartPast || isEndNear;
    return shouldBeRed
  }


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={[styles.titleBorder, shouldBeRed(item) && styles.titleBorderRed]}>{item.tasktext}</Text>
      <Text style={styles.date}>Start: {item.startdatetime?.toLocaleString()}</Text>
      <Text style={styles.date}>End: {item.enddatetime?.toLocaleString()}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.doneButton} onPress={() => handleTaskDone(item)}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.uniqueidentifyer}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}




const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  doneButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25, // Rounded corners
    alignSelf: 'flex-start',
  },
  editButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25, // Rounded corners
    alignSelf: 'flex-start',
  },

  buttonText: {
    color: 'white', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  titleBorder: {
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "black",
    fontWeight: 'bold'
  },
  titleBorderRed: {
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "black",
    fontWeight: 'bold',
    backgroundColor: '#ffe5e5', // Very light red
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'

  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});