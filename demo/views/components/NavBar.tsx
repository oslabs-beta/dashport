// on load, check if user is logged in
  // if they aren't, load  the login button
  // if they are, load a logout button and a button that routes to the protected page


import { React } from '../../deps.ts';

const NavBar = () => {
  const [clicked, setClick] = (React as any).useState(false)
  const [loggedIn, setLogin] = (React as any).useState(false)

  const openLogin = () => {
    if (clicked === false) {
      setClick(true)
    } else {
      setClick(false)
    }
  }

  const setUserLogin = () => {
    if(!loggedIn) setLogin(true);
    else setLogin(false);
  } 

  const test = () => {
    if (!loggedIn) {
      setLogin(true)
    } else if(loggedIn) {
      setLogin(false)
    }
  }

  if (!loggedIn) {
    return (
      <div>
          <button onClick={setUserLogin} className='button'>Change Page View</button>
          <button onClick={openLogin} id='loginButton'>Login/Sign In Options</button>
          {clicked && (
            <div>
            <form id='form'>
              <div id='userForm'>
                <input placeholder='Username'/>
              </div>
              <div id='passForm'>
                <input placeholder='Password'/>
              </div>
              <button type='button' id='login'>Login</button>
              <button type='button' id='signIn'>Sign Up</button>
            </form>
              <span>
                  <a href="/test">
                    <img id='googleIcon'
                      src="https://i.imgur.com/PHJ6j1E.png"
                    ></img>
                  </a>
              </span>
            </div>
          )}
      </div>
    )
  } else {
    return (
      <div>
          <button onClick={setUserLogin} className='button'>Change Page View</button>
          <button onClick={openLogin} className='button'>Log Out</button>
          <button>Redirect to Protected Page</button>
      </div>
    )
  }
}

export default NavBar;
