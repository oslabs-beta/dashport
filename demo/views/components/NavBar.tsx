// on load, check if user is logged in
  // if they aren't, load  the login button
  // if they are, load a logout button and a button that routes to the protected page

import { React } from '../../deps.ts';
import Modal from '../components/Modal.tsx';

const NavBar = () => {
  const [loggedIn, setLogin] = (React as any).useState([false,'']);

  (React as any).useEffect(() => {
    fetch('http://localhost:3000/authcheck')
      .then( data => data.json())
      .then( parsed => setLogin(parsed))
  },loggedIn);

  const logOut = () => {
    const options = {
      method:'DELETE'
    };
    console.log('abouttofetch');
    fetch(`http://localhost:3000/logout`, options)
    .then( data => data.json())
    .then (parsed => setLogin(parsed))
  };


    return (
      <div>
      {!loggedIn[0] && (<Modal setLogin={setLogin} />)}
      {loggedIn[0] && (
        <div>
           <p id='authorizedstatement'>You have been authorized by {loggedIn[1]}!</p>
          <img src='https://i.imgur.com/86nba6E.png' id='authorizedimg' />
          <button onClick={logOut} id='logOutButton'>Log Out</button> 
        </div>
      )}
      </div>
    )
}

export default NavBar;