import { React } from "../../deps.ts"

const NavBar: any = (props: any) => {
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
      <button onClick={openLogin}>Login/Sign In Options</button>
      {clicked && (
        <div>
        <form >
          <div>
            <label>Username</label>
            <input/>
          </div>
          <div>
            <label>Password</label>
            <input/>
          </div>
          <button type='button'>Login</button>
          <button type='button'>Sign Up</button>
        </form>
        <button>Sign in with Google</button>
        </div>
      )}
      
    </div>
  )
}

export default NavBar;
