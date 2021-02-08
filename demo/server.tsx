//import modules
// https://oakserver.github.io/oak/
import { Application, Session, send, join, log } from './deps.ts'
import { html, ReactComponents } from './ssrConstants.tsx';
import router from "./routes.ts";
import Dashport from '../lib/dashport.ts'


// import in Dashport and setup

//server middlewares

// SSR
// session with Server Memory

const port = 3000;
const app: Application = new Application();
const dashport = new Dashport();
app.use(dashport.initialize())

// session with Redis Database
const session: Session = new Session({
  framework: "oak",
  store: "redis",
  hostname: "127.0.0.1",
  port: 6379,
});

// Initialize Session
await session.init();
app.use(session.use()(session));

// Initialize Session

// function one () {
//   console.log('1')
//   new Promise (two());
//   console.log('3')
// }

// function two() {
//   console.log('2')
// }
// // ------------------------------------------------>
// async function one () {
//   console.log('1')
//   await two();
//   console.log('3')
// }

// function two() {
//   console.log('2')
// }


// Initialize Dashport fater sesssion

// router
app.use(router.routes());
app.use(router.allowedMethods());

//Error handler
app.use(async (ctx, next) => {
  try{
    await next();
  } catch (error) {
    console.log('in error handling with error', error);
    throw error;
  }
});

//response tracking
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${ctx.request.method} ${ctx.request.url} - Response Time = ${rt}`
  );
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

//page routing
app.use((ctx) => {

   if (ctx.request.url.pathname === '/') { 
     ctx.response.type = `text/html`
     ctx.response.body = html
   }  else if (ctx.request.url.pathname === '/test.js') {
      ctx.response.type = "application/javascript"
      ctx.response.body = ReactComponents
   }
});



// Do we wanna track response time?
// no? okay




// 


//listening on port
await app.listen({ port });



//denon run --allow-all --unstable demo/server.tsx
//deno install -qAf --unstable https://deno.land/x/denon/denon.ts