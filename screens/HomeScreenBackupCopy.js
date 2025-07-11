import React, { useState, useEffect, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Users from './utils/Users';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'react-native';

import CreateTaskScreen from './CreateTaskScreen';
import ModifyTaskScreen from './ModifyTaskScreen';
import UserSettingsScreen from './UserSettingsScreen';


const Tab = createBottomTabNavigator();



const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    console.log("useeffect of Home scrfee called ")
    axios
      .get(`http://<YOUR_IP>:8000/tasks?token=${token}`)
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const renderItem = ({ item }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.taskName}</Text>
      <Text>{item.startDate} → {item.endDate}</Text>
    </View>
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.taskID.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.taskList}
      ListEmptyComponent={<Text>No tasks available.</Text>}
    />
  );
};




const HomeScreen1 = () => {
  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <TaskList />
      </View>

      <View style={styles.tabContainer}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: () => {
              let icon;
              if (route.name === 'CreateTask')
                icon = require('../assets/createTaskIcon.png');
              else if (route.name === 'ModifyTask')
                icon = require('../assets/createTaskIcon.png');
              else if (route.name === 'UserSettings')
                icon = require('../assets/createTaskIcon.png');
              return <Image source={icon} style={styles.icon} />;
            },
            tabBarShowLabel: true,
          })}
        >
          <Tab.Screen name="CreateTask" component={CreateTaskScreen} />
          <Tab.Screen name="ModifyTask" component={ModifyTaskScreen} />
          <Tab.Screen name="UserSettings" component={UserSettingsScreen} />
        </Tab.Navigator>
      </View>
    </View>
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
  }
});