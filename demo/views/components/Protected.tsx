import { React } from "../../deps.ts"



const Protected = () => {
  const goHome = () => {
    
  }

  return (
    <div id='protectedBox'>
      <div>You are Protected!</div>
      <img src='https://i.imgur.com/6epSxdD.png'></img>
      <button className='button' ><a href="/">Go Home</a></button>
    </div>
  )
}

export default Protected;
