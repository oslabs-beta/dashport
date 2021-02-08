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
    }
  }
}

function App() {
  return (
    <div>
      <div>Welcome to Dashport!</div>
      <NavBar/>
      <MainContainer/>
    </div>
  )
}


export default App;
