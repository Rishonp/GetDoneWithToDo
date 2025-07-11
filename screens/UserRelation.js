import { useContext, useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Users from "../utils/Users";
import Token, { UserNToken } from "../utils/Token";
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';

const UserRelation = () => {
    const { setToken } = useContext(AuthContext);
    const { setCurrentUsrToken } = useContext(AuthContext);
    const { token } = useContext(AuthContext);
    const [message_s, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserid, setSelectedUserid] = useState('');
    const [relationuserid_s, setrelationuserid_s] = useState('');
    const [mode, setmode] = useState('set');

}



