import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Users from '../utils/Users'; // Assuming Users is a utility file for user-related functions   

const UserSettingsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [taskID, setID] = useState('');
    const [name, setName] = useState('');
    const [sd, setSd] = useState('');
    const [ed, setEd] = useState('');


    const submit = () => {
        axios
            .post(
                `http://<YOUR_IP>:8000/tasks?token=${token}`,
                { taskID: parseInt(taskID), taskName: name, startDate: new Date(sd), endDate: new Date(ed) }
            )
            .then(() => navigation.navigate('Home'))
            .catch(() => Alert.alert('Error posting task'));
    };

    return (
        <View style={s.c}>
            {['ID', 'Name', 'StartDate YYYY-MM-DD', 'EndDate YYYY-MM-DD'].map((pl, i) => (
                <TextInput key={i} style={s.i} placeholder={pl} value={[taskID, name, sd, ed][i]} onChangeText={[setID, setName, setSd, setEd][i]} />
            ))}
            <Button title="Submit" onPress={submit} />
        </View>
    );



}

export default UserSettingsScreen;

const s = StyleSheet.create({
    c: { flex: 1, justifyContent: 'center', padding: 20 },
    i: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
});