// contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import * as Common from "../utils/Common"
import { BASE_URL } from '../utils/config';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUsrToken, setCurrentUsrToken] = useState(null);

    const refreshToken = async (oldToken) => {
        if (oldToken === None || oldToken === null || oldToken === '') {
            console.log('No old token provided');
            return null;
        }
        try {
            myToken = new Token(access_token = oldToken, token_type = 'Bearer', tokenCreateDateTime, username = 'DefaultUser');
            const response = await axios.get(`${BASE_URL}/refreshToken/`, { params: { username: "zoe" } });
            return response.data.access_token;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const loadToken = async () => {
            //console.log("AuthProvider Use effect is working")
            //await Common.deleteUserTokenInMobile();
            //console.log("lINE AFTER DELETE ")
            try {
                const storedToken = await Common.retrieveUserTokenInMobile()
                if (storedToken !== null) {
                    setToken(storedToken.token.access_token)
                    setCurrentUsrToken(storedToken)
                    //console.log("storedToken Is", storedToken.token.access_token)
                    //console.log("also storedTokenIs", storedToken)
                } else {
                    console.log("Setting token as null")
                    setToken(null)
                    setCurrentUsrToken(null)
                }
            } catch (error) {
                console.log(" From AuthProvider loadTokenerrorrrrrr", error)
            }
            setLoading(false);
        };
        loadToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken, loading, currentUsrToken, setCurrentUsrToken }}>
            {children}
        </AuthContext.Provider>
    );
};
