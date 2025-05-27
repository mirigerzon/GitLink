import { useState } from 'react';
import { CurrentUser } from './App';
import { logOut } from './LogOut';
function profile(gitName) {
    const { currentUser } = useContext(CurrentUser);
    const [isChange, setIsChange] = useState(0);
    const [programmerData, setProgrammerData] = useState([]);
    useEffect(() => {
        setIsChange(0);
        fetchData({
            type: "programmers",
            params: { git_name: gitName },
            onSuccess: (data) => setProgrammerData(data),
            onError: (err) => setError(`Failed to fetch posts: ${err}`),
            logOut,
        });
    }, [currentUser.id, isChange]);

    return (
        <div className='programmerData'>
            if (gitName == currentUser.git_name) {
                <button></button>
            }
        </div>
    )
}

export default profile;