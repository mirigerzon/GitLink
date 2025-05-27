import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CurrentUser } from './App';
import { useLogOut } from './LogOut.jsx';
function Navigation() {
    const { currentUser } = useContext(CurrentUser);
    const logOut = useLogOut();
    return (
        <>
            {currentUser ? <div>
                <nav className='header'>
                    <div className="left">
                        <ul><Link to="/home" >Home</Link></ul>
                        <ul><Link to="/Jobs" >Jobs</Link></ul>
                        <ul><Link to="/Programmers" >Programmers</Link></ul>
                    </div>
                    <h3 className='userName'> Hello {currentUser.name}</h3>
                    <div className="right">
                        <ul onClick={logOut}><a>LogOut</a></ul>
                    </div>
                </nav>
            </div>
                :
                < nav className='header' >
                    <div className="left">
                        <ul><Link to="/home" >Home</Link></ul>
                        <ul><Link to="/Jobs" >Jobs</Link></ul>
                        <ul><Link to="/Programmers" >Programmers</Link></ul>
                    </div>
                    <div className="right">
                        <ul><Link to="/login" >Login</Link></ul>
                        <ul><Link to="/register" >Register</Link></ul>
                    </div>
                </nav >
            }
        </>
    )
}
export default Navigation;