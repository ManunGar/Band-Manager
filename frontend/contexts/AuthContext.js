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
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const login = async (userData) => {
        try {
            setIsLoading(true);
            const loggedInUser = await AuthEndpoints.loginMusician(userData);
            axios.defaults.headers.common = {
                Authorization: `Bearer ${loggedInUser.user.token}`,
            };
            setUser(loggedInUser.user);
            AsyncStorage.setItem('userToken', JSON.stringify(loggedInUser.user.token))
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            throw error
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true); setLoadingText('Creando un Nuevo Músico');
            const loggedInUser = await AuthEndpoints.registerMusician(userData);
            axios.defaults.headers.common = {
                Authorization: `Bearer ${loggedInUser.user.token}`,
            };
            setUser(loggedInUser.user);
            AsyncStorage.setItem('userToken', JSON.stringify(loggedInUser.user.token))
            setTimeout(() => {
                setIsLoading(false);
                setLoadingText('');
            }, 2000);
        } catch (error) {
            throw error
        }
    };

    const logout = () => {
        setIsLoading(true);
        setUser(null)
        AsyncStorage.removeItem('userToken')
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const editProfilePicture = async (pictureData) => {
        try {
            const updatedUser = await AuthEndpoints.editProfilePicture(pictureData);
            setUser(updatedUser.user);
        } catch (error) {
            throw error
        }
    };

    const editMusician = async (musicianData) => {
        try {
            const updatedUser = await AuthEndpoints.editMusician(musicianData);
            setUser(updatedUser.user);
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
                axios.defaults.headers.common = { Authorization: `Bearer ${returnedUser.user.token}` }
                setUser(returnedUser.user)
            }
        } catch (error) {
            logout();
            throw error
        }
    }


    return (
        <AuthContext.Provider value={{ user, login, logout, register, getToken, editMusician, editProfilePicture, isLoading, loadingText }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };
export default AuthProvider

