import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useContext, useState } from "react";
import AuthEndpoints from '../api/AuthEndpoints.js';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = async (userData) => {
        try {
            const loggedInUser = await AuthEndpoints.loginMusician(userData);
            axios.defaults.headers.common = {
                Authorization: `Bearer ${loggedInUser.token}`,
            };
            setUser(loggedInUser);
            AsyncStorage.setItem('userToken', JSON.stringify(loggedInUser.token))

        } catch (error) {
            throw error
        }
    };

    const register = async (userData) => {
        try {
            const loggedInUser = await AuthEndpoints.registerMusician(userData);
            axios.defaults.headers.common = {
                Authorization: `Bearer ${loggedInUser.token}`,
            };
            setUser(loggedInUser);
            AsyncStorage.setItem('userToken', JSON.stringify(loggedInUser.token))
        } catch (error) {
            throw error
        }
    };

    const logout = () => {
        setUser(null)
        AsyncStorage.removeItem('userToken')
    };

    const editProfilePicture = async (pictureData) => {
        try {
            const updatedUser = await AuthEndpoints.editProfilePicture(pictureData);
            setUser(updatedUser);
        } catch (error) {
            throw error
        }
    };

    const editMusician = async (musicianData) => {
        try {
            const updatedUser = await AuthEndpoints.editMusician(musicianData);
            setUser(updatedUser);
        } catch (error) {
            throw error
        }
    };

    const getToken = async () => {
        let userToken
        try {
            userToken = await AsyncStorage.getItem('userToken')
            if (userToken) {
                userToken = JSON.parse(userToken)
                const returnedUser = await AuthEndpoints.isTokenValid({ token: userToken })
                axios.defaults.headers.common = { Authorization: `Bearer ${returnedUser.token}` }
                setUser(returnedUser)
            }
        } catch (error) {
            logout();
            throw error
        }
    }


    return (
        <AuthContext.Provider value={{ user, login, logout, register, getToken, editMusician, editProfilePicture }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };
export default AuthProvider

