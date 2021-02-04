import { React, ReactDOMServer } from "./deps.ts";
import App from '../demo/views/App.tsx'
import MainContainer from '../demo/views/components/MainContainer.tsx';
import NavBar from '../demo/views/components/NavBar.tsx';

const body = (ReactDOMServer as any).renderToString(<App />);


const html: string = 
`<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/test.js"></script>

    <title>Dashport</title>
  </head>
  <body>
    <div id="root">
      <div>Welcome to Dashboard!</div>
      ${body}
    </div>
  </body>
</html>`

const ReactComponents: string = 
`import React from "https://dev.jspm.io/react@16.14.0";
\nimport ReactDOM from "https://dev.jspm.io/react-dom@16.14.0";
\nconst NavBar = ${NavBar};
\nconst MainContainer = ${MainContainer};
\nReactDOM.hydrate(React.createElement(${App}), document.getElementById("root"));`;

export { html, ReactComponents }