import {React} from "../deps.ts";
import MainContainer from '../views/components/MainContainer.tsx'
import NavBar from '../views/components/NavBar.tsx'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      button: any;
      img: any;
      input: any;
      div: any;
      h1: any;
      h3: any;
      p: any;
      span: any;
      form: any;
      label: any;
      a: any;
    }
  }
}

function App() {
  return (
    <div >
      <div style={{position: "relative", left: "10.5rem", marginTop:"4rem"}}>
        <img src='https://i.imgur.com/6wdVrZ1.png' id='dashportIcon'></img>
          <div id='homeContainer'>
            <div>Welcome to Dashport!</div>
            <NavBar/>
            {/* <MainContainer/> */}
          </div>
      </div>
    </div>
  )
}


export default App;
