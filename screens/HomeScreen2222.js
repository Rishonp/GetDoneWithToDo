import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Users from "../utils/Users";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { MainTasks } from '../utils/Users';

//import CreateTaskScreen from './CreateTaskScreen';
//import ModifyTaskScreen from './ModifyTaskScreen';
//import UserSettingsScreen from './UserSettingsScreen';






const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const { token } = useContext(AuthContext);


  // useEffect(() => {
  //   console.log("useeffect of Home scrfee called ")
  //   axios
  //     .get(`http://<YOUR_IP>:8000/tasks?token=${token}`)
  //     .then(res => setTasks(res.data))
  //     .catch(err => console.error(err));
  // }, [token]);



  //return (
  // <FlatList
  //   data={tasks}
  //   keyExtractor={(item) => item.taskID.toString()}
  //   renderItem={renderItem}
  //   contentContainerStyle={styles.taskList}
  //   ListEmptyComponent={<Text>No tasks available.</Text>}
  // />
  //);
};




const HomeScreen = () => {
  let taskInstances = [];
  useEffect(() => {
    const getTaskData = async () => {
      console.log("Inside Get task data....")
      try {
        const response = await axios.get('http://192.168.0.113:8000/getalltasksforuser/', { params: { inputData: '7820f61f-2aa6-4a2c-8293-d2ed645c2e2b||||2025-10-10 00:00:00' } });
        //console.log(response)
        if (response !== null && response.data !== null) {
          console.log(response.data)
          console.log(response.data.length)
          console.log(response.data[0])
          taskInstances = response.data.map(item => MainTasks.fromDict(item));
          console.log(taskInstances[0])
          setTasks(taskInstances);
        } else {
          console.log("We have a problem OR response is empty")
          taskInstances = [];
        }
      } catch (error) {
        console.log(" From getTaskData errorrrrrr", error)
      }
      setLoading(false);
    };
    getTaskData();
  }, []);


  return (
    <Text style={[styles.message, styles.messageSuccess]}>Hello Home screen</Text>
    // <View style={styles.container}>
    //   <View style={styles.listContainer}>
    //     <TaskList />
    //   </View>

    //   <View style={styles.tabContainer}>
    //     <Tab.Navigator
    //       screenOptions={({ route }) => ({
    //         headerShown: false,
    //         tabBarIcon: () => {
    //           let icon;
    //           if (route.name === 'CreateTask')
    //             icon = require('../assets/createTaskIcon.png');
    //           else if (route.name === 'ModifyTask')
    //             icon = require('../assets/createTaskIcon.png');
    //           else if (route.name === 'UserSettings')
    //             icon = require('../assets/createTaskIcon.png');
    //           return <Image source={icon} style={styles.icon} />;
    //         },
    //         tabBarShowLabel: true,
    //       })}
    //     >
    //       <Tab.Screen name="CreateTask" component={CreateTaskScreen} />
    //       <Tab.Screen name="ModifyTask" component={ModifyTaskScreen} />
    //       <Tab.Screen name="UserSettings" component={UserSettingsScreen} />
    //     </Tab.Navigator>
    //   </View>
    // </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContainer: {
    flex: 2,
    padding: 10
  },
  tabContainer: {
    flex: 1
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  taskList: {
    paddingBottom: 10
  },
  taskCard: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8
  },
  taskTitle: {
    fontWeight: 'bold'
  },

  messageSuccess: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  }

});