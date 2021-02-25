import { React } from '../../deps.ts';

// contains local login and all the strategies

const Modal = (props:any) => {
  const setLogin = props.setLogin;
  const [loginData, setLoginData] = (React as any).useState(['','']);

  const inputgetter = (event:any) => {
    const oldLoginData = loginData;
    if (event.target.id === 'username') oldLoginData[0] = event.target.value;
    if (event.target.id === 'password') oldLoginData[1] = event.target.value;
    return setLoginData(oldLoginData);
  }

  const localSignUp = () => {
    const postOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginData[0],
        password: loginData[1]
      })
    };
    console.log('sending user data');
    setLoginData(['','']);
    fetch(`http://localhost:3000/signup`, postOptions)
    .then( data => data.json())
    .then (parsed => setLogin(parsed))
  };

  const localLogin = () => {
    const postOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginData[0],
        password: loginData[1]
      })
    };
    console.log('abouttofetch');
    setLoginData(['','']);
    fetch(`http://localhost:3000/local`, postOptions)
    .then( data => data.json())
    .then (parsed => {
      console.log('parsed in modal', parsed);
      setLogin(parsed);
    })
      // .catch((error) => console.log('error: ', error));
  };
  return (
    <div id="modal">
      <div id='modalWindow'>
        <form id='locallogin'>
          <div id='forms'>
            <div id='userForm'>
              <input id='username' onChange={inputgetter} placeholder='Username'/>
            </div>
            <div id='passForm'>
              <input type='password' id='password' onChange={inputgetter} placeholder='Password'/>
            </div>
          </div>
          <div id="buttons">
            <button type='button' onClick={localLogin} id='login'>Login</button>
            <button type='button' onClick={localSignUp} id='signIn'>Sign Up</button>
          </div>
        </form>
        <div id="oauthBox">
          <div className="Oauth" id="google">
            <a href="/google">
              <img id='googleIcon'
                src="https://imgur.com/RYSAZ5u.png"
              ></img>
            </a>
          </div>
          <div className="Oauth" id="facebook">
            <a href="/facebook">
              <img id='facebookIcon'
                src="https://imgur.com/op8yWLb.png"
              ></img>
            </a>
          </div>
          <div className="Oauth" id="github">
            <a href="/github">
              <img id='githubIcon'
                src="https://imgur.com/aMAH3BW.png"
              ></img>
            </a>
          </div>
          <div className="Oauth" id="spotify">
            <a href="/spotify">
              <img id='spotifyIcon'
                src="https://imgur.com/tyzNIXw.png"
              ></img>
            </a>
          </div>
          <div className="Oauth" id="linkedin">
            <a href="/linkedin">
              <img id='linkedinIcon'
                src="https://imgur.com/9qcbtcv.png"
              ></img>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;