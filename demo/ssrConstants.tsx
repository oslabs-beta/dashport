import { React, ReactDOMServer } from "./deps.ts";
import App from '../demo/views/App.tsx'
import MainContainer from '../demo/views/components/MainContainer.tsx';
import NavBar from '../demo/views/components/NavBar.tsx';
import Protected from '../demo/views/components/Protected.tsx'
import Modal from '../demo/views/components/Modal.tsx'

const body = (ReactDOMServer as any).renderToString(<App />);
const protectedPage = (ReactDOMServer as any).renderToString(<Protected />);

const html: string = 
`<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/test.js"></script>
    <link rel="stylesheet" href="style.css" type="text/css">
    <title>Dashport</title>
  </head>
  <body>
    <div id="root">
      ${body}
    </div>
  </body>
</html>`

const ReactComponents: string = 
`import React from "https://dev.jspm.io/react@16.14.0";
\nimport ReactDOM from "https://dev.jspm.io/react-dom@16.14.0";
\nconst NavBar = ${NavBar};
\nconst Modal = ${Modal};
\nconst MainContainer = ${MainContainer};
\nReactDOM.hydrate(React.createElement(${App}), document.getElementById("root"));`;

export { html, ReactComponents, protectedPage }