
import { React } from '../../deps.ts';

const NavBar = () => {
  const [clicked, setClick] = (React as any).useState(false)

  const openLogin = () => {
    if (clicked === false) {
      setClick(true)
    } else {
      setClick(false)
    }
  }

  return (
    <div>
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
}

export default NavBar;
