import {React} from "../deps.ts";
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
          <div id='homeContainer'>
            <NavBar/>
          </div>
      </div>
    </div>
  )
}


export default App;
