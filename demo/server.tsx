import { Application, send, join } from './deps.ts'
import { html, ReactComponents, protectedPage } from './ssrConstants.tsx';
import { googleSecrets, linkedInSecrets, spotifySecrets, facebookSecrets, gitHubSecrets } from './demoSecrets.ts'
import router from "./routes.ts";
import Dashport from '../lib/dashport.ts';
import LocalStrategy from 'https://deno.land/x/dashport_localauth@v1.0.0/mod.ts'
import GoogleStrategy from 'https://deno.land/x/dashport_google@v1.0.0/mod.ts'
import GitHubStrategy from 'https://deno.land/x/dashport_github@v1.0.1/mod.ts';
import FacebookStrategy from 'https://deno.land/x/dashport_facebook@v1.0.0/mod.ts'
import LinkedInStrategy from 'https://deno.land/x/dashport_linkedin@v1.0.2/mod.ts'
import SpotifyStrategy from 'https://deno.land/x/dashport_spotify@v1.0.0/mod.ts'
import pgclient from './models/userModel.ts'

const port = 3000;
const app: Application = new Application();
const dashport = new Dashport('oak');

// Error handling
app.use(async (ctx: any, next: any) => {
  debugger;
  try{
    await next();
  } catch (error) {
    console.log('server err', error);
    throw error;
  }
});

app.use(dashport.initialize);

app.use(router.routes());
app.use(router.allowedMethods());

dashport.addStrategy('google', new GoogleStrategy({
  client_id:googleSecrets.client_id,
  redirect_uri: googleSecrets.redirect_uri, 
  response_type: 'code', 
  scope: 'profile email openid',
  client_secret: googleSecrets.client_secret,
  grant_type: 'authorization_code',
}));

dashport.addStrategy('facebook', new FacebookStrategy({
  client_id: facebookSecrets.client_id, 
  client_secret: facebookSecrets.client_secret, 
  redirect_uri: facebookSecrets.redirect_uri, 
  state: '12345'
}));

dashport.addStrategy('github', new GitHubStrategy({
  client_id: gitHubSecrets.client_id, 
  client_secret: gitHubSecrets.client_secret, 
  redirect_uri: gitHubSecrets.redirect_uri,
  scope: 'read:user',  
}));

dashport.addStrategy('spotify', new SpotifyStrategy({
  client_id: spotifySecrets.client_id, 
  client_secret: spotifySecrets.client_secret, 
  redirect_uri: spotifySecrets.redirect_uri,
  response_type: 'code', 
  scope: 'user-read-email user-read-private',
  state: '2021',
}));

dashport.addStrategy('local', new LocalStrategy({
  usernamefield:'username', 
  passwordfield:'password', 
  authorize: async (curData:any) =>{
    const data = await pgclient.queryArray(`SELECT * FROM users WHERE username='${curData.username}' AND password='${curData.password}'`) || null;
    if (!data.rows) return new Error("Username or Password is incorrect");
    const userInfo:any = {provider:'local', providerUserId:data.rows[0][0], displayName:data.rows[0][1]};
    return userInfo; 
  }, }));

  dashport.addStrategy('linkedin', new LinkedInStrategy({
    client_id: linkedInSecrets.client_id, 
    client_secret: linkedInSecrets.client_secret, 
    redirect_uri: linkedInSecrets.redirect_uri, 
    response_type: 'code', 
    scope: 'r_liteprofile%20r_emailaddress%20w_member_social',
    grant_type: 'authorization_code',
  }));

dashport.addSerializer('mathRand', (userData: any) => Math.random() * 10000);


function init (app:any) {
  router.get('/newDynamic', (ctx:any, next:Function) => ctx.response.redirect('/protected'));
}

router.get('/dynamic', (ctx:any, next:Function) => { init(app); ctx.response.redirect('/')})


router.get('/google', 
  dashport.authenticate('google'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/facebook', 
  dashport.authenticate('facebook'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/spotify', 
  dashport.authenticate('spotify'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/github', 
  dashport.authenticate('github'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.post('/local', 
  dashport.authenticate('local'),
  (ctx: any, next: any) => {
    ctx.response.type = 'text/json';
    ctx.response.body = JSON.stringify(true);
  }
);

router.get('/linkedin', 
  dashport.authenticate('linkedin'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
);

router.post('/signup', 
  async (ctx:any, next: any)=>{ 
    let userInfo:any = await ctx.request.body(true).value;
    await pgclient.queryArray(`INSERT INTO users(username, password) VALUES ('${userInfo.username}', '${userInfo.password}')`);
    return next();
  }, 
  dashport.authenticate('local'),
  (ctx: any, next: any) => {
    ctx.response.type = 'text/json';
    ctx.response.body = JSON.stringify(true);
  }
);

router.get('/protected',
  (ctx: any, next: any) => {
    if(!ctx.state._dashport.session){
      ctx.response.body = 'You need to log in first. Please try again'
    } else {
      ctx.response.type = `text/html`
      ctx.response.body = protectedPage
    };
  }
);

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

// page routing
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
        // TODO FIX: Currently have to "deno run --unstable -A demo/server.tsx" from /dashport
        // Unable to "deno run --unstable -A server.tsx" from /dashport/demo
        root: join(Deno.cwd(), "demo/views/assets"),
      });
   }
});

// listening on port
app.addEventListener('listen', () => { console.log(`Server live on port ${port}`) });
app.listen({ port });

// denon run --allow-all --unstable demo/server.tsx
// deno install -qAf --unstable https://deno.land/x/denon/denon.ts
