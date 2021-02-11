//import modules
// https://oakserver.github.io/oak/
import { Application, Session, send, join, log } from './deps.ts'
import { html, ReactComponents } from './ssrConstants.tsx';
import router from "./routes.ts";
import Dashport from '../lib/dashport.ts'
import GoogleStrat from '../lib/strategies/ScratchGoogle.ts'

// oauth2Client.code.getAuthorizationUri()
  /** Builds a URI you can redirect a user to to make the authorization request. */
  // public getAuthorizationUri(options: GetUriOptions = {}): URL {
  //   const params = new URLSearchParams();
  //   params.set("response_type", "code");
  //   params.set("client_id", this.client.config.clientId);
  //   if (typeof this.client.config.redirectUri === "string") {
  //     params.set("redirect_uri", this.client.config.redirectUri);
  //   }
  //   const scope = options.scope ?? this.client.config.defaults?.scope;
  //   if (scope) {
  //     params.set("scope", Array.isArray(scope) ? scope.join(" ") : scope);
  //   }
  //   if (options.state) {
  //     params.set("state", options.state);
  //   }
  //   return new URL(`?${params}`, this.client.config.authorizationEndpointUri);
  // }


// import in Dashport and setup

//server middlewares

// SSR
// session with Server Memory

const port = 3000;
const app: Application = new Application();
const dashport = new Dashport('oak');
// app.use(dashport.initialize())

// Initialize Dashport fater sesssion
// router
app.use(router.routes());
app.use(router.allowedMethods());

///////////////////////////////////////////// Testing out dashport.authenticate
// class AlvinTest {
//   async authorize(ctx: any, next: any) {
//     ctx.state._dashingportingtest = { 'test': 'hey' }
//     await next();
//   }
// }

//client_id=1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com&redirect_uri,localhost:3000/testresponse_type,tokenscope,https://www.googleapis.com/auth/userinfo.email

dashport.addStrategy('google', new GoogleStrat({
  client_id:'1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com',
  redirect_uri: 'http://localhost:3000/test', 
  response_type: 'code', 
  scope: 'profile email openid',
  client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
  grant_type: 'authorization_code',
}, () => null));
/*
Google OAuth2 API, v2
Scopes
https://www.googleapis.com/auth/userinfo.email	View your email address
https://www.googleapis.com/auth/userinfo.profile	See your personal info, including any personal info you've made publicly available
openid
CODE APPROVAL URI
http://localhost:3000/#access_token=ya29.a0AfH6SMAWQMs11uEsfnV5J7SOZyhpkaJCeD0BzQUs7_es-jv7hUyNmTZ4yNTSTjlnJlex87HaRy0sZWdY2cMSfyqwJna4aTAyv7ke2QvC1q9C5lyx3mcZj2r6r9y6hoZoeAjXnCz6rORQ5-2SoVmRtBoADxaIYh_v4Z-LLOqf4-M&
token_type=Bearer&
expires_in=3599&
scope=email%20openid%20https://www.googleapis.com/auth/userinfo.email&authuser=0&
prompt=none

*/

router.get('/test', 
  dashport.authenticate('google'),
  dashport.test,
  (ctx: any, next: any) => {
    console.log('server 83', ctx.response.url)
    ctx.response.body = 'Hello Waye';
  }
)

router.get('/params', 
  dashport.test,
  async (ctx: any, next: any) => {
    await next();
  }
)

// router.get('/:objectData', 
//   dashport.test,
//   (ctx: any, next: any) => {
//     ctx.response.body = 'Hello World';
//   }
// )
////////////////////////////////////////////////////////////

//Error handling
app.use(async (ctx: any, next: any) => {
  try{
    await next();
  } catch (error) {
    console.log('server 108', error);
    throw error;
  }
});

//response tracking
app.use(async (ctx: any, next: any) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log( 
    `${ctx.request.method} ${ctx.request.url} - Response Time = ${rt}`
  );
});

app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

//page routing
app.use(async (ctx: any) => {
   if (ctx.request.url.pathname === '/') { 
     ctx.response.type = `text/html`
     ctx.response.body = html
   }  else if (ctx.request.url.pathname === '/test.js') {
      ctx.response.type = "application/javascript"
      ctx.response.body = ReactComponents
   }  else if (ctx.request.url.pathname === '/style.css') {
      ctx.response.type = "text/css"
      await send(ctx, ctx.request.url.pathname, {
        root: join(Deno.cwd(), "demo/views/assets"),
      });
   }
});

//Error handler
app.use(async (ctx) => {
  ctx.throw(500);
});


//listening on port
app.addEventListener('listen', ()=>{console.log('server live on 3000')});
await app.listen({ port });


// session with Redis Database
// const session: Session = new Session({
//   framework: "oak",
//   store: "redis",
//   hostname: "127.0.0.1",
//   port: 6379,
// });

// Initialize Session
// await session.init();
// app.use(session.use()(session));


//denon run --allow-all --unstable demo/server.tsx
//deno install -qAf --unstable https://deno.land/x/denon/denon.ts