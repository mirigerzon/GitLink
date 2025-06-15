import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchData } from './fetchData.js';
import { CurrentUser } from '../../App';
import Cookies from 'js-cookie';

export const useAuth = () => {
    const { setCurrentUser } = useContext(CurrentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const fetchData = useFetchData();

    const login = async (credentials) => {
        setIsLoading(true);
        setMessage('');

        try {
            await fetchData({
                type: 'login',
                method: 'POST',
                body: credentials,
                onSuccess: (res) => {
                    if (res && res.token) {
                        Cookies.set('accessToken', res.token, {
                            expires: 1,
                            secure: true,
                            sameSite: 'Strict',
                        });

                        const enhancedUser = {
                            ...res.user,
                            initiatedAction: false,
                        };

                        localStorage.setItem('currentUser', JSON.stringify(res.user));
                        setCurrentUser(enhancedUser);
                        setMessage('Login successful! Redirecting...');
                        navigate(`/${credentials.username}/home`);
                    } else {
                        setMessage('Incorrect username or password');
                    }
                },
                onError: () => {
                    setMessage('Connection error. Please try again.');
                },
            });
        } catch (error) {
            setMessage('An error occurred. Please try again.', error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (formData) => {
        setIsLoading(true);
        setMessage('');

        try {
            await fetchData({
                type: 'register',
                method: 'POST',
                body: formData,
                onSuccess: ({ user, token }) => {
                    Cookies.set('accessToken', token, {
                        expires: 1,
                        secure: true,
                        sameSite: 'Strict',
                    });

                    const enhancedUser = {
                        ...user,
                        initiatedAction: false,
                    };

                    localStorage.setItem('currentUser', JSON.stringify(user));
                    setCurrentUser(enhancedUser);
                    setMessage('Registration successful! Redirecting...');
                    navigate(`/${user.git_name || user.username}/home`);
                },
                onError: (errorMessage) => {
                    setMessage('Registration failed. Please try again.');
                    console.error('Failed to register user:', errorMessage);
                },
            });
        } catch (error) {
            setMessage('Registration failed. Please try again.', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessage = () => setMessage('');

    return {
        login,
        register,
        isLoading,
        message,
        clearMessage,
    };
};