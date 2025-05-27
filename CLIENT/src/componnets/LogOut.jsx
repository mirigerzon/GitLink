import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CurrentUser } from './App';
import { fetchData } from './fetchData';

export function useLogOut() {
    const { setCurrentUser } = useContext(CurrentUser);
    const navigate = useNavigate();
    const logOut = () => {
        fetchData({
            type: 'logout',
            method: 'POST',
            onSuccess: () => {
                Cookies.remove('accessToken');
                localStorage.removeItem("currentUser");
                setCurrentUser(null);
                navigate('/home');
            },
            onError: (err) => {
                console.error('Logout failed:', err);
            }
        });
    };
    return logOut;
}
